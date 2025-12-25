import { EditableFormInstance, EditableProTable } from '@ant-design/pro-components';
import { useRef, useState, useEffect, useCallback } from 'react';
import { useModel } from '@umijs/max';

type DataSourceType = {
  id: React.Key;
  trigger_resource_action?: 'create' | 'update' | 'delete';
  [key: string]: any; // 允许任意属性
};

// 修改组件接口，添加trigger_resource_datas参数和变更追踪
const TriggerEditableTable: React.FC<{
  value: string;
  label: string;
  trigger_resource_datas?: DataSourceType[];
  cachedData?: DataSourceType[];
  onChangeTracking?: (changes: {
    created: DataSourceType[];
    updated: DataSourceType[];
    deleted: DataSourceType[];
  }) => void;
  onDataChange?: (data: DataSourceType[]) => void;
}> = ({ label, trigger_resource_datas = [], cachedData = [], onChangeTracking, onDataChange }) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
  const [dataSource, setDataSource] = useState<DataSourceType[]>([]);
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 标记是否为初始加载
  const editorFormRef = useRef<EditableFormInstance<DataSourceType>>();

  // 深度比较两个对象是否相等（忽略特定字段）
  const deepEqual = (
    obj1: any,
    obj2: any,
    ignoreFields: string[] = ['trigger_resource_action'],
  ) => {
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

    const keys1 = Object.keys(obj1).filter((key) => !ignoreFields.includes(key));
    const keys2 = Object.keys(obj2).filter((key) => !ignoreFields.includes(key));

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!deepEqual(obj1[key], obj2[key], ignoreFields)) return false;
    }

    return true;
  };

  // 变更追踪函数
  const trackChanges = useCallback(
    (newData: DataSourceType[]) => {
      if (!onChangeTracking) return;

      const created: DataSourceType[] = [];
      const updated: DataSourceType[] = [];
      const deleted: DataSourceType[] = [];

      // 查找新增和修改的项
      newData.forEach((item) => {
        // 检查item是否已经有trigger_resource_action字段
        if (item.trigger_resource_action) {
          // 如果已经有action字段，直接使用
          if (item.trigger_resource_action === 'create') {
            created.push({ ...item });
          } else if (item.trigger_resource_action === 'update') {
            updated.push({ ...item });
          } else if (item.trigger_resource_action === 'delete') {
            deleted.push({ ...item });
          }
          return;
        }

        // 如果没有action字段，则进行比较判断
        const cachedItem = cachedData.find((cached) => cached.id === item.id);
        if (!cachedItem) {
          // 新增项
          created.push({ ...item, trigger_resource_action: 'create' });
        } else {
          // 使用深度比较检查是否有修改
          if (!deepEqual(item, cachedItem)) {
            updated.push({ ...item, trigger_resource_action: 'update' });
          }
        }
      });

      // 查找删除的项
      if (cachedData && cachedData.length > 0) {
        cachedData.forEach((cachedItem) => {
          const exists = newData.find((item) => item.id === cachedItem.id);
          if (!exists) {
            deleted.push({ ...cachedItem, trigger_resource_action: 'delete' });
          }
        });
      }

      // 只有当有实际变更时才通知父组件
      if (created.length > 0 || updated.length > 0 || deleted.length > 0) {
        console.log('触发器检测到数据变更:', { created, updated, deleted });
        onChangeTracking({ created, updated, deleted });
      } else {
        console.log('触发器未检测到数据变更，不触发回调');
        // 如果没有变更，不调用回调，避免触发不必要的状态更新
      }
    },
    [onChangeTracking, cachedData],
  );

  // 使用监控审批模型
  const { triggerColumns, fetchTriggerModelAttributes } = useModel('monitoring.index', (model) => ({
    triggerColumns: model.triggerColumns, // 使用独立的触发器列
    fetchTriggerModelAttributes: model.fetchTriggerModelAttributes,
  }));

  // 组件挂载时获取触发器模型属性
  useEffect(() => {
    fetchTriggerModelAttributes();
  }, [fetchTriggerModelAttributes]);

  // 格式化数据源，确保每个项都有唯一的id
  useEffect(() => {
    const formattedData = trigger_resource_datas.map((item, index) => ({
      ...item,
      id: item.id || `trigger_${index}_${Date.now()}`,
      // 只有当字段不存在时才设置默认值，避免覆盖已有的action
      trigger_resource_action: item.trigger_resource_action || undefined,
    }));
    setIsInitialLoad(true); // 标记为初始加载
    setDataSource(formattedData);

    // 注意：这里不调用trackChanges，因为这是初始数据加载，不是用户编辑操作
  }, [trigger_resource_datas]);

  // 在组件层面添加操作列
  const getTableColumns = () => {
    // 如果没有动态列，返回空数组
    if (triggerColumns.length === 0) {
      // 使用triggerColumns
      return [];
    }

    // 复制一份model返回的列定义，避免直接修改原始数据
    const tableColumns = [...triggerColumns]; // 使用triggerColumns

    // 添加动作字段列
    const actionColumn = {
      title: '动作',
      dataIndex: 'trigger_resource_action',
      key: 'trigger_resource_action',
      valueType: 'text' as const,
      width: 100,
      renderFormItem: () => null, // 在表单中不渲染
      render: (_: any, record: DataSourceType) => {
        const actionMap = {
          create: '新增',
          update: '更新',
          delete: '删除',
        };
        return (
          actionMap[record.trigger_resource_action as keyof typeof actionMap] ||
          record.trigger_resource_action ||
          '-'
        );
      },
    };

    // 添加操作列
    tableColumns.push({
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 200,
      render: (text, record, _, action) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id, record);
          }}
        >
          编辑
        </a>,
        <a
          key="delete"
          onClick={() => {
            // 为被删除的记录设置action字段
            const deletedRecord = { ...record, trigger_resource_action: 'delete' as const };

            // 先通知变更追踪删除操作
            if (onChangeTracking) {
              onChangeTracking({
                created: [],
                updated: [],
                deleted: [deletedRecord],
              });
            }

            // 然后从数据源中移除
            const newDataSource = dataSource.filter((item) => item.id !== record.id);
            setDataSource(newDataSource);
            onDataChange?.(newDataSource);
          }}
        >
          删除
        </a>,
      ],
    });

    // 将动作列插入到操作列前面
    tableColumns.splice(-1, 0, actionColumn);

    return tableColumns;
  };

  // 计算表格的滚动宽度
  const calculateScrollWidth = () => {
    const columnsCount = getTableColumns().length;
    // 每列平均宽度假设为 150px，可以根据实际情况调整
    const averageColumnWidth = 150;
    // 计算总宽度，确保有足够的空间显示所有列
    return Math.max(960, columnsCount * averageColumnWidth);
  };

  console.log('dataSource', dataSource);

  return (
    <EditableProTable<DataSourceType>
      rowKey="id"
      scroll={{
        x: calculateScrollWidth(),
      }}
      editableFormRef={editorFormRef}
      headerTitle={label}
      recordCreatorProps={{
        record: () => ({
          id: (Math.random() * 1000000).toFixed(0),
          trigger_resource_action: 'create',
        }),
        creatorButtonText: '添加触发器',
      }}
      columns={getTableColumns()}
      // 使用内部状态的数据源
      value={dataSource}
      onChange={(data) => {
        const mutableData = [...data];

        // 调试：检查数据中的trigger_resource_action字段
        console.log('TriggerEditorTable onChange - 原始数据:', data);
        console.log('TriggerEditorTable onChange - 处理后数据:', mutableData);
        mutableData.forEach((item, index) => {
          console.log(`触发器 ${index}:`, {
            id: item.id,
            trigger_resource_action: item.trigger_resource_action,
            hasField: 'trigger_resource_action' in item,
          });
        });

        setDataSource(mutableData);
        onDataChange?.(mutableData);
        if (!isInitialLoad) {
          trackChanges(mutableData);
        }
        setIsInitialLoad(false); // 首次变更后标记为非初始加载
      }}
      editable={{
        type: 'multiple',
        editableKeys,
        onChange: setEditableRowKeys,
        onSave: async (rowKey, data) => {
          // 编辑保存时，为现有数据设置trigger_resource_action字段
          if (!data.trigger_resource_action) {
            data.trigger_resource_action = 'update';
          }
          console.log('编辑保存触发器数据:', data);
          return data;
        },
        actionRender: (row, config, defaultDom) => {
          return [defaultDom.save, defaultDom.delete, defaultDom.cancel];
        },
      }}
    />
  );
};

export default TriggerEditableTable;
