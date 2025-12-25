import { EditableFormInstance, EditableProTable } from '@ant-design/pro-components';
import { useRef, useState, useEffect } from 'react';
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
  onDataChange?: (data: DataSourceType[]) => void;
  showDeleteButton?: boolean; // 控制是否显示删除按钮
}> = ({ label, trigger_resource_datas = [], onDataChange, showDeleteButton = false }) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
  const [dataSource, setDataSource] = useState<DataSourceType[]>([]);
  const editorFormRef = useRef<EditableFormInstance<DataSourceType>>();

  // 使用监控审批模型
  const { triggerColumns, fetchTriggerModelAttributes } = useModel('monitoring.index', (model) => ({
    triggerColumns: model.triggerColumns, // 使用独立的触发器列
    fetchTriggerModelAttributes: model.fetchTriggerModelAttributes,
  }));

  // 组件挂载时获取触发器模型属性
  useEffect(() => {
    fetchTriggerModelAttributes();
  }, [fetchTriggerModelAttributes]);

  // 生成唯一ID的函数
  const generateUniqueId = () => {
    return `trigger_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 格式化数据源，确保每个项都有唯一的id
  useEffect(() => {
    const formattedData = trigger_resource_datas.map((item) => ({
      ...item,
      id: item.id || generateUniqueId(),
      // 只有当字段不存在时才设置默认值，避免覆盖已有的action
      trigger_resource_action: item.trigger_resource_action || undefined,
    }));

    // 只有当数据真正发生变化时才更新状态，避免无限循环
    setDataSource((prevData) => {
      // 简单的长度和内容比较，避免不必要的更新
      if (prevData.length !== formattedData.length) {
        return formattedData;
      }

      // 检查是否有实质性变化
      const hasChanges = formattedData.some((item, index) => {
        const prevItem = prevData[index];
        return (
          !prevItem || prevItem.id !== item.id || JSON.stringify(prevItem) !== JSON.stringify(item)
        );
      });

      return hasChanges ? formattedData : prevData;
    });
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
      width: 160,
      render: (text, record, _, action) => {
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
        if (showDeleteButton) {
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
        }

        return operationButtons;
      },
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

  return (
    <EditableProTable<DataSourceType>
      rowKey="id"
      scroll={{
        x: calculateScrollWidth(),
        y: 400, // 子表格高度设置为400px
      }}
      virtual // 启用虚拟滚动
      pagination={false} // 虚拟滚动时禁用分页
      editableFormRef={editorFormRef}
      headerTitle={label}
      recordCreatorProps={{
        record: () => {
          const newRecord: DataSourceType = {
            id: generateUniqueId(),
            trigger_resource_action: 'create' as const,
          };
          return newRecord;
        },
        creatorButtonText: '添加触发器',
      }}
      columns={getTableColumns()}
      // 使用内部状态的数据源
      value={dataSource}
      onChange={(data) => {
        const mutableData = [...data];

        setDataSource(mutableData);
        onDataChange?.(mutableData);
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
