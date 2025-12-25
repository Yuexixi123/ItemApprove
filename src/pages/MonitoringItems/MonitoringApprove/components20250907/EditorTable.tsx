import { EditableFormInstance, EditableProTable, ProColumns } from '@ant-design/pro-components';
// Force refresh cache
import { useRef, useState, useEffect, useCallback } from 'react';
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
  onChangeTracking?: (changes: { created: any[]; updated: any[]; deleted: any[] }) => void; // 变更追踪回调
}> = ({
  modelId = 1,
  resourceData = [],
  loading: externalLoading = false,
  selectedSysId,
  onSearch,
  onDataChange,
  cachedData = [],
  onChangeTracking,
}) => {
  const [editableKeys, setEditableRowKeys] = useState<React.Key[]>(() => []);
  const [selectedHostId, setSelectedHostId] = useState<number>(); // 新增主机搜索状态
  const editorFormRef = useRef<EditableFormInstance<DataSourceType>>();
  const [isInitialLoad, setIsInitialLoad] = useState(true); // 标记是否为初始加载

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

  // 深度比较两个对象是否相等（忽略特定字段）
  const deepEqual = (
    obj1: any,
    obj2: any,
    ignoreFields: string[] = ['item_resource_action', 'id'],
  ) => {
    if (obj1 === obj2) return true;
    if (!obj1 || !obj2) return false;
    if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

    const keys1 = Object.keys(obj1).filter((key) => !ignoreFields.includes(key));
    const keys2 = Object.keys(obj2).filter((key) => !ignoreFields.includes(key));

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (Array.isArray(obj1[key]) && Array.isArray(obj2[key])) {
        if (obj1[key].length !== obj2[key].length) return false;
        for (let i = 0; i < obj1[key].length; i++) {
          if (!deepEqual(obj1[key][i], obj2[key][i], ignoreFields)) return false;
        }
      } else if (!deepEqual(obj1[key], obj2[key], ignoreFields)) {
        return false;
      }
    }

    return true;
  };

  // 变更追踪工具函数
  const trackChanges = useCallback(
    (newData: DataSourceType[]) => {
      const created: DataSourceType[] = [];
      const updated: DataSourceType[] = [];
      const deleted: DataSourceType[] = [];

      console.log('=== trackChanges 调试 ===');
      console.log('newData:', newData);
      console.log('newData length:', newData?.length);
      console.log('cachedData:', cachedData);
      console.log('cachedData length:', cachedData?.length);
      console.log('onChangeTracking callback exists:', !!onChangeTracking);

      // 找出新增的项目（在newData中但不在cachedData中）
      newData.forEach((item) => {
        // 对于有真实id的数据（从后端获取），使用id匹配
        // 对于新增数据（随机生成的id），通过业务字段匹配
        let existsInCache;

        if (item.id && typeof item.id === 'number') {
          // 真实id，直接匹配
          existsInCache = cachedData.find((cached) => cached.id === item.id);
        } else {
          // 随机生成的id，通过业务字段匹配（如host_resource_id + instance_name）
          existsInCache = cachedData.find(
            (cached) =>
              cached.host_resource_id === item.host_resource_id &&
              cached.instance_name === item.instance_name,
          );
        }

        if (!existsInCache) {
          console.log('检测到新增数据:', item);
          created.push({ ...item, item_resource_action: 'create' });
        } else {
          // 使用深度比较检查是否有更新
          if (!deepEqual(item, existsInCache)) {
            console.log('检测到更新数据:', { item, existsInCache });
            updated.push({ ...item, item_resource_action: 'update' });
          } else {
            console.log('数据无变化，跳过:', item);
          }
        }
      });

      // 找出删除的项目（在cachedData中但不在newData中）
      cachedData.forEach((cached) => {
        const existsInNew = newData.find((item) => {
          if (cached.id && typeof cached.id === 'number') {
            return item.id === cached.id;
          } else {
            return (
              item.host_resource_id === cached.host_resource_id &&
              item.instance_name === cached.instance_name
            );
          }
        });
        if (!existsInNew) {
          console.log('检测到删除数据:', cached);
          deleted.push({ ...cached, item_resource_action: 'delete' });
        }
      });

      // 只有当有实际变更时才通知父组件
      if (created.length > 0 || updated.length > 0 || deleted.length > 0) {
        console.log('检测到数据变更:', { created, updated, deleted });
        onChangeTracking?.({ created, updated, deleted });
      } else {
        console.log('未检测到数据变更，不触发回调');
        // 如果没有变更，不调用回调，避免触发不必要的状态更新
      }
    },
    [cachedData, onChangeTracking],
  );

  // 当resourceData或cachedData变化时更新dataSource
  // 在 useEffect 中添加调试
  useEffect(() => {
    console.log('=== EditorTable 数据调试 ===');
    console.log('modelId:', modelId);
    console.log('接收到的 resourceData:', resourceData);
    console.log('resourceData 类型:', typeof resourceData);
    console.log('resourceData 是否为数组:', Array.isArray(resourceData));
    console.log('resourceData 长度:', resourceData?.length);
    console.log('接收到的 cachedData:', cachedData);
    console.log('cachedData 长度:', cachedData?.length);
    console.log('externalLoading:', externalLoading);
    console.log('selectedSysId:', selectedSysId);
    console.log('================================');

    // 优先使用resourceData，如果没有则使用cachedData
    const dataToUse = resourceData && resourceData.length > 0 ? resourceData : cachedData;

    if (dataToUse && dataToUse.length > 0) {
      const formattedData = dataToUse.map((item) => ({
        ...item,
        id: item.id || (Math.random() * 1000000).toFixed(0),
      }));
      console.log('格式化后的数据:', formattedData);
      // 先设置初始加载标记，再更新数据源
      setIsInitialLoad(true);
      setDataSource(formattedData);
      // 直接通知父组件数据变化，避免触发onChange
      onDataChange?.(formattedData);
      // 注意：这里不调用trackChanges，因为这是初始数据加载，不是用户编辑操作
      // 使用setTimeout确保在下一个事件循环中将isInitialLoad设置为false
      setTimeout(() => {
        console.log('数据初始化完成，设置isInitialLoad为false');
        setIsInitialLoad(false);
      }, 0);
    } else {
      console.log('resourceData 和 cachedData 都为空，清空 dataSource');
      // 先设置初始加载标记，再清空数据源
      setIsInitialLoad(true);
      setDataSource([]);
      // 直接通知父组件数据变化，避免触发onChange
      onDataChange?.([]);
      // 使用setTimeout确保在下一个事件循环中将isInitialLoad设置为false
      setTimeout(() => {
        console.log('数据清空完成，设置isInitialLoad为false');
        setIsInitialLoad(false);
      }, 0);
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
    // 从缓存数据中找到对应记录的触发器数据
    const cachedRecord = cachedData.find((cached) => cached.id === record.id);
    const cachedTriggerData = cachedRecord?.trigger_resource_datas || [];

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
          cachedData={cachedTriggerData}
          onChangeTracking={(changes) => {
            // 触发器变更追踪回调
            if (onChangeTracking) {
              // 当触发器数据发生变更时，需要将父记录也标记为修改
              const hasChanges =
                changes.created.length > 0 ||
                changes.updated.length > 0 ||
                changes.deleted.length > 0;
              if (hasChanges) {
                // 从当前dataSource中找到最新的记录数据，确保包含所有字段
                const currentRecord = dataSource.find((item) => item.id === record.id) || record;

                // 更新父记录的trigger_resource_datas，保持完整的资源数据
                const updatedRecord = {
                  ...currentRecord, // 使用完整的当前记录数据
                  trigger_resource_datas: currentRecord.trigger_resource_datas || [],
                  item_resource_action: 'update' as const,
                };

                console.log('触发器变更，标记父记录为更新:', updatedRecord);

                // 通知父组件，将包含触发器变更的记录标记为更新
                onChangeTracking({
                  created: [],
                  updated: [updatedRecord],
                  deleted: [],
                });
              }
            }
          }}
          onDataChange={(data) => {
            // 更新父记录中的触发器数据，保留原始的trigger_resource_action字段
            const updatedDataSource = dataSource.map((item) =>
              item.id === record.id ? { ...item, trigger_resource_datas: data } : item,
            );
            setDataSource(updatedDataSource);
            onDataChange?.(updatedDataSource);

            // 当触发器数据变化时，也需要追踪父记录的变更
            // 这确保了触发器数据的变化能够被正确追踪和传递
            trackChanges(updatedDataSource);
          }}
        />
      </div>
    );
  };

  // 在组件层面添加操作列
  const getTableColumns = (): ProColumns<DataSourceType>[] => {
    console.log('getTableColumns - columns:', columns);
    console.log('getTableColumns - columns.length:', columns?.length);

    // 如果columns为空或未定义，返回基础列结构
    if (!columns || columns.length === 0) {
      console.log('columns为空或未定义，返回基础列结构');
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
                // 只有在非初始加载时才追踪变更
                if (!isInitialLoad) {
                  console.log('用户删除操作，追踪变更');
                  trackChanges(newDataSource);
                } else {
                  console.log('初始加载期间的删除操作，跳过变更追踪');
                }
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
        <a
          key="delete"
          onClick={() => {
            const newDataSource = dataSource.filter((item) => item.id !== record.id);
            setDataSource(newDataSource);
            // 通知父组件数据变化
            onDataChange?.(newDataSource);
            // 追踪变更
            trackChanges(newDataSource);
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

  console.log('dataSource', dataSource);

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
        record: () => ({ id: (Math.random() * 1000000).toFixed(0) }),
        creatorButtonText: '添加监控项',
      }}
      loading={modelLoading || externalLoading}
      columns={getTableColumns()}
      value={dataSource}
      onChange={(value) => {
        const newDataSource = [...value];
        console.log('=== EditableProTable onChange 触发 ===');
        console.log('isInitialLoad:', isInitialLoad);
        console.log('新数据源长度:', newDataSource.length);
        console.log('当前数据源长度:', dataSource.length);
        console.log('新数据源:', newDataSource);

        setDataSource(newDataSource);
        // 通知父组件数据变化
        onDataChange?.(newDataSource);
        // 只有在非初始加载时才追踪变更
        if (!isInitialLoad) {
          console.log('用户编辑操作，追踪变更');
          trackChanges(newDataSource);
        } else {
          console.log('初始加载，跳过变更追踪');
        }
      }}
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
