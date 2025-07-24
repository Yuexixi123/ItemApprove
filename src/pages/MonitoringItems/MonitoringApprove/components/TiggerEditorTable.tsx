import {
  EditableFormInstance,
  EditableProTable,
  ProFormInstance,
} from '@ant-design/pro-components';
import { useRef, useState, useEffect } from 'react';
import { useModel } from '@umijs/max';

type DataSourceType = {
  id: React.Key;
  [key: string]: any; // 允许任意属性
};

// 修改组件接口，添加trigger_resource_datas参数
const TiggerEditableTable: React.FC<{
  value: string;
  label: string;
  trigger_resource_datas?: DataSourceType[];
}> = ({ value, label, trigger_resource_datas = [] }) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
  const formRef = useRef<ProFormInstance<any>>();
  const editorFormRef = useRef<EditableFormInstance<DataSourceType>>();

  // 使用监控审批模型
  const { triggerColumns, loading, fetchTriggerModelAttributes } = useModel(
    'monitoring.index',
    (model) => ({
      triggerColumns: model.triggerColumns, // 使用独立的触发器列
      loading: model.loading,
      fetchTriggerModelAttributes: model.fetchTriggerModelAttributes,
    }),
  );

  // 组件挂载时获取触发器模型属性
  useEffect(() => {
    fetchTriggerModelAttributes();
  }, [fetchTriggerModelAttributes]);

  // 删除默认列定义，不再需要

  // 在组件层面添加操作列
  const getTableColumns = () => {
    // 如果没有动态列，返回空数组
    if (triggerColumns.length === 0) {
      // 使用triggerColumns
      return [];
    }

    // 复制一份model返回的列定义，避免直接修改原始数据
    const tableColumns = [...triggerColumns]; // 使用triggerColumns

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
            const tableDataSource = formRef.current?.getFieldValue('table') as DataSourceType[];
            formRef.current?.setFieldsValue({
              table: tableDataSource.filter((item) => item.id !== record.id),
            });
          }}
        >
          删除
        </a>,
      ],
    });

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
      }}
      editableFormRef={editorFormRef}
      headerTitle={label}
      name={`tigger` + value}
      recordCreatorProps={{
        record: () => ({ id: (Math.random() * 1000000).toFixed(0) }),
        creatorButtonText: '添加触发器',
      }}
      loading={loading}
      columns={getTableColumns()}
      // 使用传入的trigger_resource_datas作为数据源
      dataSource={trigger_resource_datas}
      editable={{
        type: 'multiple',
        editableKeys,
        onChange: setEditableRowKeys,
        actionRender: (row, config, defaultDom) => {
          return [defaultDom.save, defaultDom.delete, defaultDom.cancel];
        },
      }}
    />
  );
};

export default TiggerEditableTable;
