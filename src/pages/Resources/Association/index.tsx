import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { Button, Radio, Flex, Collapse, RadioChangeEvent, Checkbox, Empty, Spin } from 'antd';
import { useModel, useParams } from '@umijs/max';
import DrawerTable from './components/DrawerTable';
import CollapseTable from './components/CollapseTable';
import './index.less';

import TopologyGraph, { TopologyNode } from './components/TopologyGraph';

const data: TopologyNode = {
  id: 'root',
  name: '业务',
  type: 'business',
  level: 0,
  children: [
    {
      id: 'cluster-1',
      name: '集群',
      type: 'cluster',
      level: 1,
      children: [
        {
          id: 'host-1',
          name: '主机',
          type: 'host',
          level: 2,
        },
      ],
    },
    {
      id: 'cluster-2',
      name: '集群',
      type: 'cluster',
      level: 1,
      children: [
        {
          id: 'host-2',
          name: '主机',
          type: 'host',
          level: 2,
        },
      ],
    },
  ],
};

interface AssociationProps {
  resourceId?: number;
}

const Association = forwardRef<any, AssociationProps>((props, ref) => {
  const { resourceId } = props;
  const [open, setOpen] = useState(false);
  const [radioValue, setRadioValue] = useState<'a' | 'b'>('a');
  const [expandAll, setExpandAll] = useState(false);
  const [activeKeys, setActiveKeys] = useState<string[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [defaultModelId, setDefaultModelId] = useState<number>();
  const [collapseRefreshTrigger, setCollapseRefreshTrigger] = useState<number>(0); // 新增：CollapseTable刷新触发器

  // 使用资源关联model
  const {
    modelRelationships,
    modelRelationshipsLoading,
    fetchModelRelationships,
    allModelRelationships,
    allModelRelationshipsLoading,
    fetchAllModelRelationships,
  } = useModel('resourceAssociation');

  const params = useParams<{ id: string }>(); // 从URL路径获取modelId
  const modelId = Number(params.id);

  // 暴露刷新数据的方法给父组件
  useImperativeHandle(ref, () => ({
    refreshData: () => {
      if (modelId) {
        fetchModelRelationships(modelId);
        fetchAllModelRelationships(modelId); // 同时刷新关联列表数据
      }
    },
  }));

  useEffect(() => {
    // 组件挂载时获取模型关联关系数据和关联列表数据
    if (modelId) {
      fetchModelRelationships(modelId);
      fetchAllModelRelationships(modelId); // 新增：获取关联列表数据
    }
  }, [modelId, fetchModelRelationships, fetchAllModelRelationships]);

  // 新增：当获取到关联列表数据后，设置默认的模型ID
  useEffect(() => {
    if (allModelRelationships && allModelRelationships.length > 0) {
      const firstRelationship = allModelRelationships[0];
      setDefaultModelId(firstRelationship.model_id);
    }
  }, [allModelRelationships]);

  useEffect(() => {
    // 当获取到关联关系数据后，更新items
    if (modelRelationships && modelRelationships.length > 0) {
      const newItems = modelRelationships.map(
        (relationship: API.ModelRelationshipJoinNameItem) => ({
          key: relationship.value.toString(),
          label: `${relationship.label}`,
          children: (
            <CollapseTable
              relationshipId={relationship.value}
              modelId={relationship.model_id}
              resourceId={resourceId}
              isExpanded={activeKeys.includes(relationship.value.toString())}
              refreshTrigger={collapseRefreshTrigger} // 新增：传递刷新触发器
            />
          ),
        }),
      );
      setItems(newItems);
    } else {
      // 如果没有数据，清空items
      setItems([]);
      setExpandAll(false);
    }
  }, [modelRelationships, resourceId, collapseRefreshTrigger, activeKeys]); // 重新添加activeKeys依赖

  // 新增：单独的useEffect来检查展开状态，避免循环依赖
  useEffect(() => {
    if (items && items.length > 0) {
      const allKeys = items.map((item) => item.key);
      const isAllExpanded =
        allKeys.length > 0 &&
        allKeys.length === activeKeys.length &&
        allKeys.every((itemKey) => activeKeys.includes(itemKey));
      setExpandAll(isAllExpanded);
    }
  }, [items, activeKeys]);

  // 修改：处理抽屉关闭后的刷新
  const handleDrawerClose = () => {
    setOpen(false);
    // 触发CollapseTable刷新
    setCollapseRefreshTrigger((prev) => prev + 1);
  };

  const handleAddAssociation = () => {
    setOpen(true);
  };

  const onChange = (key: string | string[]) => {
    console.log(key);
    const newActiveKeys = Array.isArray(key) ? key : [key];
    setActiveKeys(newActiveKeys);

    // 检查是否所有面板都已展开，如果是则自动勾选"全部展开"
    if (items && items.length > 0) {
      const allKeys = items.map((item) => item.key);
      const isAllExpanded =
        allKeys.length === newActiveKeys.length &&
        allKeys.every((itemKey) => newActiveKeys.includes(itemKey));
      setExpandAll(isAllExpanded);
    }
  };

  const handleRadio = (e: RadioChangeEvent) => {
    setRadioValue(e.target.value);
  };

  const handleExpandAllChange = (e: any) => {
    const checked = e.target.checked;
    setExpandAll(checked);
    if (checked) {
      // 展开所有面板
      const allKeys = items.map((item) => item.key);
      setActiveKeys(allKeys);
    } else {
      // 收起所有面板
      setActiveKeys([]);
    }
  };

  // 新增：处理关联操作成功后的刷新
  const handleAssociationSuccess = () => {
    // 刷新模型关联关系数据，这会触发CollapseTable的重新渲染
    if (modelId) {
      fetchModelRelationships(modelId);
    }
  };

  return (
    <React.Fragment>
      <Flex justify={radioValue === 'a' ? 'space-between' : 'flex-end'} align="center">
        {radioValue === 'a' && (
          <div>
            <Button type="primary" onClick={handleAddAssociation}>
              新增关联
            </Button>
          </div>
        )}
        <Flex align="center" gap={16}>
          {radioValue === 'a' && (
            <Checkbox checked={expandAll} onChange={handleExpandAllChange}>
              全部展开
            </Checkbox>
          )}
          <Radio.Group defaultValue="a" buttonStyle="solid" onChange={handleRadio}>
            <Radio.Button value="a">列表</Radio.Button>
            <Radio.Button value="b">拓扑</Radio.Button>
          </Radio.Group>
        </Flex>
      </Flex>
      <div className="relation-view">
        <Spin spinning={modelRelationshipsLoading || allModelRelationshipsLoading}>
          {radioValue === 'a' &&
            (items.length > 0 ? (
              <Collapse activeKey={activeKeys} items={items} onChange={onChange} />
            ) : (
              <Empty description="暂无关联数据" style={{ padding: '40px 0' }} />
            ))}
          {radioValue === 'b' && <TopologyGraph data={data} />}
        </Spin>
      </div>
      <DrawerTable
        open={open}
        onClose={handleDrawerClose}
        resourceId={resourceId}
        defaultModelId={defaultModelId}
        onSuccess={handleAssociationSuccess} // 新增：传入成功回调
      />
    </React.Fragment>
  );
});

export default Association;
