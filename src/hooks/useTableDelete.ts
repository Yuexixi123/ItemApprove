import { App } from 'antd';
import type { ActionType } from '@ant-design/pro-components';
import { useCallback } from 'react';

// 通用删除函数参数接口
export interface TableDeleteParams<T = any> {
  // 删除API函数
  api: (params: any) => Promise<API.BaseResponse>;
  // 删除所需参数
  params: any;
  // 表格ActionRef，用于刷新表格
  actionRef?: React.MutableRefObject<ActionType | undefined>;
  // 删除成功后的消息
  successMsg?: string;
  // 删除失败后的消息
  errorMsg?: string;
  // 确认对话框标题
  confirmTitle?: string;
  // 确认对话框内容
  confirmContent?: string;
  // 删除成功后的回调函数
  onSuccess?: (response: any, record?: T) => void;
  // 删除失败后的回调函数
  onError?: (error: any, record?: T) => void;
  // 记录数据，用于自定义确认内容
  record?: T;
}

/**
 * 通用表格删除Hook
 * @returns 删除函数
 */
export const useTableDelete = () => {
  const { message, modal } = App.useApp();

  // 使用useCallback确保函数引用稳定
  const handleDelete = useCallback(
    <T = any>(options: TableDeleteParams<T>): Promise<boolean> => {
      const {
        api,
        params,
        actionRef,
        successMsg = '删除成功',
        errorMsg = '删除失败',
        confirmTitle = '确认删除',
        confirmContent = '确定要删除此项吗？',
        onSuccess,
        onError,
        record,
      } = options;

      return new Promise((resolve) => {
        modal.confirm({
          title: confirmTitle,
          content: confirmContent,
          okText: '确认',
          cancelText: '取消',
          onOk: async () => {
            const response = await api(params);

            if (response && response.inside_code === 0) {
              message.success(successMsg);
              // 如果提供了actionRef，刷新表格
              if (actionRef && actionRef.current) {
                actionRef.current.reload();
              }
              // 调用成功回调
              onSuccess?.(response, record);
              resolve(true);
              return;
            }

            message.error(response?.msg || errorMsg);
            // 调用错误回调
            onError?.(response, record);
            resolve(false);
          },
          onCancel: () => {
            resolve(false);
          },
        });
      });
    },
    [message, modal],
  );

  return handleDelete;
};
