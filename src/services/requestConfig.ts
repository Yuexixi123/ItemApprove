import { history, type RequestConfig, type RequestOptions } from '@umijs/max';
import qs from 'qs';
import { showNotification } from '@/utils/notification';

// 扩展RequestOptions类型
interface ExtendedRequestOptions extends RequestOptions {
  debounceTime?: number;
  immediate?: boolean;
  startTime?: number;
  skipErrorHandler?: boolean; // 跳过默认错误处理
  keepPrevious?: boolean; // 是否保留上一次的请求（不取消）
}

// 定义HTTP状态码对应的错误信息
const HTTP_STATUS_MESSAGES: Record<number, string> = {
  400: '请求参数错误',
  401: '未授权，请重新登录',
  403: '拒绝访问',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  409: '资源冲突',
  422: '请求参数验证失败',
  500: '服务器内部错误',
  501: '服务未实现',
  502: '网关错误',
  503: '服务不可用',
  504: '网关超时',
};

// 创建一个全局的请求取消映射
const requestCancelMap = new Map<string, AbortController>();
// 创建一个防抖定时器映射
const debounceTimerMap = new Map<string, NodeJS.Timeout>();

// 配置常量
const DEFAULT_DEBOUNCE_TIME = Number(process.env.REQUEST_DEBOUNCE_TIME) || 300;
const REQUEST_TIMEOUT = Number(process.env.REQUEST_TIMEOUT) || 15000;
const MAX_CACHE_SIZE = 1000;
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5分钟

// API基础URL
export const SERVICE_API_URL = process.env.API_BASE_URL || '/api/v1';

// 定期清理机制，防止Map无限增长
setInterval(() => {
  if (requestCancelMap.size > MAX_CACHE_SIZE) {
    // 清理一半的缓存
    const entries = Array.from(requestCancelMap.entries());
    const toDelete = entries.slice(0, Math.floor(entries.length / 2));
    toDelete.forEach(([key, controller]) => {
      controller.abort();
      requestCancelMap.delete(key);
    });

    if (process.env.NODE_ENV === 'development') {
      console.log(`清理了 ${toDelete.length} 个请求缓存`);
    }
  }
}, CLEANUP_INTERVAL);

/**
 * @name 请求配置
 * 它基于 axios 和 ahooks 的 useRequest 提供了一套统一的网络请求和错误处理方案。
 * @doc https://umijs.org/docs/max/request#配置
 */
export const requestConfig: RequestConfig = {
  // 设置请求的前缀
  baseURL: SERVICE_API_URL,
  withCredentials: true,
  // 处理url params转义
  paramsSerializer: function (params) {
    return qs.stringify(params, { arrayFormat: 'brackets' });
  },
  timeout: REQUEST_TIMEOUT,

  // 请求拦截器
  requestInterceptors: [
    (url: string, options: ExtendedRequestOptions) => {
      // 获取本地存储的token
      const token = localStorage.getItem('access_token');

      // 设置默认headers
      options.headers = {
        'Content-Type': 'application/json',
        // 添加用户信息到请求头
        ...options.headers,
      };

      if (token) {
        // 给每个请求添加Authorization头
        options.headers.Authorization = `Bearer ${token}`;
      }

      // 创建请求标识，用于识别重复请求
      const method = options.method || 'GET';
      const params = options.params ? JSON.stringify(options.params) : '';
      const data = options.data ? JSON.stringify(options.data) : '';
      const requestKey = `${method}:${url}:${params}:${data}`;

      // 1. 处理取消逻辑：如果存在相同的请求，则取消之前的请求 (除非设置了 keepPrevious)
      if (!options.keepPrevious) {
        if (requestCancelMap.has(requestKey)) {
          const controller = requestCancelMap.get(requestKey);
          controller?.abort();
        }
        // 创建新的 AbortController 并存储
        const controller = new AbortController();
        requestCancelMap.set(requestKey, controller);
        // 将 signal 添加到请求选项中
        options.signal = controller.signal;
      }

      // 添加请求开始时间，用于计算请求耗时
      options.startTime = new Date().getTime();

      // 开发环境下记录请求日志
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Request] ${method} ${url}`, {
          params: options.params,
          data: options.data,
          headers: options.headers,
        });
      }

      // 2. 处理防抖逻辑
      const debounceTime = options.debounceTime ?? DEFAULT_DEBOUNCE_TIME;
      // 如果需要防抖且不是立即执行
      if (debounceTime > 0 && !options.immediate) {
        return new Promise((resolve) => {
          // 如果已经存在相同请求的定时器，清除它
          if (debounceTimerMap.has(requestKey)) {
            clearTimeout(debounceTimerMap.get(requestKey)!);
          }

          // 设置新的定时器
          const timer = setTimeout(() => {
            // 定时器结束后删除
            debounceTimerMap.delete(requestKey);
            // 防抖结束后，继续请求
            resolve({ url, options });
          }, debounceTime);

          // 存储定时器
          debounceTimerMap.set(requestKey, timer);
        });
      }

      return { url, options };
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response: any) => {
      // 这里的 response 是 AxiosResponse
      const { data, config } = response;
      // const requestKey = config?.url; // 简单使用 url 作为 key 清理，或者需要重新构建 key

      // 请求完成后清理 cancel map (这里只能简单清理，无法精确匹配 key，除非把 key 挂在 config 上)
      // 由于 key 构建复杂，这里暂不主动 delete，依赖定时清理或下次请求时的覆盖逻辑
      // 或者可以在 requestInterceptors 里把 requestKey 挂在 options 上

      // 开发环境下记录响应日志
      if (process.env.NODE_ENV === 'development') {
        console.log(`[Response] ${config?.method?.toUpperCase()} ${config?.url}`, {
          status: response.status,
          data: response.data,
        });
      }

      // 检查HTTP状态码 (Axios 默认 validateStatus 是 2xx，所以进入这里通常是 200)
      // 如果后端约定 200 但 success: false，则属于业务错误
      if (data && data.success === false) {
        // 抛出 BizError，交由 errorConfig 处理
        const error: any = new Error(data.msg || '业务处理失败');
        error.name = 'BizError';
        error.info = {
          inside_code: data.inside_code,
          msg: data.msg,
          data: data.data,
        };
        // 将 config 传递下去，以便 errorConfig 判断是否 skipErrorHandler
        error.config = config;
        throw error;
      }

      return response;
    },
  ],

  // 统一的错误处理
  errorConfig: {
    // 错误抛出 (主要用于处理类似 GraphQL 这种 200 包含 error 的情况，或者 adapter 转换)
    errorThrower: (res: any) => {
      const { success, data, msg, inside_code } = res;
      if (success === false) {
        const error: any = new Error(msg);
        error.name = 'BizError';
        error.info = { inside_code, msg, data };
        throw error;
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      // 如果配置了 skipErrorHandler，则直接抛出，不进行 UI 提示
      if (opts?.skipErrorHandler) throw error;

      // 忽略被取消的请求错误
      if (error.name === 'AbortError' || error.code === 'ERR_CANCELED') {
        return;
      }

      // 1. 处理业务错误 (BizError)
      if (error.name === 'BizError') {
        const errorInfo: any = error.info;
        if (errorInfo) {
          const { msg } = errorInfo;
          showNotification.error({
            message: '业务错误',
            description: msg || '未知业务错误',
          });
        }
        return; // 业务错误处理完毕
      }

      // 2. 处理 HTTP 响应错误 (AxiosError)
      if (error.response) {
        const { status } = error.response;
        const errorMessage = HTTP_STATUS_MESSAGES[status] || `未知错误`;

        // 特殊处理401未授权的情况
        if (status === 401) {
          // 防止重复跳转，这里可以加个锁，或者由 history 自身处理
          localStorage.removeItem('access_token');
          showNotification.error({
            message: '登录状态',
            description: '登录已过期，请重新登录',
          });
          // 延迟跳转让用户看清提示
          setTimeout(() => {
            history.push('/user/login');
          }, 1000);
        } else {
          showNotification.error({
            message: '请求错误',
            description: errorMessage,
          });
        }
      }
      // 3. 处理无响应的网络错误
      else if (error.request) {
        showNotification.error({
          message: '网络错误',
          description: '服务器无响应，请检查网络连接或稍后重试',
        });
      }
      // 4. 其他错误
      else {
        showNotification.error({
          message: '请求错误',
          description: error.message || '请求发送失败，请稍后重试',
        });
      }
    },
  },
};

// 导出清理函数，供外部调用
export const clearRequestCache = () => {
  // 取消所有进行中的请求
  requestCancelMap.forEach((controller) => {
    controller.abort();
  });
  requestCancelMap.clear();

  // 清理所有防抖定时器
  debounceTimerMap.forEach((timer) => {
    clearTimeout(timer);
  });
  debounceTimerMap.clear();

  if (process.env.NODE_ENV === 'development') {
    console.log('已清理所有请求缓存和定时器');
  }
};

export default requestConfig;
