import { history, useLocation } from '@umijs/max';
import { PageContainer } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import { useEffect, useState, useCallback, useRef } from 'react';
import type { ProColumns, ProFieldValueType, ProTableProps } from '@ant-design/pro-components';
import { useModel } from '@umijs/max';
import { App, Space, Button, Table, Tooltip } from 'antd'; // 添加 Tooltip 导入
import { getModelResources, deleteResource, saveModelAttributes } from '@/services/resources/api';
import { debounce } from 'lodash-es';
import CreateFormDrawer from './components/CreateFormDrawer';
import EditFormDrawer from './components/EditFormDrawer';
import { timezoneList } from '@/pages/ModelPage/ModelManager/ModelDetails/ModelField/components/FieldTypeRender';

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
      const queryParams: API.ResourceListParams & Record<string, any> = {
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

        // 处理动态字段搜索参数
        Object.keys(params).forEach((key) => {
          // 跳过已处理的固定字段和分页参数
          if (
            !['id', 'instance_name', 'create_name', 'create_time', 'current', 'pageSize'].includes(
              key,
            )
          ) {
            const value = params[key];
            if (value !== undefined && value !== null && value !== '') {
              queryParams[key] = value;
            }
          }
        });
      }

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
      message.error({ content: '数据刷新失败' });
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

  // 获取用户列表数据
  const { userOptions, loading: userLoading } = useModel('user', (model) => ({
    userOptions: model.userOptions,
    loading: model.loading,
  }));

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
        // 1. 首先确保用户数据已加载
        if (userLoading) {
          // 等待用户数据加载完成
          await new Promise((resolve) => {
            const checkUserData = () => {
              if (!userLoading) {
                resolve(true);
              } else {
                setTimeout(checkUserData, 100);
              }
            };
            checkUserData();
          });
        }

        // 2. 使用 model 中的方法获取模型属性，每次进入页面都强制刷新
        const attributeData = await fetchModelAttributes(modelId, true);

        // 3. 生成列配置
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
          // {
          //   title: '实例名',
          //   dataIndex: 'instance_name',
          //   valueType: 'text',
          //   hideInTable: true,
          //   search: true,
          // },
          // {
          //   title: '创建人',
          //   dataIndex: 'create_name',
          //   valueType: 'text',
          //   hideInTable: true,
          //   search: true,
          // },
          // {
          //   title: '创建时间',
          //   dataIndex: 'create_time',
          //   valueType: 'date',
          //   hideInTable: true,
          //   search: true,
          // },
          ...attributeData
            // 过滤掉与固定字段重复的字段，避免key冲突
            // .filter((attr) => !['create_time', 'create_name', 'instance_name'].includes(attr.attr_key))
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
              } else if (attr.attr_type === 'timezone') {
                valueType = 'select';
              } else {
                valueType = 'text';
              }

              // 尝试解析选项 - 只为特定类型的字段设置 valueEnum
              let valueEnum = undefined;

              // 只为 enum、enum_multi、timezone、user、user_multi 类型设置 valueEnum
              if ((attr.attr_type === 'enum' || attr.attr_type === 'enum_multi') && attr.option) {
                try {
                  let options;
                  // 如果option已经是数组，直接使用；否则尝试JSON解析
                  if (Array.isArray(attr.option)) {
                    options = attr.option;
                  } else {
                    options = JSON.parse(attr.option);
                  }

                  if (Array.isArray(options)) {
                    valueEnum = options.reduce((acc, curr) => {
                      // 确保curr有value和label属性
                      if (
                        curr &&
                        typeof curr === 'object' &&
                        curr.value !== undefined &&
                        curr.label
                      ) {
                        return {
                          ...acc,
                          [curr.value]: { text: curr.label },
                        };
                      }
                      return acc;
                    }, {});
                  }
                } catch (e) {
                  // 解析选项失败，忽略
                  console.warn('解析选项失败:', e);
                }
              }

              // 为timezone类型设置时区选项
              else if (attr.attr_type === 'timezone') {
                valueEnum = timezoneList.reduce(
                  (acc, curr) => ({
                    ...acc,
                    [curr.value]: { text: curr.label },
                  }),
                  {},
                );
              }

              // 为user和user_multi类型设置用户选项
              else if (
                (attr.attr_type === 'user' || attr.attr_type === 'user_multi') &&
                userOptions &&
                Array.isArray(userOptions)
              ) {
                valueEnum = userOptions.reduce((acc, curr) => {
                  if (curr && typeof curr.value !== 'undefined' && curr.label) {
                    return {
                      ...acc,
                      [curr.value]: { text: curr.label },
                    };
                  }
                  return acc;
                }, {});
              }

              // 处理is_search字段，为undefined的情况提供默认值
              const isSearchable = attr.is_search !== undefined ? attr.is_search : false;

              return {
                dataIndex: attr.attr_key,
                title: attr.attr_name || attr.attr_key, // 添加默认值防止空标题
                valueType,
                valueEnum,
                hideInSearch: !isSearchable, // 使用处理后的isSearchable值
                ellipsis: true,
                // 为搜索表单配置fieldProps
                fieldProps: (() => {
                  const baseProps: any = {};
                  // 为user和user_multi类型设置options
                  if (
                    (attr.attr_type === 'user' || attr.attr_type === 'user_multi') &&
                    userOptions &&
                    Array.isArray(userOptions)
                  ) {
                    baseProps.options = userOptions.map((user: any) => ({
                      label: user.label,
                      value: user.value,
                    }));
                    baseProps.showSearch = true;
                    baseProps.optionFilterProp = 'label';
                    if (attr.attr_type === 'user_multi') {
                      baseProps.mode = 'multiple';
                    }
                  }

                  // 为timezone类型设置options
                  else if (attr.attr_type === 'timezone') {
                    baseProps.options = timezoneList.map((tz: any) => ({
                      label: tz.label,
                      value: tz.value,
                    }));
                    baseProps.showSearch = true;
                    baseProps.optionFilterProp = 'label';
                  }

                  // 为enum类型设置options
                  else if (
                    (attr.attr_type === 'enum' || attr.attr_type === 'enum_multi') &&
                    attr.option
                  ) {
                    try {
                      let options;
                      // 如果option已经是数组，直接使用；否则尝试JSON解析
                      if (Array.isArray(attr.option)) {
                        options = attr.option;
                      } else {
                        // 先尝试JSON解析
                        try {
                          options = JSON.parse(attr.option);
                        } catch (jsonError) {
                          // JSON解析失败，可能是逗号分隔的字符串，尝试按逗号分割
                          if (typeof attr.option === 'string') {
                            const stringOptions = attr.option
                              .split(',')
                              .map((item: string) => item.trim())
                              .filter((item: string) => item);
                            options = stringOptions.map((item: string) => ({
                              value: item,
                              label: item,
                            }));
                          } else {
                            throw jsonError;
                          }
                        }
                      }

                      if (Array.isArray(options)) {
                        baseProps.options = options.map((opt: any) => {
                          // 如果opt是字符串，转换为对象格式
                          if (typeof opt === 'string') {
                            return {
                              label: opt,
                              value: opt,
                            };
                          }
                          // 如果opt是对象，使用现有逻辑
                          return {
                            label: opt.label || opt.value,
                            value: opt.value,
                          };
                        });
                        if (attr.attr_type === 'enum_multi') {
                          baseProps.mode = 'multiple';
                        }
                      }
                    } catch (e) {
                      console.error('解析枚举选项失败:', e, '原始数据:', attr.option);
                    }
                  }

                  return Object.keys(baseProps).length > 0 ? baseProps : undefined;
                })(),
                render: (text: any, record: any) => {
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

                  // 枚举类型显示选项值
                  if (attr.attr_type === 'enum' || attr.attr_type === 'enum_multi') {
                    const fieldValue = record[attr.attr_key];
                    if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
                      // 构建选项映射，支持通过ID和value查找
                      let optionsMap: Record<string, string> = {};
                      if (attr.option) {
                        try {
                          let options;
                          // 如果option已经是数组，直接使用；否则尝试JSON解析
                          if (Array.isArray(attr.option)) {
                            options = attr.option;
                          } else {
                            // 先尝试JSON解析
                            try {
                              options = JSON.parse(attr.option);
                            } catch (jsonError) {
                              // JSON解析失败，可能是逗号分隔的字符串，尝试按逗号分割
                              if (typeof attr.option === 'string') {
                                const stringOptions = attr.option
                                  .split(',')
                                  .map((item: string) => item.trim())
                                  .filter((item: string) => item);
                                options = stringOptions.map((item: string) => ({
                                  value: item,
                                  label: item,
                                }));
                              } else {
                                throw jsonError;
                              }
                            }
                          }

                          if (Array.isArray(options)) {
                            options.forEach((opt: any) => {
                              if (typeof opt === 'string') {
                                // 如果是字符串，value和label都是自己
                                optionsMap[opt] = opt;
                              } else if (opt && typeof opt === 'object') {
                                // 如果是对象，建立多种映射关系
                                const label = opt.label || opt.value;
                                const value = opt.value;
                                const id = opt.id;

                                // 通过value映射
                                if (value !== undefined) {
                                  optionsMap[value] = label;
                                }
                                // 通过id映射（如果存在）
                                if (id !== undefined) {
                                  optionsMap[id] = label;
                                }
                                // 通过label映射（防止某些情况下存储的是label）
                                if (label !== undefined) {
                                  optionsMap[label] = label;
                                }
                              }
                            });
                          }
                        } catch (e) {
                          console.warn('解析枚举选项失败:', e, '原始数据:', attr.option);
                        }
                      }

                      // 处理单选枚举
                      if (attr.attr_type === 'enum') {
                        const displayValue = optionsMap[fieldValue] || fieldValue;
                        return displayValue;
                      }

                      // 处理多选枚举
                      if (attr.attr_type === 'enum_multi') {
                        let values: string[] = [];

                        // 处理不同的数据格式
                        if (Array.isArray(fieldValue)) {
                          values = fieldValue;
                        } else if (typeof fieldValue === 'string') {
                          // 尝试JSON解析
                          try {
                            const parsed = JSON.parse(fieldValue);
                            if (Array.isArray(parsed)) {
                              values = parsed;
                            } else {
                              // 如果不是数组，按逗号分割
                              values = fieldValue
                                .split(',')
                                .map((v) => v.trim())
                                .filter((v) => v !== '');
                            }
                          } catch {
                            // JSON解析失败，按逗号分割
                            values = fieldValue
                              .split(',')
                              .map((v) => v.trim())
                              .filter((v) => v !== '');
                          }
                        } else {
                          values = [String(fieldValue)];
                        }

                        // 映射每个值到对应的显示文本
                        const displayValues = values.map((value) => optionsMap[value] || value);
                        return displayValues.join(', ');
                      }
                    }
                    return '-';
                  }

                  // 用户类型显示用户名称
                  if (attr.attr_type === 'user' || attr.attr_type === 'user_multi') {
                    const fieldValue = record[attr.attr_key];

                    if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
                      // 如果用户数据为空，显示原始值
                      if (!userOptions || userOptions.length === 0) {
                        return fieldValue;
                      }

                      // 处理多个用户ID的情况（如"3031,3291,3294"）
                      const userIds = String(fieldValue)
                        .split(',')
                        .map((id) => id.trim());
                      const userNames = userIds.map((userId) => {
                        // 尝试数字匹配和字符串匹配
                        const userOption = userOptions.find(
                          (option) =>
                            option.value === parseInt(userId) || option.value.toString() === userId,
                        );
                        return userOption ? userOption.label : userId;
                      });
                      return userNames.join(', ');
                    }
                    return '-';
                  }

                  // timezone类型显示时区名称
                  if (attr.attr_type === 'timezone') {
                    const fieldValue = record[attr.attr_key];
                    if (fieldValue !== null && fieldValue !== undefined && fieldValue !== '') {
                      // 查找对应的时区标签
                      const timezone = timezoneList.find((tz) => tz.value === fieldValue);
                      return timezone ? timezone.label : fieldValue;
                    }
                    return '-';
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
            fixed: 'right',
            order: 9999,
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

        // 4. 设置初始列状态，根据 is_display 和 attr_index 设置显示和排序
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
          setColumns(generatedColumns as ProColumns<any>[]);
          setColumnsAction(generatedColumns as ProColumns<any>[]);

          const filteredInitialState = Object.fromEntries(
            Object.entries(initialColumnsState).filter(([key]) => key !== 'id'),
          );

          setColumnsState({
            ...filteredInitialState,
            action: { show: true, order: 9999 }, // 操作列始终显示，并设置最大排序值
          });

          setTimeout(() => {
            if (isMounted) {
              initialLoadRef.current = false;
            }
          }, 500);
        }

        // 5. 加载表格数据，添加分页参数
        const resourcesRes = await getModelResources(modelId, {
          current: pagination.current,
          page_size: pagination.pageSize,
        });

        // 6. 设置数据源，直接使用 resourcesRes.data
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
          message.error({ content: '数据加载失败' });
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
  }, [modelId, fetchModelAttributes, userLoading]); // 添加 userLoading 到依赖数组

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
        const attributes = Object.entries(filteredState)
          .filter(([key]) => key !== 'option') // 过滤掉 attr_key 为 'option' 的项
          .map(([key, value], index) => ({
            attr_key: key,
            is_display: value.show !== undefined ? Boolean(value.show) : true, // 确保是布尔值
            attr_index: value.order !== undefined ? Number(value.order) : index, // 确保是数字
          }));

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

  const handleColumnsStateChange = (state: any) => {
    // 如果是初始加载，不执行任何操作
    if (initialLoadRef.current) {
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
        }}
        columns={columns}
        dataSource={dataSource}
        rowKey="id"
        rowSelection={{
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
      {editRecord ? (
        <EditFormDrawer
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          modelId={modelId}
          recordId={editRecord.id!}
          onSubmitSuccess={() => refreshTable()}
        />
      ) : (
        <CreateFormDrawer
          visible={drawerVisible}
          onClose={() => setDrawerVisible(false)}
          modelId={modelId}
          onSubmitSuccess={() => refreshTable()}
        />
      )}
    </PageContainer>
  );
};

export default AllModel;
