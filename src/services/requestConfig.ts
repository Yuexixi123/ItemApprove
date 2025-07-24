import { history, type RequestConfig, type RequestOptions } from '@umijs/max';
import { notification } from 'antd';
import qs from 'qs';

// 扩展RequestOptions类型
interface ExtendedRequestOptions extends RequestOptions {
  debounceTime?: number;
  immediate?: boolean;
  startTime?: number;
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
const DEFAULT_USER_ID = process.env.DEFAULT_USER_ID || '5690';
const MAX_CACHE_SIZE = 1000;
const CLEANUP_INTERVAL = 5 * 60 * 1000; // 5分钟

// API基础URL
export const SERVICE_API_URL = process.env.API_BASE_URL || '/api';

// 统一的错误处理函数
const handleRequestError = (error: any, requestKey: string) => {
  // 请求失败后，从映射中删除该请求（除非是被取消的请求）
  if (!error.name || error.name !== 'AbortError') {
    requestCancelMap.delete(requestKey);

    // 记录错误日志（仅在开发环境）
    if (process.env.NODE_ENV === 'development') {
      console.error(`请求错误 ${requestKey}:`, error);
    }

    // 检查错误是否已经被处理过
    const isErrorHandled = error.config && error.config._errorHandled;

    // 如果错误已经被处理过，则不再显示错误信息
    if (!isErrorHandled) {
      // 处理HTTP错误状态
      if (error.response) {
        const status = error.response.status;
        const errorMessage = HTTP_STATUS_MESSAGES[status] || `未知错误`;

        // 特殊处理401未授权的情况
        if (status === 401) {
          localStorage.removeItem('access_token');
          notification.error({
            message: '登录状态',
            description: '登录已过期，请重新登录',
          });
          // 统一使用history.push进行路由跳转
          setTimeout(() => {
            history.push('/user/login');
          }, 1500);
        } else {
          notification.error({
            message: '请求错误',
            description: errorMessage,
          });
        }
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        notification.error({
          message: '网络错误',
          description: '服务器无响应，请检查网络连接或稍后重试',
        });
      } else if (error.name !== 'AbortError') {
        // 如果不是取消的请求，显示错误信息
        notification.error({
          message: '请求错误',
          description: '请求发送失败，请稍后重试',
        });
      }
    }
  }
};

// 统一的成功处理函数
const handleRequestSuccess = (response: any, requestKey: string) => {
  // 请求成功后，从映射中删除该请求
  requestCancelMap.delete(requestKey);

  // 检查响应状态
  if (response && response.data) {
    const { success, msg } = response.data;
    if (success === false && msg) {
      // 使用notification替代message
      notification.error({
        message: '请求错误',
        description: msg,
      });
    }
  }

  return response;
};

// 创建请求处理函数
const createRequestHandler = (requestKey: string, options: ExtendedRequestOptions) => {
  // 如果存在相同的请求，则取消之前的请求
  if (requestCancelMap.has(requestKey)) {
    const controller = requestCancelMap.get(requestKey);
    controller?.abort();
  }

  // 创建新的 AbortController 并存储
  const controller = new AbortController();
  requestCancelMap.set(requestKey, controller);

  // 将 signal 添加到请求选项中
  options.signal = controller.signal;

  // 保存原始的回调函数
  const originalSuccess = options.getResponse ? options.success : undefined;
  const originalError = options.errorHandler;

  // 设置成功回调
  options.success = (response: any) => {
    const result = handleRequestSuccess(response, requestKey);
    if (originalSuccess) return originalSuccess(result);
    return result;
  };

  // 设置错误回调
  options.errorHandler = (error: any) => {
    handleRequestError(error, requestKey);
    if (originalError) return originalError(error);
    throw error;
  };

  return options;
};

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
      const userId = localStorage.getItem('userId');

      // 设置默认headers
      options.headers = {
        'Content-Type': 'application/json',
        // 添加用户信息到请求头
        'User-Id': userId || DEFAULT_USER_ID,
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

      // 获取防抖时间，默认为 DEFAULT_DEBOUNCE_TIME
      const debounceTime = options.debounceTime ?? DEFAULT_DEBOUNCE_TIME;

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

      // 如果需要防抖且不是立即执行
      if (debounceTime > 0 && !options.immediate) {
        // 返回一个 Promise，用于处理防抖逻辑
        return new Promise((resolve) => {
          // 如果已经存在相同请求的定时器，清除它
          if (debounceTimerMap.has(requestKey)) {
            clearTimeout(debounceTimerMap.get(requestKey)!);
          }

          // 设置新的定时器
          const timer = setTimeout(() => {
            // 定时器结束后删除
            debounceTimerMap.delete(requestKey);

            // 创建请求处理器
            const processedOptions = createRequestHandler(requestKey, options);

            // 防抖结束后，继续请求
            resolve({ url, options: processedOptions });
          }, debounceTime);

          // 存储定时器
          debounceTimerMap.set(requestKey, timer);
        });
      } else {
        // 不需要防抖或立即执行的情况
        const processedOptions = createRequestHandler(requestKey, options);
        return { url, options: processedOptions };
      }
    },
  ],

  // 响应拦截器
  responseInterceptors: [
    (response: any) => {
      // 检查响应数据
      const { data } = response;

      // 开发环境下记录响应日志
      if (process.env.NODE_ENV === 'development') {
        console.log(
          `[Response] ${response.config?.method?.toUpperCase()} ${response.config?.url}`,
          {
            status: response.status,
            data: response.data,
          },
        );
      }

      // 检查HTTP状态码，处理所有非200的状态码
      if (response.status !== 200) {
        const errorMessage =
          HTTP_STATUS_MESSAGES[response.status] || `未知错误(状态码:${response.status})`;
        notification.error({
          message: '请求错误',
          description: errorMessage,
        });

        // 创建一个已处理标记，防止重复处理
        response.config._errorHandled = true;
      }

      // 如果响应中包含错误信息但没有被前面的拦截器处理
      if (data && data.success === false && data.msg) {
        // 这里不再显示错误信息，因为已经在success回调中处理了
        if (process.env.NODE_ENV === 'development') {
          console.log(`响应拦截器捕获到业务错误: ${data.msg}`);
        }
      }

      return response;
    },
  ],

  // 统一的错误处理
  errorConfig: {
    // 错误抛出
    errorThrower: (res: any) => {
      const { success, data, msg, inside_code } = res;
      if (!success) {
        const error: any = new Error(msg);
        error.name = 'BizError';
        error.info = { inside_code, msg, data };
        throw error; // 抛出自制的错误
      }
    },
    // 错误接收及处理
    errorHandler: (error: any, opts: any) => {
      if (opts?.skipErrorHandler) throw error;

      // 已经被 errorThrower 处理过的错误
      if (error.name === 'BizError') {
        const errorInfo: any = error.info;
        if (errorInfo) {
          const { msg } = errorInfo;
          notification.error({
            message: '业务错误',
            description: msg || '未知业务错误',
          });
        }
      } else if (error.response) {
        // Axios 的错误
        // 请求成功发出且服务器也响应了状态码，但状态码超出了 2xx 的范围
        const { status } = error.response;
        const errorMessage = HTTP_STATUS_MESSAGES[status] || `未知错误`;

        // 特殊处理401未授权的情况
        if (status === 401) {
          localStorage.removeItem('access_token');
          notification.error({
            message: '登录状态',
            description: '登录已过期，请重新登录',
          });
          // 统一使用history.push进行路由跳转
          setTimeout(() => {
            history.push('/user/login');
          }, 1500);
        } else {
          notification.error({
            message: '请求错误',
            description: errorMessage,
          });
        }
      } else if (error.request) {
        // 请求已经成功发起，但没有收到响应
        notification.error({
          message: '网络错误',
          description: '服务器无响应，请检查网络连接或稍后重试',
        });
      } else {
        // 发送请求时出了点问题
        notification.error({
          message: '请求错误',
          description: error.message || '请求发送失败，请稍后重试',
        });
      }

      throw error; // 如果需要错误继续抛出，可以加上这一行
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
