import { EditableFormInstance, EditableProTable } from '@ant-design/pro-components';
import { useRef, useState, useEffect } from 'react';
import { Space, Button, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import TiggerEditableTable from './TiggerEditorTable';
import { useModel } from '@umijs/max';

type DataSourceType = {
  id: React.Key;
  title?: string;
  decs?: string;
  state?: string;
  created_at?: number;
  update_at?: number;
  children?: DataSourceType[];
  trigger_resource_datas?: any[];
  host_id?: number;
};

// 修改组件接口，添加onSearch回调
const EditableTable: React.FC<{
  value: number;
  modelId?: number;
  resourceData?: any[];
  loading?: boolean;
  selectedSysId?: number;
  onSearch?: (hostResourceId?: number) => void; // 新增搜索回调
}> = ({
  value,
  modelId = 1,
  resourceData = [],
  loading: externalLoading = false,
  selectedSysId,
  onSearch,
}) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
  const [selectedHostId, setSelectedHostId] = useState<number>(); // 新增主机搜索状态
  const editorFormRef = useRef<EditableFormInstance<DataSourceType>>();

  // 使用监控审批模型
  const {
    columns,
    loading: modelLoading,
    fetchModelAttributes,
  } = useModel('monitoring.index', (model) => ({
    columns: model.columns,
    loading: model.loading,
    fetchModelAttributes: model.fetchModelAttributes,
  }));

  // 使用selectOption模型获取主机选项
  const { resourceNameRelationship, fetchResourceNameRelationship } = useModel(
    'selectOption',
    (model) => ({
      resourceNameRelationship: model.resourceNameRelationship,
      fetchResourceNameRelationship: model.fetchResourceNameRelationship,
    }),
  );

  // 组件挂载时获取模型属性
  useEffect(() => {
    if (modelId) {
      fetchModelAttributes(modelId);
    }
  }, [modelId, fetchModelAttributes]);

  // 当selectedSysId变化时，获取主机选项
  useEffect(() => {
    if (selectedSysId) {
      fetchResourceNameRelationship(selectedSysId, { model_key: 'host' });
    }
  }, [selectedSysId, fetchResourceNameRelationship]);

  // 处理资源数据，确保每条记录都有唯一ID
  const [dataSource, setDataSource] = useState<DataSourceType[]>([]);

  // 当resourceData变化时更新dataSource
  // 在 useEffect 中添加调试
  useEffect(() => {
    console.log('EditorTable 接收到的 resourceData:', resourceData);

    if (resourceData && resourceData.length > 0) {
      const formattedData = resourceData.map((item) => ({
        ...item,
        id: item.id || (Math.random() * 1000000).toFixed(0),
      }));
      console.log('格式化后的数据:', formattedData);
      setDataSource(formattedData);
    } else {
      console.log('resourceData 为空，清空 dataSource');
      setDataSource([]);
    }
  }, [resourceData]);

  // 处理主机搜索
  const handleHostSearch = () => {
    if (onSearch) {
      onSearch(selectedHostId);
    }
  };

  // 清空搜索
  const handleClearSearch = () => {
    setSelectedHostId(undefined);
    if (onSearch) {
      onSearch(undefined);
    }
  };

  // 自定义headerTitle，添加搜索功能
  const renderHeaderTitle = () => {
    return (
      <Space>
        <span>监控项列表</span>
        <Space.Compact>
          <Select
            placeholder="请选择主机"
            options={resourceNameRelationship}
            value={selectedHostId}
            onChange={setSelectedHostId}
            showSearch
            style={{ width: 200 }}
            optionFilterProp="label"
            allowClear
          />
          <Button type="primary" icon={<SearchOutlined />} onClick={handleHostSearch}>
            搜索
          </Button>
          <Button onClick={handleClearSearch}>清空</Button>
        </Space.Compact>
      </Space>
    );
  };

  const expandedRowRender = (record: DataSourceType) => {
    const triggerData = record.trigger_resource_datas || [];

    return (
      <div
        style={{
          paddingLeft: 40,
          background: '#fafafa',
          position: 'relative',
          margin: '-16px 0',
        }}
      >
        <TiggerEditableTable
          value={record.id.toString()}
          label="触发器列表"
          trigger_resource_datas={triggerData}
        />
      </div>
    );
  };

  // 在组件层面添加操作列
  const getTableColumns = () => {
    if (columns.length === 0) {
      return [];
    }

    const tableColumns = [...columns];

    // 在第一个位置添加主机字段列
    const hostColumn = {
      title: '主机',
      dataIndex: 'host_id',
      key: 'host_id',
      valueType: 'select' as const,
      fieldProps: {
        options: resourceNameRelationship,
        placeholder: '请选择主机',
        showSearch: true,
        optionFilterProp: 'label',
      },
      formItemProps: {
        rules: [
          {
            required: true,
            message: '请选择主机',
          },
        ],
      },
      width: 200,
    };

    // 将主机列插入到第一个位置
    tableColumns.unshift(hostColumn);

    // 添加操作列
    tableColumns.push({
      title: '操作',
      valueType: 'option',
      width: '',
      fixed: 'right',
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
            setDataSource(dataSource.filter((item) => item.id !== record.id));
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
    const averageColumnWidth = 150;
    return Math.max(960, columnsCount * averageColumnWidth);
  };

  return (
    <EditableProTable<DataSourceType>
      rowKey="id"
      scroll={{
        x: calculateScrollWidth(),
      }}
      editableFormRef={editorFormRef}
      headerTitle={renderHeaderTitle()}
      name={value}
      expandable={{ expandedRowRender }}
      recordCreatorProps={{
        record: () => ({ id: (Math.random() * 1000000).toFixed(0) }),
        creatorButtonText: '添加监控项',
      }}
      loading={modelLoading || externalLoading}
      columns={getTableColumns()}
      dataSource={dataSource}
      value={dataSource}
      onChange={(value) => setDataSource([...value])}
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

export default EditableTable;
