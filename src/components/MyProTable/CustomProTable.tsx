import { useRef, useState, useEffect, useCallback } from 'react';
import { ProTable } from '@ant-design/pro-components';
import type { ProTableProps, ActionType } from '@ant-design/pro-components';
import { App, Button } from 'antd';
import { debounce } from 'lodash-es';
import { saveColumnSettings } from '@/services/model-api/model-manage';
import { PlusOutlined } from '@ant-design/icons';

// 定义API返回的数据结构
interface ApiResponse<T> {
  code: number;
  inside_code: number;
  msg: string;
  data: {
    pagination: API.Pagination;
    data: T[];
  };
}

// 定义分页参数接口
interface PaginationParams {
  pageSize?: number;
  current?: number;
}

interface CustomProTableProps<T, U extends Record<string, any>>
  extends Omit<ProTableProps<T, U>, 'request'> {
  // API 请求函数，返回 Promise
  api: (...args: any[]) => Promise<ApiResponse<T>>;
  // API 请求参数，可以是任意类型
  apiParams?: any;
  // 页面标识，用于保存列配置
  pageName: string;
  createFormRender?: boolean;
  setCreateOpen?: (arg0: boolean) => void;
  // 是否保存列配置
  saveColumns?: boolean;
  // 自定义数据转换函数
  transformResponse?: (data: T[]) => T[];
}

function CustomProTable<
  T extends Record<string, any>,
  U extends Record<string, any> = Record<string, any>,
>({
  api,
  apiParams,
  pageName,
  columns,
  setCreateOpen,
  saveColumns = true,
  createFormRender = true,
  transformResponse,
  rowKey,
  ...restProps
}: CustomProTableProps<T, U>) {
  const actionRef = useRef<ActionType>();
  const [columnsState, setColumnsState] = useState<Record<string, any>>({});
  const { message } = App.useApp();

  // 保存列配置（防抖处理）
  const saveSettings = useCallback(
    debounce(async (state: any) => {
      if (!saveColumns) return;
      try {
        const payload = Object.entries(state).map(([fieldKey, config]: [string, any]) => ({
          page: pageName,
          fieldKey,
          visible: config.show,
        }));

        await saveColumnSettings(payload);
        message.success('列配置已保存');
      } catch (error) {
        message.error('列配置保存失败');
        console.error('保存列配置失败:', error);
      }
    }, 1000),
    [pageName, saveColumns],
  );

  // 设置actionRef的刷新方法
  useEffect(() => {
    if (actionRef.current) {
      const originalReload = actionRef.current.reload;
      // 扩展actionRef的功能，保留原有的reload方法
      actionRef.current.reload = (resetPageIndex?: boolean) => {
        return originalReload(resetPageIndex);
      };
    }
  }, []);

  // 移除这个 useEffect，让 ProTable 自己处理参数变化时的重新加载
  // useEffect(() => {
  //     if (apiParams !== undefined && actionRef.current) {
  //         console.log('apiParams 变化，重新加载数据:', apiParams);
  //         actionRef.current.reload();
  //     }
  // }, [apiParams]);

  // 请求函数 - 符合ProTable标准的request实现
  const request = async (params: U & PaginationParams & { keyword?: string }) => {
    console.log('params', params);

    // 提取分页参数
    const { current, pageSize, ...restParams } = params;

    // 构建查询参数
    const queryParams = {
      current: current || 1,
      page_size: pageSize || 10,
      ...restParams,
    };

    try {
      let response;

      // 根据apiParams的类型决定如何调用API
      if (Array.isArray(apiParams)) {
        // 如果apiParams是数组，解构它作为api的参数
        const [category, initialParams, ...rest] = apiParams;
        // 合并初始参数和查询参数，确保initialParams不为undefined
        const mergedParams = { ...(initialParams || {}), ...queryParams };
        response = await api(category, mergedParams, ...rest);
      } else if (apiParams !== undefined) {
        // 如果apiParams不是数组但有值，将其作为第一个参数
        response = await api(apiParams, queryParams);
      } else {
        // 如果apiParams未定义，直接传递查询参数
        response = await api(queryParams);
      }

      // 处理响应
      if (response.inside_code === 0) {
        const { pagination, data = [] } = response.data || { pagination: { total: 0 }, data: [] };

        // 应用自定义数据转换
        const transformedData = transformResponse ? transformResponse(data) : data;

        return {
          data: transformedData,
          success: true,
          total: pagination?.total || 0,
        };
      } else {
        message.error(response.msg || '请求失败');
        return {
          data: [],
          success: false,
          total: 0,
        };
      }
    } catch (error) {
      console.error('请求失败:', error);
      message.error('请求失败');
      return {
        data: [],
        success: false,
        total: 0,
      };
    }
  };

  // 初始加载不需要单独处理，ProTable 会自动处理
  // useEffect(() => {
  //     if (autoLoad && actionRef.current && apiParams !== undefined) {
  //         actionRef.current.reload();
  //     }
  // }, [autoLoad]);

  return (
    <ProTable<T, U>
      actionRef={actionRef}
      columns={columns}
      request={request}
      rowKey={
        rowKey
          ? rowKey
          : (record) =>
              record.id?.toString() || record.rule_id?.toString() || record.rel_id?.toString()
      }
      columnsState={{
        value: columnsState,
        onChange: (state) => {
          setColumnsState(state);
          if (saveColumns) {
            saveSettings(state);
          }
        },
      }}
      pagination={{
        defaultPageSize: 10,
        showSizeChanger: true,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}
      toolBarRender={
        createFormRender
          ? () => [
              <Button
                key="create"
                type="primary"
                onClick={() => setCreateOpen?.(true)}
                icon={<PlusOutlined />}
              >
                新建
              </Button>,
            ]
          : () => []
      }
      {...restProps}
    />
  );
}

export default CustomProTable;
