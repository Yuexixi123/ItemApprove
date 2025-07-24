import { PageContainer } from '@ant-design/pro-components';
import SearchInput from './components/SearchInput';
import CardContainer from './components/CardContainer';
import React, { useEffect } from 'react';
import { useModel } from '@umijs/max';
const ResourcesDirectory = () => {
  const { refreshData } = useModel('modelPage', (model) => ({
    refreshData: model.refreshData,
  }));

  useEffect(() => {
    refreshData();
  }, []);

  return (
    <PageContainer title={false}>
      <SearchInput />
      <CardContainer />
    </PageContainer>
  );
};

export default ResourcesDirectory;
