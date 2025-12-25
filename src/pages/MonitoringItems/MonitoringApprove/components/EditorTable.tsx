import { EditableFormInstance, EditableProTable, ProColumns } from '@ant-design/pro-components';
// Force refresh cache
import { useRef, useState, useEffect } from 'react';
import { Space, Button, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import TiggerEditableTable from './TriggerEditorTable';
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
  host_resource_id?: number;
  instance_name?: string;
  item_resource_action?: 'create' | 'update' | 'delete';
  [key: string]: any; // 允许其他动态属性
};

// 修改组件接口，添加onSearch回调和onDataChange回调
const EditableTable: React.FC<{
  modelId?: number;
  resourceData?: any[];
  loading?: boolean;
  selectedSysId?: number;
  onSearch?: (hostResourceId?: number) => void; // 新增搜索回调
  onDataChange?: (data: DataSourceType[]) => void; // 新增数据变化回调
  cachedData?: any[]; // 缓存的原始数据
}> = ({
  modelId = 1,
  resourceData = [],
  loading: externalLoading = false,
  selectedSysId,
  onSearch,
  onDataChange,
  cachedData = [],
}) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
  const [selectedHostId, setSelectedHostId] = useState<number>(); // 新增主机搜索状态
  const editorFormRef = useRef<EditableFormInstance<DataSourceType>>();

  // 变更追踪状态（移除未使用的状态变量，直接通过回调通知父组件）

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

  // 生成唯一ID的函数
  const generateUniqueId = () => {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 当resourceData或cachedData变化时更新dataSource
  useEffect(() => {
    // 优先使用cachedData（用户编辑后的数据），如果没有则使用resourceData（初始数据）
    const dataToUse = cachedData && cachedData.length > 0 ? cachedData : resourceData;

    if (dataToUse && dataToUse.length > 0) {
      const formattedData = dataToUse.map((item) => ({
        ...item,
        id: item.id || generateUniqueId(),
        // 保留原有的action标记，如果没有则不设置（原始数据不应该有action标记）
        item_resource_action: item.item_resource_action,
      }));

      setDataSource(formattedData);
    } else {
      setDataSource([]);
    }
  }, [resourceData, cachedData, modelId, externalLoading, selectedSysId]);

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
          showDeleteButton={false}
          onDataChange={(triggerData) => {
            console.log('EditorTable - 触发器数据变化:', { recordId: record.id, triggerData });

            // 更新对应监控项的trigger_resource_datas字段
            const updatedDataSource = dataSource.map((item) => {
              if (item.id === record.id) {
                const updatedItem = { ...item, trigger_resource_datas: triggerData };
                console.log('EditorTable - 更新监控项触发器数据:', {
                  original: item,
                  updated: updatedItem,
                });
                return updatedItem;
              }
              return item;
            });

            console.log('EditorTable - 触发器变化后数据源:', updatedDataSource);

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
  const getTableColumns = (): ProColumns<DataSourceType>[] => {
    // 如果columns为空或未定义，返回基础列结构
    if (!columns || columns.length === 0) {
      return [
        {
          title: '主机',
          dataIndex: 'host_resource_id',
          key: 'host_resource_id',
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
        } as ProColumns<DataSourceType>,
        {
          title: '操作',
          valueType: 'option' as const,
          width: 150,
          fixed: 'right' as const,
          render: (text: any, record: DataSourceType, _: any, action: any) => [
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
                const newDataSource = dataSource.filter((item) => item.id !== record.id);
                setDataSource(newDataSource);
                // 通知父组件数据变化
                onDataChange?.(newDataSource);
              }}
            >
              删除
            </a>,
          ],
        } as ProColumns<DataSourceType>,
      ];
    }

    // 处理从ColumnGenerator生成的columns，确保动态属性正确应用
    const processedColumns = columns.map((column: ProColumns<any>) => {
      const processedColumn = { ...column };

      if (
        processedColumn.fieldProps &&
        typeof processedColumn.fieldProps === 'object' &&
        'disabled' in processedColumn.fieldProps &&
        processedColumn.fieldProps.disabled
      ) {
        processedColumn.editable = false;
      }

      // 特殊处理switch类型字段的render函数，确保无数据时默认渲染为'是'
      if (processedColumn.valueType === 'switch') {
        // 直接重写render函数，不保留原始函数
        processedColumn.render = (text: any, record: any) => {
          // 从record中获取实际的字段值，而不是使用已经渲染的text
          const fieldKey = processedColumn.dataIndex as string;
          const actualValue = record[fieldKey];

          // 默认处理：无数据时渲染为'是'
          if (actualValue === null || actualValue === undefined) {
            return '-';
          }
          return actualValue ? '是' : '否';
        };
      }

      return processedColumn;
    });

    const tableColumns = [...processedColumns];

    // 在第一个位置添加主机字段列
    const hostColumn = {
      title: '主机',
      dataIndex: 'host_resource_id',
      key: 'host_resource_id',
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

    // 添加动作字段列
    const actionColumn = {
      title: '动作',
      dataIndex: 'item_resource_action',
      key: 'item_resource_action',
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
          actionMap[record.item_resource_action as keyof typeof actionMap] ||
          record.item_resource_action ||
          '-'
        );
      },
    };

    // 添加操作列
    tableColumns.push({
      title: '操作',
      valueType: 'option',
      width: '',
      fixed: 'right',
      render: (text: any, record: DataSourceType, _: any, action: any) => [
        <a
          key="editable"
          onClick={() => {
            action?.startEditable?.(record.id, record);
          }}
        >
          编辑
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
    const averageColumnWidth = 150;
    return Math.max(960, columnsCount * averageColumnWidth);
  };

  return (
    <EditableProTable<DataSourceType>
      rowKey="id"
      scroll={{
        x: calculateScrollWidth(),
        y: 600, // 设置固定高度，启用垂直滚动
      }}
      virtual // 启用虚拟滚动
      pagination={false} // 虚拟滚动时禁用分页
      editableFormRef={editorFormRef}
      headerTitle={renderHeaderTitle()}
      expandable={{ expandedRowRender }}
      recordCreatorProps={{
        record: () => ({
          id: generateUniqueId(),
          item_resource_action: 'create' as const,
        }),
        creatorButtonText: '添加监控项',
      }}
      loading={modelLoading || externalLoading}
      columns={getTableColumns()}
      value={dataSource}
      onChange={(value) => {
        const newDataSource = [...value];
        console.log('EditorTable - onChange触发:', newDataSource);

        // 智能处理数据action标记：新建记录标记为create，编辑过的记录标记为update，未变化的记录不设置标记
        const processedDataSource = newDataSource.map((item) => {
          // 检查是否为新增的记录（在原dataSource中不存在）
          const existingItem = dataSource.find((existingItem) => existingItem.id === item.id);

          if (!existingItem) {
            // 这是新增的记录，设置为create
            return {
              ...item,
              item_resource_action: 'create' as const,
            };
          } else {
            // 检查数据是否真正发生了变化（排除action字段本身）
            const { item_resource_action: oldAction, ...oldData } = existingItem;
            const { item_resource_action, ...newData } = item; // eslint-disable-line @typescript-eslint/no-unused-vars
            const hasChanged = JSON.stringify(oldData) !== JSON.stringify(newData);

            if (hasChanged && !oldAction) {
              // 数据发生变化且原来没有action标记，设置为update
              return {
                ...item,
                item_resource_action: 'update' as const,
              };
            } else {
              // 数据未变化或已有action标记，保持原有标记
              return {
                ...item,
                item_resource_action: oldAction,
              };
            }
          }
        });

        console.log('EditorTable - 处理后数据源:', processedDataSource);
        setDataSource(processedDataSource);
        // 通知父组件数据变化
        onDataChange?.(processedDataSource);
      }}
      editable={{
        type: 'multiple',
        editableKeys,
        onChange: setEditableRowKeys,
        onSave: async (rowKey, data) => {
          console.log('EditorTable - onSave触发:', { rowKey, data, currentDataSource: dataSource });

          // 编辑保存时，为现有数据设置item_resource_action字段
          if (!data.item_resource_action) {
            data.item_resource_action = 'update' as const;
          }

          // 更新本地数据源，确保数据不会丢失
          const updatedDataSource = dataSource.map((item) => {
            if (item.id === rowKey) {
              const updatedItem = { ...item, ...data };
              console.log('EditorTable - 更新项目:', { original: item, updated: updatedItem });
              return updatedItem;
            }
            return item;
          });

          console.log('EditorTable - 更新后数据源:', updatedDataSource);

          // 先更新数据源
          setDataSource(updatedDataSource);

          // 通知父组件数据变化
          onDataChange?.(updatedDataSource);

          // 移除编辑状态，确保行退出编辑模式
          setEditableRowKeys((prev) => prev.filter((key) => key !== rowKey));

          console.log('EditorTable - onSave完成，移除编辑状态:', rowKey);

          return data;
        },
        actionRender: (row, config, defaultDom) => {
          return [defaultDom.save, defaultDom.delete, defaultDom.cancel];
        },
      }}
    />
  );
};

export default EditableTable;
