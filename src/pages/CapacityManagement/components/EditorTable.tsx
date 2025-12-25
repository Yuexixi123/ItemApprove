import { EditableFormInstance, EditableProTable } from '@ant-design/pro-components';
import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useModel } from '@umijs/max';
import SubEditorTable from './SubEditorTable';

type DataSourceType = {
  id: React.Key;
  title?: string;
  decs?: string;
  state?: string;
  created_at?: number;
  update_at?: number;
  children?: DataSourceType[];
  rel_resource_datas?: any[];
  host_resource_id?: number;
  instance_name?: string;
  resource_action?: 'create' | 'update' | 'delete';
  [key: string]: any; // 允许其他动态属性
};

// 修改组件接口，添加onSearch回调和onDataChange回调
const EditableTable: React.FC<{
  modelId?: number;
  resourceData?: any[];
  loading?: boolean;
  onSearch?: (hostResourceId?: number) => void; // 新增搜索回调
  onDataChange?: (data: DataSourceType[]) => void; // 新增数据变化回调
  cachedData?: any[]; // 缓存的原始数据
  approvalId?: number;
  row?: Record<string, any>;
  isShowRecordCreateButton?: boolean;
  isShowRecordSubCreateButton?: boolean;
  isShowUpdateButton?: boolean;
  modelNameMap?: Record<number, string>; // 新增：外部传入的模型名称映射
}> = ({
  modelId,
  loading: externalLoading = false,
  onDataChange,
  cachedData = [],
  approvalId,
  row,
  isShowRecordCreateButton = true,
  isShowRecordSubCreateButton = true,
  isShowUpdateButton = true,
  modelNameMap,
}) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
  const editorFormRef = useRef<EditableFormInstance<DataSourceType>>();

  // 变更追踪状态（移除未使用的状态变量，直接通过回调通知父组件）

  // 使用容量管理模型（改为每实例独立列，避免互相覆盖）
  const { loading: modelLoading, fetchModelColumns } = useModel('capacity.index', (model) => ({
    loading: model.loading,
    fetchModelColumns: model.fetchModelColumns,
  }));

  // 本组件自己的列缓存，按当前 modelId 独立维护
  const [localColumns, setLocalColumns] = useState<any[]>([]);

  // 获取并设置本地列，避免影响其他标签页/组件
  useEffect(() => {
    let mounted = true;
    const run = async () => {
      if (modelId) {
        if (row?.approval_status === 2) {
          const cols = await fetchModelColumns(modelId, approvalId);
          if (mounted) setLocalColumns(cols || []);
        } else {
          const cols = await fetchModelColumns(modelId);
          if (mounted) setLocalColumns(cols || []);
        }
      } else if (mounted) {
        setLocalColumns([]);
      }
    };
    run();
    return () => {
      mounted = false;
    };
  }, [modelId, approvalId, fetchModelColumns]);

  // 处理资源数据，确保每条记录都有唯一ID
  const [dataSource, setDataSource] = useState<DataSourceType[]>([]);

  const generateUniqueId = () => {
    return `item_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  };

  // 同步回显缓存数据到表格
  useEffect(() => {
    const used = new Set<string>();
    const formatted = (cachedData || []).map((item: any) => {
      let id = item?.id as React.Key | undefined;
      if (!id || used.has(String(id))) id = generateUniqueId();
      used.add(String(id));
      return { ...item, id, resource_action: item?.resource_action || undefined } as DataSourceType;
    });
    setDataSource(formatted);
  }, [cachedData]);

  // 为每个记录预先计算好 triggerData，避免每次渲染都生成新的数组引用
  const expandedDataMap = useMemo(() => {
    const map: Record<string, DataSourceType[]> = {};
    dataSource.forEach((record) => {
      const rel = record.rel_resource_datas;
      const key = String(record.id);
      if (Array.isArray(rel)) {
        map[key] = rel;
      } else if (rel && typeof rel === 'object') {
        map[key] = Object.keys(rel).flatMap((midStr) => {
          const mid = Number(midStr);
          const arr = Array.isArray(rel[mid]) ? rel[mid] : [];
          return arr.map((child: any) => ({ ...child, model_id: mid }));
        });
      } else {
        map[key] = [];
      }
    });
    return map;
  }, [dataSource]);

  const expandedRowRender = (record: DataSourceType) => {
    const triggerData = expandedDataMap[String(record.id)] || [];

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
        <SubEditorTable
          value={record.id.toString()}
          label="主机资源列表"
          rel_resource_datas={triggerData}
          isShowRecordSubCreateButton={isShowRecordSubCreateButton}
          showDeleteButton={false}
          modelNameMap={modelNameMap}
          onDataChange={(triggerData) => {
            // 更新对应监控项的rel_resource_datas字段
            const updatedDataSource = dataSource.map((item) => {
              if (item.id === record.id) {
                const updatedItem = { ...item, rel_resource_datas: triggerData };
                return updatedItem;
              }
              return item;
            });
            // 更新本地数据源
            setDataSource(updatedDataSource);
            // 通知父组件数据变化
            onDataChange?.(updatedDataSource);
          }}
        />
      </div>
    );
  };

  // 在组件层面添加操作列
  const getTableColumns = useCallback(() => {
    // 如果没有本地动态列，返回空数组
    if (!localColumns || localColumns.length === 0) {
      return [];
    }
    // 复制一份model返回的列定义，避免直接修改原始数据
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
      editable: false,
      hideInForm: true,
      formItemProps: { name: undefined },
      renderFormItem: () => null, // 在表单中不渲染
      render: (_: any, record: DataSourceType) => {
        const actionMap = {
          create: '新增',
          update: '更新',
          delete: '删除',
        };
        // 修正字段名，应该使用 item_resource_action 而不是 trigger_resource_action
        return (
          actionMap[record.resource_action as keyof typeof actionMap] ||
          record.resource_action ||
          '-'
        );
      },
    };
    // 添加动作字段列

    if (isShowUpdateButton) {
      // 添加操作列
      tableColumns.push({
        title: '操作',
        valueType: 'option',
        fixed: 'right',
        width: 160,
        render: (text: any, record: DataSourceType, _: number, action: any) => {
          const operationButtons = [
            <a
              key="editable"
              onClick={() => {
                action?.startEditable?.(record.id, record);
              }}
            >
              编辑
            </a>,
          ];

          // 根据showDeleteButton属性决定是否添加删除按钮
          operationButtons.push(
            <a
              key="delete"
              onClick={() => {
                // 直接从数据源中移除
                const newDataSource = dataSource.filter((item) => item.id !== record.id);
                setDataSource(newDataSource);
                onDataChange?.(newDataSource);
              }}
            >
              删除
            </a>,
          );

          return operationButtons;
        },
      });
    }

    // 将动作列插入到操作列前面
    tableColumns.splice(-1, 0, actionColumn);

    return tableColumns;
  }, [localColumns, dataSource, onDataChange]);

  // 计算表格的滚动宽度
  const columnsCount = useMemo(() => getTableColumns().length, [getTableColumns]);
  const calculateScrollWidth = useCallback(() => {
    const averageColumnWidth = 150;
    return Math.max(960, columnsCount * averageColumnWidth);
  }, [columnsCount]);

  return (
    <div
      onFocusCapture={(e) => e.stopPropagation()}
      onBlurCapture={(e) => e.stopPropagation()}
      onKeyDownCapture={(e) => e.stopPropagation()}
      onInputCapture={(e) => e.stopPropagation()}
    >
      <EditableProTable<DataSourceType>
        rowKey="id"
        scroll={{
          x: calculateScrollWidth(),
          y: 600, // 设置固定高度，启用垂直滚动
        }}
        // virtual // 启用虚拟滚动
        // pagination={false} // 虚拟滚动时禁用分页
        editableFormRef={editorFormRef}
        expandable={{
          expandedRowRender,
        }}
        recordCreatorProps={
          isShowRecordCreateButton
            ? {
                record: () => ({
                  id: generateUniqueId(),
                  resource_action: 'create' as const,
                }),
                creatorButtonText: '添加一条数据',
              }
            : false
        }
        loading={modelLoading || externalLoading}
        columns={getTableColumns()}
        value={dataSource}
        onChange={(value) => {
          const newDataSource = [...value];
          const processedDataSource = newDataSource.map((item) => {
            // 检查是否为新增的记录（在原dataSource中不存在）
            const existingItem = dataSource.find((existingItem) => existingItem.id === item.id);

            if (!existingItem) {
              // 这是新增的记录，如果还没有设置action，则设置为create
              return {
                ...item,
                resource_action: item.resource_action || ('create' as const),
              };
            } else {
              // 检查数据是否真正发生了变化（排除action字段本身）
              const { resource_action: oldAction, ...oldData } = existingItem;
              const { resource_action, ...newData } = item; // eslint-disable-line @typescript-eslint/no-unused-vars
              const hasChanged = JSON.stringify(oldData) !== JSON.stringify(newData);

              if (hasChanged && !oldAction) {
                // 数据发生变化且原来没有action标记，设置为update
                return {
                  ...item,
                  resource_action: 'update' as const,
                };
              } else {
                // 数据未变化或已有action标记，保持原有标记
                return {
                  ...item,
                  resource_action: oldAction || item.resource_action,
                };
              }
            }
          });

          // 直接更新状态和通知父组件，避免额外的比较逻辑导致问题
          setDataSource(processedDataSource);
          // 通知父组件数据变化
          onDataChange?.(processedDataSource);
        }}
        editable={{
          type: 'multiple',
          editableKeys,
          onChange: setEditableRowKeys,
          onSave: async (rowKey, data) => {
            // 编辑保存时，保持原有的 resource_action，不做修改
            const nextData = { ...data } as DataSourceType;

            // 查找原始记录以保持其 resource_action
            const originalRecord = dataSource.find((item) => item.id === rowKey);
            if (originalRecord?.resource_action) {
              // 如果原始记录有 resource_action，保持不变
              nextData.resource_action = originalRecord.resource_action;
            } else if (!nextData.resource_action) {
              // 如果原始记录没有 resource_action 且当前数据也没有，设置为 update
              nextData.resource_action = 'update' as const;
            }

            // 仅更新已存在的记录，避免重复添加导致重复 key
            const updatedDataSource = dataSource.map((item) =>
              item.id === rowKey ? { ...item, ...nextData } : item,
            );

            setDataSource(updatedDataSource);
            onDataChange?.(updatedDataSource);

            return updatedDataSource.find((item) => item.id === rowKey) || nextData;
          },
          actionRender: (row, config, defaultDom) => {
            return [defaultDom.save, defaultDom.delete, defaultDom.cancel];
          },
        }}
      />
    </div>
  );
};

export default EditableTable;
