import { Tabs } from 'antd';
import type { TabsProps } from 'antd';
import { useState } from 'react';
import ModelField from '@/pages/ModelPage/ModelManager/ModelDetails/ModelField';
import ModelAssociation from '@/pages/ModelPage/ModelManager/ModelDetails/ModelAssociation';
import UniqueVerification from '@/pages/ModelPage/ModelManager/ModelDetails/UniqueVerification';

const DetailsTab = () => {
  // 添加激活的Tab状态
  const [activeKey, setActiveKey] = useState<string>('modelField');

  // Tab切换处理函数
  const onChange = (key: string) => {
    setActiveKey(key);
  };

  const items: TabsProps['items'] = [
    {
      key: 'modelField',
      label: '模型字段',
      children: <ModelField active={activeKey === 'modelField'} />,
    },
    {
      key: 'modelAssociation',
      label: '模型关联',
      children: <ModelAssociation active={activeKey === 'modelAssociation'} />,
    },
    {
      key: 'unique',
      label: '唯一校验',
      children: <UniqueVerification active={activeKey === 'unique'} />,
    },
  ];

  return <Tabs activeKey={activeKey} items={items} onChange={onChange} />;
};

export default DetailsTab;
