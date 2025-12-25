import { EditableFormInstance, EditableProTable } from '@ant-design/pro-components';
import { useRef, useState, useEffect, useCallback } from 'react';
import { Space, Select, Tabs } from 'antd';
import { useModel } from '@umijs/max';
import { getCapacityApprovalModelNames } from '@/services/capacity';

type DataSourceType = {
  id: React.Key;
  resource_action?: 'create' | 'update' | 'delete';
  [key: string]: any;
};

const GetResourceSubEditorTable: React.FC<{
  modelId: number;
  label: string;
  rel_resource_datas?: Record<number, any[]> | DataSourceType[];
  onDataChange?: (data: Record<number, any[]> | DataSourceType[]) => void;
  showDeleteButton?: boolean;
  isShowRecordSubCreateButton?: boolean;
}> = ({
  modelId,
  label,
  rel_resource_datas,
  onDataChange,
  showDeleteButton = false,
  isShowRecordSubCreateButton = true,
}) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
  const editorFormRef = useRef<EditableFormInstance<DataSourceType>>();
  const prefillingRef = useRef(false);
  const prevOutRef = useRef<string>('');

  // 获取子表列（独立于主表）
  const { fetchModelColumns } = useModel('capacity.index', (model) => ({
    fetchModelColumns: model.fetchModelColumns,
  }));
  // 按模型ID缓存列 & 数据
  const [subColumnsMap, setSubColumnsMap] = useState<Record<number, any[]>>({});
  const [selectedModelIds, setSelectedModelIds] = useState<number[]>([]);
  const [tabDataMap, setTabDataMap] = useState<Record<number, DataSourceType[]>>({});
  const [modelOptions, setModelOptions] = useState<Array<{ label: string; value: number }>>([]);

  // 生成稳定唯一ID
  const generateUniqueId = () => `rel_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  // 同步并去重输入数据
  // 保持默认不加载子资源数据，用户在下拉选择模型后再按模型维度维护数据

  // 默认不在初始化阶段清空，避免覆盖父级传入的预填充数据

  // 加载模型名称选项
  useEffect(() => {
    (async () => {
      try {
        const res = await getCapacityApprovalModelNames({ custom_group: 'resource_change' });
        const list = (res?.data || []).map((it) => ({
          label: String(it.label || it.value),
          value: Number(it.value),
        }));
        setModelOptions(list);
      } catch (e) {
        console.error('获取模型名称选项失败:', e);
      }
    })();
  }, []);

  // 当父级传入的 modelId 变化时，重置当前选择与列，避免误加载
  useEffect(() => {
    setSelectedModelIds([]);
    setSubColumnsMap({});
    setTabDataMap({});
  }, [modelId]);

  // 根据父级传入的 rel_resource_datas 预填充各模型的标签页与数据
  useEffect(() => {
    const isObj =
      rel_resource_datas &&
      !Array.isArray(rel_resource_datas) &&
      typeof rel_resource_datas === 'object';
    const list = Array.isArray(rel_resource_datas) ? rel_resource_datas : [];
    const byModel: Record<number, DataSourceType[]> = {};
    const mids: number[] = [];
    if (isObj) {
      const obj = rel_resource_datas as any;
      Object.keys(obj).forEach((k) => {
        const mid = Number(k);
        if (!mid) return;
        const arr = Array.isArray(obj[mid]) ? obj[mid] : [];
        byModel[mid] = arr.map((item: any) => {
          const rid = item.id ?? generateUniqueId();
          const action = item.resource_action;
          return { ...item, id: rid, resource_action: action, model_id: mid };
        });
        mids.push(mid);
      });
    } else {
      if (!list.length) return;
      list.forEach((item) => {
        const mid = Number((item as any).model_id);
        if (!mid) return;
        if (!byModel[mid]) {
          byModel[mid] = [];
          mids.push(mid);
        }
        const rid = (item as any).id ?? generateUniqueId();
        const action = (item as any).resource_action;
        byModel[mid].push({ ...(item as any), id: rid, resource_action: action, model_id: mid });
      });
    }
    const midsSorted = [...new Set(mids)].sort((a, b) => a - b);
    const selectedSorted = [...selectedModelIds].sort((a, b) => a - b);
    const sameMids =
      midsSorted.length === selectedSorted.length &&
      midsSorted.every((v, i) => v === selectedSorted[i]);
    const sameData = midsSorted.every((mid) => {
      const a = (byModel[mid] || []).map((x) => JSON.stringify(x)).join('|');
      const b = (tabDataMap[mid] || []).map((x) => JSON.stringify(x)).join('|');
      return a === b;
    });
    if (sameMids && sameData) return;
    prefillingRef.current = true;
    setSelectedModelIds(mids);
    setTabDataMap((prev) => {
      const next: Record<number, DataSourceType[]> = { ...prev };
      mids.forEach((mid) => {
        next[mid] = byModel[mid] || [];
      });
      return next;
    });
    (async () => {
      for (const id of mids) {
        if (!subColumnsMap[id]) {
          try {
            const cols = await fetchModelColumns(id);
            setSubColumnsMap((prev) => ({ ...prev, [id]: cols || [] }));
          } catch (e) {
            console.error('获取模型资源属性失败:', e);
          }
        }
      }
    })();
    const time = setTimeout(() => {
      prefillingRef.current = false;
    }, 0);
    return () => clearTimeout(time);
  }, [rel_resource_datas]);

  const getColumnsFor = useCallback(
    (mid: number) => {
      const baseCols = subColumnsMap[mid] || [];
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
          const map = { create: '新增', update: '更新', delete: '删除' } as const;
          return map[record.resource_action as keyof typeof map] || record.resource_action || '-';
        },
      };
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
                    const list = prev[mid] || [];
                    const nextList = list.filter((it) => it.id !== record.id);
                    return { ...prev, [mid]: nextList };
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
      tableColumns.splice(-1, 0, actionColumn);
      return tableColumns;
    },
    [subColumnsMap, showDeleteButton],
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

  // 自定义 HeaderTitle，添加数据库/中间件下拉选择
  const renderHeaderTitle = () => (
    <Space>
      <h3>{label}</h3>
      <Space.Compact>
        <Select
          placeholder="请选择"
          options={modelOptions}
          showSearch={false}
          filterOption={false}
          style={{ width: 260 }}
          optionFilterProp="label"
          allowClear
          mode="multiple"
          labelInValue
          onFocus={(e) => e.stopPropagation()}
          onBlur={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          value={selectedModelIds.map((id) => ({
            value: id,
            label:
              modelOptions.find((opt) => Number(opt.value) === Number(id))?.label || String(id),
          }))}
          onChange={async (values?: any[]) => {
            const newIds = Array.isArray(values) ? values.map((v) => Number((v || {}).value)) : [];
            setSelectedModelIds(newIds);
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
            // 清理未选中的标签数据
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
    </Space>
  );

  // 将所有标签页数据在效果中统一上报至父组件
  useEffect(() => {
    const out: Record<number, any[]> = {};
    selectedModelIds.forEach((mid) => {
      out[mid] = tabDataMap[mid] || [];
    });
    const nextStr = JSON.stringify(out);
    const same = nextStr === prevOutRef.current;
    if (!prefillingRef.current && !same) {
      onDataChange?.(out as any);
    }
    prevOutRef.current = nextStr;
  }, [tabDataMap, selectedModelIds]);

  return (
    <div>
      {renderHeaderTitle()}
      <Tabs
        style={{ marginTop: 12 }}
        tabBarStyle={{ marginBottom: 12 }}
        items={selectedModelIds.map((mid) => ({
          label:
            modelOptions.find((opt) => Number(opt.value) === Number(mid))?.label || String(mid),
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
                setTabDataMap((prev) => ({ ...prev, [mid]: nextRows }));
              }}
              editable={{
                type: 'multiple',
                editableKeys,
                onChange: setEditableRowKeys,
                onSave: async (rowKey, data) => {
                  const nextData = { ...data } as DataSourceType;
                  if (!nextData.resource_action || nextData.resource_action === 'create') {
                    nextData.resource_action = 'update' as const;
                  }
                  nextData.model_id = mid;
                  setTabDataMap((prev) => {
                    const list = prev[mid] || [];
                    const updated = list.map((it) =>
                      it.id === rowKey ? { ...it, ...nextData } : it,
                    );
                    return { ...prev, [mid]: updated };
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
        }))}
      />
    </div>
  );
};

export default GetResourceSubEditorTable;
