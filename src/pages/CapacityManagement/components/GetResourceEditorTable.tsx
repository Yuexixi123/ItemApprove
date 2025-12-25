import { EditableFormInstance, EditableProTable } from '@ant-design/pro-components';
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { Space, Select } from 'antd';
import { useModel } from '@umijs/max';
import GetResourceSubEditorTable from './GetResourceSubEditorTable';
import { getRelateResource } from '@/services/capacity';
import { getCapacityApprovalModelNames } from '@/services/capacity';

type DataSourceType = {
  id: React.Key;
  instance_name?: string;
  host_resource_id?: number;
  resource_action?: 'create' | 'update' | 'delete';
  rel_resource_datas?: Record<number, any[]> | any[];
  origin?: 'dropdown' | 'manual';
  [key: string]: any;
};

const GetResourceEditorTable: React.FC<{
  modelId: number;
  cachedData?: any[];
  onDataChange?: (data: DataSourceType[]) => void;
  headerSelectOptions?: { label: string; value: number }[];
  onHeaderSelectChange?: (value?: number[] | number, option?: any) => void;
  sysResourceId?: number;
  isShowRecordSubCreateButton?: boolean;
  isShowSubRecordDeleteButton?: boolean;
}> = ({
  modelId,
  cachedData = [],
  onDataChange,
  headerSelectOptions = [],
  onHeaderSelectChange,
  sysResourceId,
  isShowRecordSubCreateButton = true,
  isShowSubRecordDeleteButton = true,
}) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
  const editorFormRef = useRef<EditableFormInstance<DataSourceType>>();
  const [dataSource, setDataSource] = useState<DataSourceType[]>([]);

  const { loading: modelLoading, fetchModelColumns } = useModel('capacity.index', (model) => ({
    loading: model.loading,
    fetchModelColumns: model.fetchModelColumns,
  }));
  const [localColumns, setLocalColumns] = useState<any[]>([]);
  const [headerSelectValue, setHeaderSelectValue] = useState<number[] | undefined>();
  // 新增：模拟的表格数据，仅用于下拉框轮询生成选项
  const [simRows, setSimRows] = useState<Array<{ id: number; instance_name: string; ip: string }>>(
    [],
  );
  // 新增：下拉框内部选项（若外部未传递则使用该选项）
  const [headerOptions, setHeaderOptions] = useState<Array<{ label: string; value: number }>>([]);
  const [relatedMap, setRelatedMap] = useState<Record<number, any>>({});

  const generateUniqueId = () => `item_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

  const fetchRelatedRows = async (
    model: number,
    systemId?: number,
  ): Promise<Array<{ id: number; instance_name: string; ip: string }>> => {
    if (!systemId) return [] as Array<{ id: number; instance_name: string; ip: string }>;

    try {
      // 动态获取模型Key
      const modelRes = await getCapacityApprovalModelNames({ model_type: 'capacity_main' });
      const modelData = modelRes?.data || [];
      const targetModel = modelData.find((item: any) => item.value === model);

      if (!targetModel) {
        console.warn(`未找到 ID 为 ${model} 的模型配置`);
        return [];
      }

      const mainModelKey = targetModel.model_key || '';
      // 拼接 sys_rel: system_CONTAINS_ + model_key
      const sysRel = mainModelKey ? `system_CONTAINS_${mainModelKey}` : '';

      if (!sysRel) return [];

      const res = await getRelateResource({
        sys_rel: sysRel,
        sys_resource_id: Number(systemId),
        main_model_key: mainModelKey,
      });
      const list = (res?.data || []) as any[];
      const map: Record<number, any> = {};
      const options: Array<{ label: string; value: number }> = [];
      const rows: Array<{ id: number; instance_name: string; ip: string }> = [];
      list.forEach((it) => {
        const key = Number(it.id ?? it.host_resource_id);
        if (!key) return;
        map[key] = it;
        const label = String(it.instance_name ?? key);
        options.push({ label, value: key });
        rows.push({ id: key, instance_name: label, ip: String(it.ip ?? '') });
      });
      setRelatedMap(map);
      setHeaderOptions(options);
      return rows;
    } catch (e) {
      console.error('获取关联资源失败:', e);
      setHeaderOptions([]);
      setRelatedMap({});
      return [];
    }
  };

  // 初始化和同步缓存数据，确保唯一行键
  useEffect(() => {
    const used = new Set<string>();
    const formatted = (cachedData || []).map((item) => {
      let id = item.id as React.Key | undefined;
      if (!id || used.has(String(id))) {
        id = generateUniqueId();
      }
      used.add(String(id));
      return { ...item, id, resource_action: item.resource_action || undefined };
    });
    setDataSource(formatted);
  }, [cachedData]);

  // 获取并设置本地列
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (modelId) {
        const cols = await fetchModelColumns(modelId);
        if (mounted) setLocalColumns(cols || []);
        // 加载关联资源作为下拉选项
        const rows = await fetchRelatedRows(modelId, sysResourceId);
        if (mounted) setSimRows(rows);
      } else if (mounted) {
        setLocalColumns([]);
        setSimRows([]);
        setHeaderOptions([]);
        setRelatedMap({});
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [modelId, fetchModelColumns, sysResourceId]);

  // 同步下拉选项为关联资源行
  useEffect(() => {
    const aggregated = simRows.map((row) => ({
      label: String(row.instance_name ?? row.id),
      value: Number(row.id),
    }));
    setHeaderOptions(aggregated);
  }, [simRows]);

  const renderHeaderTitle = () => (
    <Space>
      <span>主机资源列表</span>
      <Space.Compact>
        <Select
          placeholder="请选择"
          options={
            headerSelectOptions && headerSelectOptions.length > 0
              ? headerSelectOptions
              : headerOptions
          }
          showSearch={false}
          filterOption={false}
          style={{ width: 600 }}
          optionFilterProp="label"
          allowClear
          mode="multiple"
          onFocus={(e) => e.stopPropagation()}
          onBlur={(e) => e.stopPropagation()}
          onKeyDown={(e) => e.stopPropagation()}
          value={headerSelectValue}
          onChange={(value: number[], option: any) => {
            setHeaderSelectValue(value);
            onHeaderSelectChange?.(value, option);
            // 将选择的完整模拟数据渲染到表格
            const selectedIds = Array.isArray(value) ? value : [];
            const selectedRows = simRows
              .filter((row) => selectedIds.includes(Number(row.id)))
              .map((row) => {
                const full = relatedMap[Number(row.id)];
                const relObj = (full?.rel_resource_datas || {}) as Record<number, any[]>;
                return {
                  id: row.id,
                  instance_name: row.instance_name,
                  ip: row.ip,
                  rel_resource_datas: relObj,
                  resource_action: undefined,
                  origin: 'dropdown' as const,
                };
              });
            setDataSource(selectedRows);
            onDataChange?.(selectedRows);
          }}
        />
      </Space.Compact>
    </Space>
  );

  const expandedRowRender = (record: DataSourceType) => {
    const relData = record.rel_resource_datas || {};
    return (
      <div
        style={{
          padding: '16px 24px 16px 40px',
          background: '#fafafa',
          border: '1px solid #f0f0f0',
          borderRadius: 8,
          position: 'relative',
          margin: '12px 0',
        }}
      >
        <GetResourceSubEditorTable
          modelId={modelId}
          label="资源列表"
          rel_resource_datas={relData}
          showDeleteButton={isShowSubRecordDeleteButton}
          isShowRecordSubCreateButton={isShowRecordSubCreateButton}
          onDataChange={(next) => {
            const updated = dataSource.map((it) =>
              it.id === record.id ? { ...it, rel_resource_datas: next } : it,
            );
            setDataSource(updated);
            onDataChange?.(updated);
          }}
        />
      </div>
    );
  };

  const getTableColumns = useCallback(() => {
    if (!localColumns || localColumns.length === 0) return [];
    const tableColumns = [...localColumns].map((col) => ({
      ...col,
      fieldProps: {
        ...(col.fieldProps || {}),
        autoComplete: 'off',
        onFocus: (e: any) => e.stopPropagation(),
        onBlur: (e: any) => e.stopPropagation(),
        onKeyDown: (e: any) => e.stopPropagation(),
        onInput: (e: any) => e.stopPropagation(),
      },
    }));
    const actionColumn = {
      title: '动作',
      dataIndex: 'resource_action',
      key: 'resource_action',
      valueType: 'text' as const,
      width: 100,
      renderFormItem: () => null,
      render: (_: any, record: DataSourceType) => {
        const map = { create: '新增', update: '更新', delete: '删除' } as const;
        return map[record.resource_action as keyof typeof map] || record.resource_action || '-';
      },
    };

    if (isShowSubRecordDeleteButton) {
      tableColumns.push({
        title: '操作',
        valueType: 'option',
        fixed: 'right',
        width: 160,
      });
    }

    tableColumns.splice(-1, 0, actionColumn);
    return tableColumns;
  }, [
    localColumns,
    isShowSubRecordDeleteButton,
    dataSource,
    onDataChange,
    headerSelectOptions,
    headerOptions,
    onHeaderSelectChange,
  ]);

  const memoColumns = useMemo(() => getTableColumns(), [getTableColumns]);
  const calcScrollX = useCallback(
    () => Math.max(960, (memoColumns.length || 0) * 150),
    [memoColumns.length],
  );

  return (
    <div
      onFocusCapture={(e) => e.stopPropagation()}
      onBlurCapture={(e) => e.stopPropagation()}
      onKeyDownCapture={(e) => e.stopPropagation()}
      onInputCapture={(e) => e.stopPropagation()}
    >
      <EditableProTable<DataSourceType>
        rowKey="id"
        scroll={{ x: calcScrollX(), y: 600 }}
        editableFormRef={editorFormRef}
        expandable={{ expandedRowRender }}
        headerTitle={renderHeaderTitle()}
        recordCreatorProps={false}
        loading={modelLoading}
        columns={memoColumns}
        value={dataSource}
        onChange={(rows) => {
          const next = rows.map((it) => {
            const exists = dataSource.some((ds) => ds.id === it.id);
            if (!exists && !it.resource_action) {
              it.resource_action = 'create' as const;
            } else if (exists) {
              const prev = dataSource.find((ds) => ds.id === it.id);
              const oldAction = prev?.resource_action;
              // 原先为 create：根据来源决定是否切为 update
              if (oldAction === 'create') {
                const origin = prev?.origin;
                const { resource_action, origin: _origin, ...newData } = it as any; // eslint-disable-line @typescript-eslint/no-unused-vars
                const oldData = { ...(prev || {}) } as any;
                delete oldData.resource_action;
                delete oldData.origin;
                const changed = JSON.stringify(oldData) !== JSON.stringify(newData);
                if (origin === 'dropdown' && changed) {
                  it.resource_action = 'update' as const;
                } else {
                  it.resource_action = 'create' as const;
                }
              } else {
                const { resource_action, origin: _origin, ...newData } = it as any; // eslint-disable-line @typescript-eslint/no-unused-vars
                const oldData = { ...(prev || {}) } as any;
                delete oldData.resource_action;
                delete oldData.origin;
                const changed = JSON.stringify(oldData) !== JSON.stringify(newData);
                if (changed && !oldAction) {
                  it.resource_action = 'update' as const;
                } else {
                  it.resource_action = oldAction || it.resource_action;
                }
              }
            }
            return it;
          });
          setDataSource(next);
          onDataChange?.(next);
        }}
        editable={{
          type: 'multiple',
          editableKeys,
          onChange: setEditableRowKeys,
          // onSave: async (rowKey, data) => {
          //   const nextData = { ...data } as DataSourceType;
          //   // 若当前行原本为 create，则保持为 create
          //   const existing = dataSource.find((it) => it.id === rowKey);
          //   if (existing?.resource_action === 'create') {
          //     if (existing?.origin === 'dropdown') {
          //       nextData.resource_action = 'update' as const;
          //     } else {
          //       nextData.resource_action = 'create' as const;
          //     }
          //   } else if (!nextData.resource_action) {
          //     nextData.resource_action = 'update' as const;
          //   }
          //   const updated = dataSource.map((it) => (it.id === rowKey ? { ...it, ...nextData } : it));
          //   setDataSource(updated);
          //   onDataChange?.(updated);
          //   return updated.find((it) => it.id === rowKey) || nextData;
          // },
          // onDelete: async (rowKey) => {
          //   // 从表格数据删除
          //   const next = dataSource.filter((it) => it.id !== rowKey);
          //   setDataSource(next);
          //   onDataChange?.(next);

          //   // 联动更新资源列表下拉框的选择：移除被删除行对应的 value
          //   setHeaderSelectValue((prev) => {
          //     const prevArr = Array.isArray(prev) ? prev : [];
          //     const removedVal = Number(rowKey);
          //     const newSelected = prevArr.filter((v) => v !== removedVal);

          //     const usedOptions =
          //       headerSelectOptions && headerSelectOptions.length > 0
          //         ? headerSelectOptions
          //         : headerOptions;
          //     const selectedOptionObjs = usedOptions.filter((opt) =>
          //       newSelected.includes(Number(opt.value)),
          //     );
          //     onHeaderSelectChange?.(newSelected, selectedOptionObjs);

          //     return newSelected;
          //   });

          //   return true;
          // },
          actionRender: (row, config, dom) => [dom.save, dom.delete, dom.cancel],
        }}
      />
    </div>
  );
};

export default GetResourceEditorTable;
