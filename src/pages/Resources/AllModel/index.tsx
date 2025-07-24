import { history, useLocation } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useEffect, useState, useCallback, useRef } from 'react';
import type { ProColumns, ProFieldValueType, ProTableProps } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { App, Space, Button, Table, Tooltip } from 'antd'; // 添加 Tooltip 导入
import { getModelResources, deleteResource, saveModelAttributes } from '@/services/resources/api';
import { debounce } from 'lodash-es';
import ModelFormDrawer from './components/ModelFormDrawer';

interface ColumnState {
  [key: string]: {
    show: boolean;
    order?: number;
    width?: number;
  };
}

const AllModel = () => {
  const { modal, message } = App.useApp();
  const { pathname, state } = useLocation();
  const [columnsState, setColumnsState] = useState<ColumnState>({});
  const [dataLoading, setDataLoading] = useState(false);
  const [columns, setColumns] = useState<ProColumns<any>[]>([]);
  const [dataSource, setDataSource] = useState<API.ResourceItem[]>([]);
  const { setColumnsAction } = useModel('modelColumns');
  const [tableLoaded, setTableLoaded] = useState(false);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [editRecord, setEditRecord] = useState<{ id?: number } | null>(null);
  // 添加分页状态
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  const modelName = (state as { model_name?: string })?.model_name || '模型';

  const modelId = (state as { model_id?: number })?.model_id || 0;

  // 修改 refreshTable 函数以支持分页和搜索
  const refreshTable = async (params?: {
    current?: number;
    pageSize?: number;
    [key: string]: any;
  }) => {
    setDataLoading(true);
    try {
      // 使用传入的分页参数或当前分页状态
      const current = params?.current || pagination.current;
      const pageSize = params?.pageSize || pagination.pageSize;

      // 构建查询参数
      const queryParams: Record<string, any> = {
        current,
        page_size: pageSize,
      };

      // 处理搜索参数
      if (params) {
        // 处理资源ID
        if (params.id !== undefined && params.id !== null && params.id !== '') {
          queryParams.id = params.id;
        }

        // 处理实例名
        if (params.instance_name) {
          queryParams.instance_name = params.instance_name;
        }

        // 处理创建人
        if (params.create_name) {
          queryParams.create_name = params.create_name;
        }

        // 处理创建时间范围
        if (
          params.create_time &&
          Array.isArray(params.create_time) &&
          params.create_time.length === 2
        ) {
          queryParams.create_time_start = params.create_time[0];
          queryParams.create_time_end = params.create_time[1];
        }
      }

      console.log('查询参数:', queryParams);

      const res = await getModelResources(modelId, queryParams);

      // 更新数据源设置，使用正确的数据路径
      if (res.data) {
        setDataSource(res.data.data || []);
        // 更新分页信息
        setPagination({
          current,
          pageSize,
          total: res.data.pagination?.total || 0,
        });
      } else {
        setDataSource([]);
      }
      return Promise.resolve();
    } catch (error) {
      modal.error({ content: '数据刷新失败' });
      return Promise.reject(error);
    } finally {
      setDataLoading(false);
    }
  };

  const handleCreate = () => {
    setEditRecord(null);
    setDrawerVisible(true);
  };

  const handleEdit = (record: any) => {
    setEditRecord(record);
    setDrawerVisible(true);
  };

  // 修改 handleDelete 函数以适应新的 deleteResource API
  const handleDelete = (record: any) => {
    if (!record || !record.id) {
      message.error('无效的记录');
      return;
    }

    modal.confirm({
      title: '删除确认',
      content: `确定要删除 ${record.name || record.id} 吗？`,
      onOk: async () => {
        try {
          // 修改为新的 deleteResource 接口调用方式
          // 确保传递正确的参数格式
          const result = await deleteResource([record.id]);
          if (result.inside_code === 0) {
            await refreshTable();
            message.success('删除成功');
          } else {
            modal.error({ content: `删除失败: ${result.msg || '未知错误'}` });
          }
        } catch (error) {
          modal.error({ content: '删除失败，请稍后重试' });
          console.error('删除错误:', error);
        }
      },
    });
  };

  // 使用 useRef 替代 useState 来跟踪初始加载状态
  const initialLoadRef = useRef(true);

  // 使用 resource model
  const { fetchModelAttributes, setResourceRecord } = useModel('resource', (model) => ({
    fetchModelAttributes: model.fetchModelAttributes,
    setResourceRecord: model.setResourceRecord,
  }));

  // 只保留一个 useEffect，合并所有数据加载逻辑
  useEffect(() => {
    let isMounted = true;
    initialLoadRef.current = true; // 标记为初始加载状态

    const fetchData = async () => {
      setDataLoading(true);
      try {
        // 使用 model 中的方法获取模型属性
        const attributeData = await fetchModelAttributes(modelId);

        // 生成列配置
        const generatedColumns = [
          // 添加固定的搜索字段，但在表格中不显示
          {
            title: 'ID',
            dataIndex: 'id',
            valueType: 'digit',
            fixed: 'left',
            width: 60,
            align: 'center',
            search: true,
            render: (text: any, record: any) => (
              <a
                onClick={() => {
                  history.push(
                    `${pathname}/details?name=${
                      record.id
                    }&instance_name=${`${modelName}【${record.instance_name}】`}`,
                  );
                  setResourceRecord(record);
                }}
              >
                {text}
              </a>
            ),
          },
          {
            title: '实例名',
            dataIndex: 'instance_name',
            valueType: 'text',
            hideInTable: true,
            search: true,
          },
          {
            title: '创建人',
            dataIndex: 'create_name',
            valueType: 'text',
            hideInTable: true,
            search: true,
          },
          {
            title: '创建时间',
            dataIndex: 'create_time',
            valueType: 'dateRange',
            hideInTable: true,
            search: true,
          },
          ...attributeData
            // 根据 attr_index 字段排序
            .sort((a, b) => {
              // 如果两者都有 attr_index，按 attr_index 排序
              if (a.attr_index !== undefined && b.attr_index !== undefined) {
                return Number(a.attr_index || 0) - Number(b.attr_index || 0);
              }
              // 如果只有一个有 attr_index，有 attr_index 的排前面
              if (a.attr_index !== undefined) return -1;
              if (b.attr_index !== undefined) return 1;
              // 都没有 attr_index，按默认顺序
              return 0;
            })
            .map((attr) => {
              // 根据字段类型确定合适的 valueType
              let valueType: ProFieldValueType = 'text';
              if (attr.attr_type === 'enum' || attr.attr_type === 'enum_multi') {
                valueType = 'select';
              } else if (attr.attr_type === 'date') {
                valueType = 'date';
              } else if (attr.attr_type === 'datetime') {
                valueType = 'dateTime';
              } else if (attr.attr_type === 'number') {
                valueType = 'digit';
              } else if (attr.attr_type === 'long_text') {
                valueType = 'textarea';
              } else if (attr.attr_type === 'boolean') {
                valueType = 'switch';
              } else {
                valueType = 'text';
              }

              // 尝试解析选项
              let valueEnum = undefined;
              if (attr.option) {
                try {
                  const options = JSON.parse(attr.option);
                  if (Array.isArray(options)) {
                    valueEnum = options.reduce(
                      (acc, curr) => ({
                        ...acc,
                        [curr]: { text: curr },
                      }),
                      {},
                    );
                  }
                } catch (e) {
                  // 解析选项失败，忽略
                }
              }

              return {
                dataIndex: attr.attr_key,
                title: attr.attr_name || attr.attr_key, // 添加默认值防止空标题
                valueType,
                valueEnum,
                hideInSearch: true, // 所有动态字段在搜索中隐藏
                ellipsis: true,
                render: (text: any, record: any) => {
                  console.log('text', text);

                  // 日期类型格式化显示
                  if (attr.attr_type === 'date' && record[attr.attr_key]) {
                    if (
                      typeof record[attr.attr_key] === 'string' &&
                      record[attr.attr_key].includes('T')
                    ) {
                      return record[attr.attr_key].split('T')[0];
                    }
                    return record[attr.attr_key];
                  }

                  // 布尔类型显示为是/否
                  if (attr.attr_type === 'boolean') {
                    return record[attr.attr_key] ? '是' : '否';
                  }

                  // 处理长文本显示，超过50个字符时显示省略号并添加悬浮提示
                  if (
                    record[attr.attr_key] !== null &&
                    record[attr.attr_key] !== undefined &&
                    record[attr.attr_key] !== ''
                  ) {
                    const textStr = String(record[attr.attr_key]);
                    if (textStr.length > 20) {
                      return (
                        <Tooltip title={textStr} placement="topLeft">
                          <span>{textStr.substring(0, 20)}...</span>
                        </Tooltip>
                      );
                    }
                    return textStr;
                  }

                  return '-';
                },
              };
            }),
          {
            title: '操作',
            valueType: 'option',
            key: 'option',
            width: 180,
            fixed: 'right', // 确保固定在右侧
            order: 9999, // 设置一个非常大的排序值，确保它始终在最后
            render: (text: any, record: any) => (
              <Space>
                <a onClick={() => handleEdit(record)}>编辑</a>
                <a style={{ color: 'red' }} onClick={() => handleDelete(record)}>
                  删除
                </a>
              </Space>
            ),
          },
        ];

        // 设置初始列状态，根据 is_display 和 attr_index 设置显示和排序
        const initialColumnsState = attributeData.reduce((acc, attr) => {
          if (!attr.attr_key) return acc; // 跳过没有键的属性

          return {
            ...acc,
            [attr.attr_key]: {
              show: attr.is_display !== false, // 根据 is_display 设置显示状态
              order: Number(attr.attr_index || 0), // 根据 attr_index 设置排序
            },
          };
        }, {});

        if (isMounted) {
          console.log('生成的列配置:', generatedColumns);
          console.log('初始列状态:', initialColumnsState);

          setColumns(generatedColumns as ProColumns<any>[]);
          setColumnsAction(generatedColumns as ProColumns<any>[]);

          // 设置列状态，但不触发保存
          // 直接设置状态，不通过 handleColumnsStateChange
          // 过滤掉 id 字段，确保它不出现在列设置中
          const filteredInitialState = Object.fromEntries(
            Object.entries(initialColumnsState).filter(([key]) => key !== 'id'),
          );

          setColumnsState({
            ...filteredInitialState,
            action: { show: true, order: 9999 }, // 操作列始终显示，并设置最大排序值
          });

          // 延迟将初始加载标记设置为 false，确保初始状态设置完成后再允许保存
          setTimeout(() => {
            if (isMounted) {
              initialLoadRef.current = false;
            }
          }, 500);
        }

        // 加载表格数据，添加分页参数
        const resourcesRes = await getModelResources(modelId, {
          current: pagination.current,
          page_size: pagination.pageSize,
        });

        // 设置数据源，直接使用 resourcesRes.data
        if (isMounted) {
          if (resourcesRes.data) {
            setDataSource(resourcesRes.data.data || []);
            // 更新分页信息
            setPagination((prev) => ({
              ...prev,
              total: resourcesRes.data.pagination?.total || 0,
            }));
          } else {
            setDataSource([]);
          }
          setTableLoaded(true);
        }
      } catch (error) {
        console.error('数据加载错误:', error);
        if (isMounted) {
          modal.error({ content: '数据加载失败' });
        }
      } finally {
        if (isMounted) {
          setDataLoading(false);
        }
      }
    };

    fetchData();
    return () => {
      isMounted = false;
      initialLoadRef.current = true; // 组件卸载时重置状态
    };
  }, [modelId, fetchModelAttributes]); // 添加 fetchModelAttributes 到依赖数组

  // 修改保存列状态的函数，使用 saveModelAttributes 接口
  const saveColumnState = useCallback(
    debounce(async (state: ColumnState) => {
      // 如果是初始加载，不执行保存操作
      if (initialLoadRef.current) {
        console.log('初始加载中，跳过保存列状态');
        return;
      }

      try {
        // 过滤掉 action 字段和 id 字段，不向后端传递
        const filteredState = Object.fromEntries(
          Object.entries(state).filter(([key]) => key !== 'action' && key !== 'id'),
        );

        // 转换为后端需要的格式，确保每个字段都有 is_display 和 attr_index 属性
        const attributes = Object.entries(filteredState).map(([key, value], index) => ({
          attr_key: key,
          is_display: value.show !== undefined ? Boolean(value.show) : true, // 确保是布尔值
          attr_index: value.order !== undefined ? Number(value.order) : index, // 确保是数字
        }));

        console.log('发送到后端的属性配置:', attributes);

        // 调用保存接口
        const result = await saveModelAttributes(modelId, attributes);

        if (result.inside_code === 0) {
          message.success('列配置已更新');
        } else {
          throw new Error(result.msg || '保存失败');
        }
      } catch (error) {
        console.error('列配置保存错误:', error);
        modal.error({ content: '列配置保存失败' });
      }
    }, 1000),
    [modelId],
  );

  console.log('columnsState:', columnsState);

  const handleColumnsStateChange = (state: any) => {
    console.log('列状态变更:', state, '初始加载状态:', initialLoadRef.current);

    // 如果是初始加载，不执行任何操作
    if (initialLoadRef.current) {
      console.log('初始加载中，跳过列状态变更处理');
      return;
    }

    // 确保 state 和 state.action 存在，并且 ID 字段始终显示
    const newState = {
      ...state,
      action: {
        ...(state.action || {}),
        show: true,
      },
    };
    setColumnsState(newState);

    // 只有在非初始加载时才保存列状态
    saveColumnState(newState);
  };

  // 修改 handleTableChange 函数以支持搜索和分页
  const handleTableChange: ProTableProps<any, any>['onChange'] = (
    pagination,
    filters,
    sorter,
    extra,
  ) => {
    // 修复类型错误，正确获取表单数据
    // 从 extra 中获取表单数据，而不是从 currentDataSource._form 获取
    // 从 extra 中获取搜索参数，确保类型安全
    const formData = extra?.action === 'filter' && 'params' in extra ? extra.params || {} : {};

    refreshTable({
      ...formData,
      current: pagination.current,
      pageSize: pagination.pageSize,
    });
  };

  const tableLoading = dataLoading || !tableLoaded;

  return (
    <PageContainer title={modelName}>
      <ProTable
        loading={tableLoading}
        search={{
          labelWidth: 'auto',
          // 移除 onSubmit 和 onReset，使用 ProTable 内置的处理方式
        }}
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        rowSelection={{
          // 添加行选择功能
          selections: [Table.SELECTION_ALL, Table.SELECTION_INVERT],
        }}
        columnsState={{
          value: columnsState,
          onChange: handleColumnsStateChange,
        }}
        scroll={{ x: 'max-content' }} // 添加横向滚动支持
        options={{
          setting: {
            draggable: true,
            checkable: true,
            checkedReset: false,
            extra: [
              <a
                key="reset"
                onClick={() => {
                  // 重置列状态，但保持操作列在最后
                  const defaultState = columns.reduce((acc, col) => {
                    if (!col.dataIndex) return acc;
                    return {
                      ...acc,
                      [col.dataIndex]: { show: true },
                    };
                  }, {});
                  setColumnsState({
                    ...Object.fromEntries(
                      Object.entries(defaultState).map(([key, value]) => [
                        key,
                        typeof value === 'object' ? value : { show: true },
                      ]),
                    ),
                    action: { show: true, order: 9999 }, // 添加最大排序值,
                  });
                }}
              >
                重置
              </a>,
            ],
          },
          reload: () => refreshTable(),
          density: true,
        }}
        // 添加分页配置
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
        // 添加表格变化事件处理
        onChange={handleTableChange}
        // 添加表单提交事件处理
        onSubmit={(params) => {
          console.log('提交的搜索参数:', params);
          refreshTable({
            ...params,
            current: 1, // 搜索时重置到第一页
            pageSize: pagination.pageSize,
          });
        }}
        onReset={() => {
          // 点击重置按钮时触发
          refreshTable({
            current: 1,
            pageSize: pagination.pageSize,
          });
        }}
        toolBarRender={(action, { selectedRowKeys }) => {
          const buttons = [];

          // 当存在业务字段时显示新增按钮
          if (columns.length > 1) {
            buttons.push(
              <Button type="primary" key="create" onClick={handleCreate}>
                新增
              </Button>,
            );
          }

          // 当有选中行时显示批量删除按钮
          if (selectedRowKeys && selectedRowKeys.length > 0) {
            buttons.push(
              <Button
                key="batchDelete"
                danger
                onClick={() => {
                  modal.confirm({
                    title: '批量删除确认',
                    content: `确定要删除选中的 ${selectedRowKeys.length} 条记录吗？`,
                    onOk: async () => {
                      try {
                        const result = await deleteResource(selectedRowKeys as number[]);
                        if (result.inside_code === 0) {
                          await refreshTable();
                          message.success('批量删除成功');
                          // 清除选择
                          action?.clearSelected?.();
                        } else {
                          modal.error({ content: `删除失败: ${result.msg || '未知错误'}` });
                        }
                      } catch (error) {
                        modal.error({ content: '删除失败，请稍后重试' });
                        console.error('批量删除错误:', error);
                      }
                    },
                  });
                }}
              >
                批量删除
              </Button>,
            );
          }

          return buttons;
        }}
      />
      <ModelFormDrawer
        visible={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        mode={editRecord ? 'edit' : 'create'}
        modelId={modelId}
        recordId={editRecord?.id}
        recordData={editRecord}
        onSubmitSuccess={() => refreshTable()}
      />
    </PageContainer>
  );
};

export default AllModel;
