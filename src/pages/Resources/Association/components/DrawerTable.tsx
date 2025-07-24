import React, { useState, useEffect, useMemo } from 'react';
import { Drawer, Select, Flex, Space, Button, Input, App, Popconfirm } from 'antd';
import { useModel, useParams } from '@umijs/max';
import CustomProTable from '@/components/MyProTable/CustomProTable';
import {
  getModelResourcesWithRelStatus,
  createResourceRelationship,
  deleteResourceRelationship,
} from '@/services/resources/association/api';
import type { ProColumns } from '@ant-design/pro-components';

interface DrawerTableProps {
  open: boolean;
  onClose: () => void;
  resourceId?: number;
  defaultModelId?: number;
  onSuccess?: () => void; // 新增：成功操作后的回调
}

// 扩展类型定义，添加关联关系相关字段
type ResourceWithRelStatus = API.ModelResourceWithRelStatus & {
  is_relationship?: boolean;
  rel_id?: number;
};

const DrawerTable: React.FC<DrawerTableProps> = (props) => {
  const { message } = App.useApp();
  const { open, onClose, resourceId, defaultModelId, onSuccess } = props;

  // 获取当前模型ID
  const params = useParams<{ id: string }>();
  const currentModelId = Number(params.id);

  // 状态管理
  const [selectedRelationship, setSelectedRelationship] = useState<number>();
  const [selectedRelationshipModelId, setSelectedRelationshipModelId] = useState<number>();
  const [selectedField, setSelectedField] = useState<string>('create_name');
  const [keyword, setKeyword] = useState<string>('');
  const [searchParams, setSearchParams] = useState<any>();
  const [refreshKey, setRefreshKey] = useState<number>(0); // 新增：用于刷新表格的key

  // 使用资源关联model
  const {
    allModelRelationships,
    fetchAllModelRelationships,
    refreshRelatedResources, // 新增：获取刷新方法
  } = useModel('resourceAssociation');

  // 当模型ID改变时，重置相关状态
  useEffect(() => {
    if (open && currentModelId) {
      setSelectedRelationship(undefined);
      setSelectedRelationshipModelId(defaultModelId);
      setSearchParams(undefined);
      setKeyword('');
      fetchAllModelRelationships(currentModelId);
      // 新增：每次打开抽屉时刷新表格
      setRefreshKey((prev) => prev + 1);
    }
  }, [open, currentModelId, defaultModelId, fetchAllModelRelationships]);

  // 将模型关联关系数据转换为下拉框选项格式
  const relationshipOptions = allModelRelationships.map(
    (item: API.ModelRelationshipJoinNameItem) => ({
      value: item.value,
      label: item.label,
      modelId: item.model_id,
    }),
  );

  // 当关联关系列表加载完成时，默认选中第一个选项
  useEffect(() => {
    if (relationshipOptions.length > 0 && !selectedRelationship) {
      const firstOption = relationshipOptions[0];
      setSelectedRelationship(firstOption.value);
      setSelectedRelationshipModelId(firstOption.modelId);
    }
  }, [relationshipOptions]);

  // 条件筛选字段选项
  const conditionFieldOptions = [
    {
      value: 'instance_name',
      label: '实例名',
      key: 'instance_name',
    },
    {
      value: 'create_name',
      label: '创建人',
      key: 'create_name',
    },
    {
      value: 'create_time',
      label: '创建时间',
      key: 'create_time',
    },
    {
      value: 'update_user',
      label: '更新人',
      key: 'update_user',
    },
    {
      value: 'update_time',
      label: '更新时间',
      key: 'update_time',
    },
  ];

  // 根据选择的字段获取对应的列标题
  const getColumnTitle = (fieldValue: string) => {
    const option = conditionFieldOptions.find((opt) => opt.value === fieldValue);
    return option ? option.label : fieldValue;
  };

  // 根据选择的字段获取对应的列类型
  const getColumnValueType = (fieldValue: string) => {
    if (fieldValue === 'create_time' || fieldValue === 'update_time') {
      return 'dateTime';
    }
    return 'text';
  };

  // 处理关联操作
  const handleAssociation = async (record: ResourceWithRelStatus) => {
    console.log('handleAssociation', record);

    if (!selectedRelationship) {
      message.error('请先选择关联关系');
      return;
    }

    const targetResourceId = record.id;

    const resourceRelId = record.resource_rel_id;

    const loadingMessage = message.loading(
      record?.is_relationship ? '正在取消关联' : '正在关联',
      0,
    );

    try {
      if (record?.is_relationship) {
        if (!resourceRelId) {
          loadingMessage();
          message.error('无法找到关联关系ID');
          return;
        }
        const result = await deleteResourceRelationship(resourceRelId.toString());
        loadingMessage();
        if (result.inside_code === 0) {
          message.success('取消关联成功');
          // 刷新表格数据
          setRefreshKey((prev) => prev + 1);
          // 刷新CollapseTable的数据
          refreshRelatedResources();
          onSuccess?.(); // 调用成功回调
        } else {
          message.error('取消关联失败');
        }
      } else {
        // 检查 resourceId 是否存在
        if (!resourceId || !targetResourceId) {
          loadingMessage();
          message.error('资源ID不能为空');
          return;
        }

        const params: API.CreateResourceRelationshipParams = {
          src_resource_id: resourceId,
          dest_resource_id: targetResourceId,
        };
        const result = await createResourceRelationship(selectedRelationship, params);
        loadingMessage();
        if (result.inside_code === 0) {
          message.success(result.msg);
          // 刷新表格数据
          setRefreshKey((prev) => prev + 1);
          // 刷新CollapseTable的数据
          refreshRelatedResources();
          onSuccess?.(); // 调用成功回调
        } else {
          message.error(result.msg);
        }
      }
    } catch (error) {
      loadingMessage();
      console.error('关联操作失败:', error);
      message.error(record?.is_relationship ? '取消关联失败' : '关联失败');
    }
  };

  // 动态生成表格列
  const columns: ProColumns<ResourceWithRelStatus>[] = useMemo(() => {
    const baseColumns: ProColumns<ResourceWithRelStatus>[] = [
      {
        title: 'ID',
        dataIndex: 'id',
        valueType: 'digit',
        width: '20%',
      },
      {
        title: '实例名',
        dataIndex: 'instance_name',
        key: 'instance_name',
        ellipsis: true,
        width: '40%',
      },
    ];

    // 添加动态第三列（根据选择的字段）
    if (selectedField && selectedField !== 'instance_name') {
      baseColumns.push({
        title: getColumnTitle(selectedField),
        dataIndex: selectedField,
        key: selectedField,
        width: selectedField.includes('time') ? 180 : 120,
        valueType: getColumnValueType(selectedField),
        ellipsis: true,
      });
    }

    // 添加操作列
    baseColumns.push({
      title: '操作',
      valueType: 'option',
      fixed: 'right',
      width: 150,
      render: (_, record) => {
        if (record?.is_relationship) {
          // 如果是已关联的资源，显示取消关联按钮（带确认框）
          return [
            <Popconfirm
              key="cancel-association"
              title="确认取消关联"
              description="确定要取消此关联关系吗？"
              onConfirm={() => handleAssociation(record)}
              okText="确定"
              cancelText="取消"
            >
              <Button type="link" size="small">
                取消关联
              </Button>
            </Popconfirm>,
          ];
        } else {
          // 如果是未关联的资源，显示关联按钮（无需确认框）
          return [
            <Button
              key="association"
              type="link"
              size="small"
              onClick={() => handleAssociation(record)}
            >
              关联
            </Button>,
          ];
        }
      },
    });

    return baseColumns;
  }, [selectedField, selectedRelationship, handleAssociation]);

  // 处理关联关系下拉框变化
  const handleRelationshipChange = (value: number) => {
    setSelectedRelationship(value);
    const selectedOption = relationshipOptions.find((option) => option.value === value);
    if (selectedOption) {
      setSelectedRelationshipModelId(selectedOption.modelId);
      setSearchParams(undefined);
    }
  };

  // 处理搜索
  const handleSearch = () => {
    const params: any = {
      current: 1,
      page_size: 10,
    };

    if (keyword && selectedField) {
      params[selectedField] = keyword;
    }

    if (selectedRelationship) {
      params.rel_id = selectedRelationship;
    }

    if (resourceId) {
      params.resource_id = resourceId;
    }

    setSearchParams(params);
  };

  return (
    <Drawer open={open} onClose={onClose} width={800} title="新增关联">
      <Flex align="center" className="drawerSearchBox">
        <Space>
          <span>关联列表</span>
          <Select
            showSearch
            style={{ width: 310 }}
            optionFilterProp="label"
            placeholder="请选择关联关系"
            value={selectedRelationship}
            onChange={handleRelationshipChange}
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? '')
                .toLowerCase()
                .localeCompare((optionB?.label ?? '').toLowerCase())
            }
            options={relationshipOptions}
          />
        </Space>
      </Flex>
      <Flex align="center" className="drawerSearchBox">
        <Space>
          <span>条件筛选</span>
          <Select
            showSearch
            style={{ width: 200 }}
            optionFilterProp="label"
            placeholder="请选择字段"
            value={selectedField}
            onChange={setSelectedField}
            filterSort={(optionA, optionB) =>
              (optionA?.label ?? '')
                .toLowerCase()
                .localeCompare((optionB?.label ?? '').toLowerCase())
            }
            options={conditionFieldOptions}
          />
          <Input
            style={{ width: 400 }}
            placeholder="请输入关键字"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          <Button type="primary" onClick={handleSearch}>
            搜索
          </Button>
        </Space>
      </Flex>
      {selectedRelationshipModelId && (
        <CustomProTable<ResourceWithRelStatus>
          key={`${selectedRelationshipModelId}-${JSON.stringify(searchParams)}-${refreshKey}`} // 修改：添加refreshKey
          api={getModelResourcesWithRelStatus}
          apiParams={[
            selectedRelationshipModelId,
            searchParams || {
              current: 1,
              page_size: 10,
              rel_id: selectedRelationship,
              resource_id: resourceId,
            },
          ]}
          pageName="drawer-resource-list"
          columns={columns}
          createFormRender={false}
          saveColumns={false}
          rowKey="id"
          search={false}
          options={false}
          size="small"
        />
      )}
    </Drawer>
  );
};

export default DrawerTable;
