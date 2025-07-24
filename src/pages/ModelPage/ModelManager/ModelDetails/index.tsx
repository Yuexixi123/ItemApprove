import { PageContainer } from '@ant-design/pro-components';
import HeaderTitle from './components/HeaderTitle';
import DetailsTab from './components/DetailsTab';
import { useState } from 'react';
import ImportFieldDrawer from './components/ImportFieldDrawer';
import { Spin } from 'antd';
import { useModel } from '@umijs/max';
const ModelDetails = () => {
  const [isShowImportField, setIsShowImportField] = useState(false);

  const { loading } = useModel('modelDetails', (modelDetails) => {
    return {
      loading: modelDetails.loading,
    };
  });

  return (
    <PageContainer title={false}>
      <Spin spinning={loading}>
        <HeaderTitle setIsShowImportField={setIsShowImportField} />
        <DetailsTab />
        <ImportFieldDrawer open={isShowImportField} setOpen={setIsShowImportField} />
      </Spin>
    </PageContainer>
  );
};

export default ModelDetails;
