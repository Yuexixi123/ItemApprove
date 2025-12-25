import { EditableFormInstance, EditableProTable, ProColumns } from '@ant-design/pro-components';
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

// 编辑模式专用的可编辑表格组件
const EditModeTable: React.FC<{
  modelId?: number;
  initialData?: any[]; // 初始数据（从后端获取的审批详情数据）
  selectedSysId?: number;
  onDataChange?: (data: DataSourceType[]) => void; // 数据变化回调
}> = ({ modelId = 1, initialData = [], selectedSysId, onDataChange }) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
  const [selectedHostId, setSelectedHostId] = useState<number>(); // 主机搜索状态
  const [dataSource, setDataSource] = useState<DataSourceType[]>([]);
  const [hasSearched, setHasSearched] = useState<boolean>(false); // 是否已执行搜索
  const editorFormRef = useRef<EditableFormInstance<DataSourceType>>();

  // 使用监控审批模型获取列配置
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

  // 生成唯一ID的函数
  const generateUniqueId = () => {
    return `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  };

  // 初始化数据源
  useEffect(() => {
    if (initialData && initialData.length > 0) {
      const formattedData = initialData.map((item) => ({
        ...item,
        id: item.id || generateUniqueId(),
        // 编辑模式下，原始数据不设置action标记
      }));

      console.log('EditModeTable - 初始化数据源:', formattedData);
      setDataSource(formattedData);
    } else {
      setDataSource([]);
    }
  }, [initialData]);

  // 过滤数据源（根据主机搜索）
  const filteredDataSource = (() => {
    if (!hasSearched) {
      // 未执行搜索时，显示所有数据
      console.log('EditModeTable - 过滤数据源: 未执行搜索，显示所有数据', {
        count: dataSource.length,
      });
      return dataSource;
    }

    if (!selectedHostId) {
      // 执行了搜索但未选择主机，显示空列表（因为用户明确执行了搜索操作）
      console.log('EditModeTable - 过滤数据源: 已搜索但未选择主机，显示空列表');
      return [];
    }

    // 执行了搜索且选择了主机，进行过滤
    const filtered = dataSource.filter((item) => item.host_resource_id === selectedHostId);
    console.log('EditModeTable - 过滤数据源: 按主机过滤', {
      selectedHostId,
      originalCount: dataSource.length,
      filteredCount: filtered.length,
    });
    return filtered;
  })();

  // 处理主机搜索
  const handleHostSearch = () => {
    // 标记已执行搜索
    setHasSearched(true);
    console.log('EditModeTable - 主机搜索:', {
      selectedHostId,
      dataSourceLength: dataSource.length,
      hasSearched: true,
    });
  };

  // 清空搜索
  const handleClearSearch = () => {
    setSelectedHostId(undefined);
    setHasSearched(false);
    console.log('EditModeTable - 清空搜索:', {
      dataSourceLength: dataSource.length,
      hasSearched: false,
    });
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
          showDeleteButton={true}
          onDataChange={(triggerData) => {
            console.log('EditModeTable - 触发器数据变化:', { recordId: record.id, triggerData });

            // 更新对应监控项的trigger_resource_datas字段
            const updatedDataSource = dataSource.map((item) => {
              if (item.id === record.id) {
                const updatedItem = {
                  ...item,
                  trigger_resource_datas: triggerData,
                  // 如果原来没有action标记，设置为update
                  item_resource_action: item.item_resource_action || 'update',
                };
                console.log('EditModeTable - 更新监控项触发器数据:', {
                  original: item,
                  updated: updatedItem,
                });
                return updatedItem;
              }
              return item;
            });

            console.log('EditModeTable - 触发器变化后数据源:', updatedDataSource);

            // 更新本地数据源
            setDataSource(updatedDataSource);

            // 通知父组件数据变化
            onDataChange?.(updatedDataSource);
          }}
        />
      </div>
    );
  };

  // 获取表格列配置
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

    // 处理从ColumnGenerator生成的columns
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
      width: 150,
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
      }}
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
      loading={modelLoading}
      columns={getTableColumns()}
      value={filteredDataSource}
      onChange={(value) => {
        const newDataSource = [...value];
        console.log('EditModeTable - onChange触发:', newDataSource);

        // 处理数据action标记
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

        // 更新完整的数据源（包括被过滤的数据）
        const updatedFullDataSource = dataSource.map((item) => {
          const updatedItem = processedDataSource.find((newItem) => newItem.id === item.id);
          return updatedItem || item;
        });

        // 添加新增的数据
        processedDataSource.forEach((item) => {
          if (!dataSource.find((existingItem) => existingItem.id === item.id)) {
            updatedFullDataSource.push(item);
          }
        });

        setDataSource(updatedFullDataSource);
        // 通知父组件数据变化
        onDataChange?.(updatedFullDataSource);
      }}
      editable={{
        type: 'multiple',
        editableKeys,
        onChange: setEditableRowKeys,
        onSave: async (rowKey, data) => {
          console.log('EditModeTable - onSave触发:', {
            rowKey,
            data,
            currentDataSource: dataSource,
          });

          // 编辑保存时，为现有数据设置item_resource_action字段
          if (!data.item_resource_action) {
            data.item_resource_action = 'update' as const;
          }

          // 更新本地数据源
          const updatedDataSource = dataSource.map((item) => {
            if (item.id === rowKey) {
              const updatedItem = { ...item, ...data };
              console.log('EditModeTable - 更新项目:', { original: item, updated: updatedItem });
              return updatedItem;
            }
            return item;
          });

          // 先更新数据源
          setDataSource(updatedDataSource);

          // 通知父组件数据变化
          onDataChange?.(updatedDataSource);

          // 移除编辑状态
          setEditableRowKeys((prev) => prev.filter((key) => key !== rowKey));

          return data;
        },
        actionRender: (row, config, defaultDom) => {
          return [defaultDom.save, defaultDom.delete, defaultDom.cancel];
        },
      }}
    />
  );
};

export default EditModeTable;
