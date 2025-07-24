import React from 'react';
import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import ResourceTable from '../../ResourceTable';
import ModelTable from '../../ModelTable';

const items: TabsProps['items'] = [
  {
    key: 'resource',
    label: '资源',
    children: <ResourceTable />,
  },
  {
    key: 'model',
    label: '模型',
    children: <ModelTable />,
  },
];

const TableTabs: React.FC = () => {
  return <Tabs defaultActiveKey="resource" items={items} />;
};

export default TableTabs;
