import { EditableFormInstance, EditableProTable } from '@ant-design/pro-components';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useModel } from '@umijs/max';
import { Space, Select, Tabs } from 'antd';
import { getCapacityApprovalModelNames } from '@/services/capacity';

type DataSourceType = {
  id: React.Key;
  resource_action?: 'create' | 'update' | 'delete';
  [key: string]: any; // 允许任意属性
};

// 修改组件接口，添加trigger_resource_datas参数和变更追踪
const SubEditorTable: React.FC<{
  value: string;
  label: string;
  rel_resource_datas?: DataSourceType[];
  onDataChange?: (data: DataSourceType[]) => void;
  showDeleteButton?: boolean; // 控制是否显示删除按钮
  isShowRecordSubCreateButton?: boolean;
  modelNameMap?: Record<number, string>; // 新增：外部传入的模型名称映射
}> = ({
  label,
  rel_resource_datas = [],
  onDataChange,
  showDeleteButton = false,
  isShowRecordSubCreateButton = true,
  modelNameMap: externalModelNameMap,
}) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);

  // Debug log
  useEffect(() => {
    console.log('SubEditorTable mounted/updated. modelNameMap:', externalModelNameMap);
  }, [externalModelNameMap]);
  const editorFormRef = useRef<EditableFormInstance<DataSourceType>>();
  const [selectedModelIds, setSelectedModelIds] = useState<number[]>([]);
  const prefillingRef = useRef(false);

  // 使用容量管理模型的列作为子表格的动态列
  const { fetchModelColumns } = useModel('capacity.index', (model) => ({
    fetchModelColumns: model.fetchModelColumns,
  }));

  // 子表格专用的本地列缓存，按模型ID维护
  const [subColumnsMap, setSubColumnsMap] = useState<Record<number, any[]>>({});
  // 每个模型的子表数据
  const [tabDataMap, setTabDataMap] = useState<Record<number, DataSourceType[]>>({});

  // 生成稳定唯一ID，避免重复 key
  const generateUniqueId = () => {
    return `rel_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  };

  // 格式化数据源，确保每个项都有唯一的id，并按 model_id 分组到 tabDataMap
  useEffect(() => {
    if (!rel_resource_datas || rel_resource_datas.length === 0) {
      setTabDataMap((prev) => {
        // 只有当前数据不为空时才清空
        if (Object.keys(prev).length > 0) {
          setSelectedModelIds([]);
          return {};
        }
        return prev;
      });
      return;
    }

    // 使用Set来追踪已经使用的ID，避免重复
    const usedIds = new Set<string>();
    const grouped: Record<number, DataSourceType[]> = {};
    const modelIdSet = new Set<number>();

    rel_resource_datas.forEach((item) => {
      const modelId = Number(item.model_id);
      if (!modelId) return;

      modelIdSet.add(modelId);

      let itemId = item.id as React.Key | undefined;
      // 如果没有ID或ID重复，生成新的唯一ID
      if (!itemId || usedIds.has(String(itemId))) {
        itemId = generateUniqueId();
      }
      usedIds.add(String(itemId));

      const formattedItem = {
        ...item,
        id: itemId,
        resource_action: item.resource_action || undefined,
        model_id: modelId,
      };

      if (!grouped[modelId]) {
        grouped[modelId] = [];
      }
      grouped[modelId].push(formattedItem);
    });

    // 更新选中的模型ID列表
    const modelIds = Array.from(modelIdSet);

    // 比较数据是否真正发生变化
    prefillingRef.current = true;
    setTabDataMap((prevMap) => {
      const prevStr = JSON.stringify(prevMap);
      const newStr = JSON.stringify(grouped);

      if (prevStr !== newStr) {
        // 数据发生变化，更新 selectedModelIds
        setSelectedModelIds(modelIds);

        // 异步加载缺失的模型列
        modelIds.forEach(async (modelId) => {
          try {
            const cols = await fetchModelColumns(modelId);
            setSubColumnsMap((prev) => {
              // 只有当列数据不存在时才更新
              if (!prev[modelId]) {
                return { ...prev, [modelId]: cols || [] };
              }
              return prev;
            });
          } catch (e) {
            console.error(`获取模型${modelId}资源属性失败:`, e);
          }
        });

        return grouped;
      }
      return prevMap;
    });
    const time = setTimeout(() => {
      prefillingRef.current = false;
    }, 0);
    return () => clearTimeout(time);
  }, [rel_resource_datas, fetchModelColumns]);

  // 选项辅助：用于标签名称（使用数字索引的映射类型）
  const [optionMap, setOptionMap] = useState<Record<number, string>>({});
  const [modelOptions, setModelOptions] = useState<{ value: number; label: string }[]>([]);

  // 加载模型选项
  useEffect(() => {
    (async () => {
      try {
        // 请求 child 类型的模型（数据库、中间件等）
        const [resChild, resChange] = await Promise.all([
          getCapacityApprovalModelNames({ model_type: 'capacity_child' }),
          getCapacityApprovalModelNames({ custom_group: 'resource_change' }),
        ]);
        const options: { value: number; label: string }[] = [];
        const map: Record<number, string> = {};

        const process = (list: any[]) => {
          (list || []).forEach((it: any) => {
            const value = Number(it.value);
            const label = String(it.label || value);
            if (!map[value]) {
              options.push({ value, label });
              map[value] = label;
            }
          });
        };

        process(resChild?.data || []);
        process(resChange?.data || []);

        setModelOptions(options);
        setOptionMap(map);
      } catch (error) {
        console.error('加载子模型选项失败:', error);
      }
    })();
  }, []);

  // 自定义headerTitle，添加下拉框选择功能
  const renderHeaderTitle = () => {
    return (
      <Space>
        <h3>{label}</h3>
        {isShowRecordSubCreateButton && ( // 只有在可编辑模式下才显示下拉框
          <Space.Compact>
            <Select
              placeholder="请选择"
              options={modelOptions}
              showSearch
              style={{ width: 200 }}
              optionFilterProp="label"
              allowClear
              mode="multiple"
              value={selectedModelIds}
              onChange={async (values?: number[]) => {
                const newIds = Array.isArray(values) ? values : [];
                setSelectedModelIds(newIds);
                // 拉取新选择模型的列
                for (const id of newIds) {
                  if (!subColumnsMap[id]) {
                    try {
                      const cols = await fetchModelColumns(id);
                      setSubColumnsMap((prev) => ({ ...prev, [id]: cols || [] }));
                    } catch (e) {
                      console.error('获取模型资源属性失败:', e);
                    }
                  }
                  if (!tabDataMap[id]) {
                    setTabDataMap((prev) => ({ ...prev, [id]: [] }));
                  }
                }
                // 移除未选中的Tab数据（可选保留，这里选择清理）
                setTabDataMap((prev) => {
                  const next: Record<number, DataSourceType[]> = {};
                  newIds.forEach((id) => {
                    next[id] = prev[id] || [];
                  });
                  return next;
                });
              }}
            />
          </Space.Compact>
        )}
      </Space>
    );
  };

  // 每个模型的列（含动作/操作列）
  const getColumnsFor = useCallback(
    (modelId: number) => {
      const baseCols = subColumnsMap[modelId] || [];
      if (!baseCols || baseCols.length === 0) return [];
      const tableColumns = [...baseCols];
      const actionColumn = {
        title: '动作',
        dataIndex: 'resource_action',
        key: 'resource_action',
        valueType: 'text' as const,
        width: 100,
        editable: false,
        hideInForm: true,
        formItemProps: { name: undefined },
        renderFormItem: () => null,
        render: (_: any, record: DataSourceType) => {
          const actionMap = { create: '新增', update: '更新', delete: '删除' } as const;
          return (
            actionMap[record.resource_action as keyof typeof actionMap] ||
            record.resource_action ||
            '-'
          );
        },
      };
      if (isShowRecordSubCreateButton) {
        tableColumns.push({
          title: '操作',
          valueType: 'option',
          fixed: 'right',
          width: 160,
          render: (text: any, record: DataSourceType, _: number, action: any) => {
            const ops = [
              <a key="editable" onClick={() => action?.startEditable?.(record.id, record)}>
                编辑
              </a>,
            ];
            if (showDeleteButton) {
              ops.push(
                <a
                  key="delete"
                  onClick={() => {
                    setTabDataMap((prev) => {
                      const list = prev[modelId] || [];
                      const nextList = list.filter((it) => it.id !== record.id);
                      const next = { ...prev, [modelId]: nextList };
                      return next;
                    });
                  }}
                >
                  删除
                </a>,
              );
            }
            return ops;
          },
        });
      }

      tableColumns.splice(-1, 0, actionColumn);
      return tableColumns;
    },
    [subColumnsMap, showDeleteButton, onDataChange],
  );

  // 计算表格的滚动宽度
  const calculateScrollWidth = useCallback(
    (modelId: number) => {
      const count = (getColumnsFor(modelId) || []).length;
      const average = 150;
      return Math.max(960, count * average);
    },
    [getColumnsFor],
  );

  // 将所有标签页数据在效果中统一上报（使用 useRef 避免 onDataChange 变化导致的循环）
  const onDataChangeRef = useRef(onDataChange);
  useEffect(() => {
    onDataChangeRef.current = onDataChange;
  }, [onDataChange]);

  // 使用 ref 保存上次的数据，只有当数据真正变化时才通知父组件
  const lastDataRef = useRef<string>('');

  useEffect(() => {
    const allData = Object.entries(tabDataMap).flatMap(([modelId, items]) =>
      items.map((item) => ({ ...item, model_id: Number(modelId) })),
    );

    // 将数据序列化为字符串进行比较
    const currentDataStr = JSON.stringify(allData);

    // 只有当数据真正发生变化时才调用 onDataChange
    if (!prefillingRef.current && currentDataStr !== lastDataRef.current) {
      lastDataRef.current = currentDataStr;
      onDataChangeRef.current?.(allData);
    }
  }, [tabDataMap]);

  return (
    <div>
      {renderHeaderTitle()}
      <Tabs
        style={{ marginTop: 12 }}
        tabBarStyle={{ marginBottom: 12 }}
        items={selectedModelIds.map((mid) => {
          const label = externalModelNameMap?.[mid] || optionMap[mid] || String(mid);
          console.log(`Rendering tab for mid ${mid}: label=${label}`, {
            external: externalModelNameMap?.[mid],
            internal: optionMap[mid],
          });
          return {
            label,
            key: String(mid),
            children: (
              <EditableProTable<DataSourceType>
                rowKey="id"
                scroll={{ x: calculateScrollWidth(mid), y: 500 }}
                pagination={false}
                editableFormRef={editorFormRef}
                recordCreatorProps={
                  isShowRecordSubCreateButton
                    ? {
                        record: () => ({
                          id: generateUniqueId(),
                          resource_action: 'create' as const,
                          model_id: mid,
                        }),
                        creatorButtonText: '添加一条数据',
                      }
                    : false
                }
                columns={getColumnsFor(mid)}
                value={tabDataMap[mid] || []}
                onChange={(rows) => {
                  const nextRows = rows.map((it) => {
                    const exists = (tabDataMap[mid] || []).some((ds) => ds.id === it.id);
                    if (!exists && !it.resource_action) it.resource_action = 'create' as const;
                    it.model_id = mid;
                    return it;
                  });
                  setTabDataMap((prev) => {
                    const next = { ...prev, [mid]: nextRows };
                    return next;
                  });
                }}
                editable={{
                  type: 'multiple',
                  editableKeys,
                  onChange: setEditableRowKeys,
                  onSave: async (rowKey, data) => {
                    const nextData = { ...data } as DataSourceType;

                    // 查找原始记录以保持其 resource_action
                    const originalRecord = (tabDataMap[mid] || []).find((it) => it.id === rowKey);
                    if (originalRecord?.resource_action) {
                      // 如果原始记录有 resource_action，保持不变
                      nextData.resource_action = originalRecord.resource_action;
                    } else if (!nextData.resource_action) {
                      // 如果原始记录没有 resource_action 且当前数据也没有，设置为 update
                      nextData.resource_action = 'update' as const;
                    }

                    nextData.model_id = mid;
                    setTabDataMap((prev) => {
                      const list = prev[mid] || [];
                      const updated = list.map((it) =>
                        it.id === rowKey ? { ...it, ...nextData } : it,
                      );
                      const next = { ...prev, [mid]: updated };
                      return next;
                    });
                    const current =
                      (tabDataMap[mid] || []).find((it) => it.id === rowKey) || nextData;
                    return current;
                  },
                  actionRender: (row, config, defaultDom) => [
                    defaultDom.save,
                    defaultDom.delete,
                    defaultDom.cancel,
                  ],
                }}
              />
            ),
          };
        })}
      />
    </div>
  );
};

export default SubEditorTable;
