import { PageContainer } from '@ant-design/pro-components';
import React, { useRef } from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { useSearchParams } from '@umijs/max';
import AttrDescriptions from '../AttrDescriptions';
// import ChangeRecord from '../ChangeRecord';
import Association from '../Association';

const ResourcesDirectory = () => {
  const [searchParams] = useSearchParams();
  const instanceName = searchParams.get('instance_name');
  const resourceId = searchParams.get('name');

  // 创建子组件的ref，用于调用子组件的刷新方法
  const attrDescriptionsRef = useRef<{ refreshData?: () => void }>();
  const associationRef = useRef<{ refreshData?: () => void }>();

  // Tabs切换事件处理
  const onChange = (key: string) => {
    switch (key) {
      case '1':
        // 切换到属性页签，刷新属性数据
        if (attrDescriptionsRef.current?.refreshData) {
          attrDescriptionsRef.current.refreshData();
        }
        break;
      case '2':
        // 切换到关联页签，刷新关联数据
        if (associationRef.current?.refreshData) {
          associationRef.current.refreshData();
        }
        break;
      default:
        break;
    }
  };

  const items: TabsProps['items'] = [
    {
      key: '1',
      label: '属性',
      children: <AttrDescriptions ref={attrDescriptionsRef} resourceId={Number(resourceId)} />,
    },
    {
      key: '2',
      label: '关联',
      children: <Association ref={associationRef} resourceId={Number(resourceId)} />,
    },
    // {
    //   key: '3',
    //   label: '变更记录',
    //   children: <ChangeRecord />,
    // },
  ];

  return (
    <PageContainer title={instanceName}>
      <Tabs defaultActiveKey="1" items={items} onChange={onChange} />
    </PageContainer>
  );
};

export default ResourcesDirectory;
