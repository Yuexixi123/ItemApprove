import { App } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import { useCallback } from 'react';

// 通用创建函数参数接口
export interface TableCreateParams<D> {
  // 创建API函数
  api: (data: D) => Promise<API.BaseResponse>;
  // 创建所需数据
  data: D;
  // 表格ActionRef，用于刷新表格
  actionRef?: React.MutableRefObject<ActionType | undefined>;
  // 创建成功后的消息（如果不提供则使用接口返回的msg）
  successMsg?: string;
  // 创建失败后的消息（如果不提供则使用接口返回的msg）
  errorMsg?: string;
  // 创建成功后的回调函数
  onSuccess?: (response: any, data?: D) => void;
  // 创建失败后的回调函数
  onError?: (error: any, data?: D) => void;
  // 是否自动刷新表格
  autoRefresh?: boolean;
}

/**
 * 通用表格创建Hook
 * @returns 创建函数
 */
export const useTableCreate = () => {
  const { message } = App.useApp();

  // 使用useCallback确保函数引用稳定
  const handleCreate = useCallback(
    <D = any>(options: TableCreateParams<D>): Promise<boolean> => {
      const {
        api,
        data,
        actionRef,
        successMsg,
        errorMsg = '创建失败',
        onSuccess,
        onError,
        autoRefresh = true,
      } = options;

      return new Promise((resolve) => {
        // Move the async logic inside the executor function
        const executeCreate = async () => {
          const response = await api(data);

          if (response && response.inside_code === 0) {
            // 优先使用接口返回的消息，如果没有则使用传入的successMsg
            message.success(response.msg || successMsg || '创建成功');
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
        };

        // Execute the async function
        executeCreate();
      });
    },
    [message],
  );

  return handleCreate;
};
