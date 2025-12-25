import { App } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import { useCallback } from 'react';

// 通用更新函数参数接口
export interface TableUpdateParams<D> {
  // 更新API函数
  api: (data: D) => Promise<API.BaseResponse>;
  // 更新所需数据
  data: D;
  // 表格ActionRef，用于刷新表格
  actionRef?: React.MutableRefObject<ActionType | undefined>;
  // 更新成功后的消息（如果不提供则使用接口返回的msg）
  successMsg?: string;
  // 更新失败后的消息（如果不提供则使用接口返回的msg）
  errorMsg?: string;
  // 更新成功后的回调函数
  onSuccess?: (response: any, data?: D) => void;
  // 更新失败后的回调函数
  onError?: (error: any, data?: D) => void;
  // 是否自动刷新表格
  autoRefresh?: boolean;
}

/**
 * 通用表格更新Hook
 * @returns 更新函数
 */
export const useTableUpdate = () => {
  const { message } = App.useApp();

  // 使用useCallback确保函数引用稳定
  const handleUpdate = useCallback(
    <D = any>(options: TableUpdateParams<D>): Promise<boolean> => {
      const {
        api,
        data,
        actionRef,
        successMsg,
        errorMsg = '更新失败',
        onSuccess,
        onError,
        autoRefresh = true,
      } = options;

      return new Promise((resolve) => {
        const executeUpdate = async () => {
          try {
            const response = await api(data);
            if (response && response.inside_code === 0) {
              // 优先使用接口返回的消息，如果没有则使用传入的successMsg
              message.success(response.msg || successMsg || '更新成功');
              // 如果提供了actionRef且autoRefresh为true，刷新表格
              if (autoRefresh && actionRef && actionRef.current) {
                actionRef.current.reload();
              }
              // 调用成功回调
              onSuccess?.(response, data);
              resolve(true);
              return;
            }

            // 优先使用接口返回的错误消息，如果没有则使用传入的errorMsg
            message.error(response?.msg || errorMsg);
            // 调用错误回调
            onError?.(response, data);
            resolve(false);
          } catch (error: any) {
            console.error('更新请求异常:', error);
            message.error(error?.message || errorMsg);
            onError?.(error, data);
            resolve(false);
          }
        };

        // 执行异步函数
        executeUpdate();
      });
    },
    [message],
  );

  return handleUpdate;
};

export default useTableUpdate;
