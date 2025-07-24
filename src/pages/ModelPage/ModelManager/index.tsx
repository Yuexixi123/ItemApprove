import { useEffect, useRef, useState } from 'react';
import { Button, Flex, Space } from 'antd';
import { ActionType, PageContainer } from '@ant-design/pro-components';
import CreateModel from './components/CreateModel';
import CreateGroups from './components/CreateGroups';
import SearchInput from './components/SearchInput';
import RadioGroups from './components/RadioGroups';
import GroupList from './components/GroupList';
import { useModel } from '@umijs/max';

const ModelManager: React.FC = () => {
  //是否显示新建模型弹窗
  const [modelVisitor, setModelVisitor] = useState(false);

  //是否显示新建分组弹窗
  const [groupVisitor, setGroupVisitor] = useState(false);

  //是否显示编辑分组弹窗
  const [editGroupVisitor, setEditGroupVisitor] = useState(false);

  const { filteredData, loading, fetchModels } = useModel('modelPage', (model) => ({
    filteredData: model.filteredData,
    loading: model.loading,
    fetchModels: model.fetchModels,
  }));

  useEffect(() => {
    fetchModels();
  }, []);

  const safeModelList: any = Array.isArray(filteredData) ? filteredData : [];

  const [row, setRow] = useState<ModelManager.GroupItem | Record<string, never>>({});

  const actionRef = useRef<ActionType>();

  return (
    // 隐藏面包屑
    <PageContainer title={false}>
      <Flex justify="space-between" align="center">
        <Space size="small">
          <Button type="primary" onClick={() => setModelVisitor(true)}>
            新建模型
          </Button>
          <Button onClick={() => setGroupVisitor(true)}>新建分组</Button>
        </Space>
        <Space size="small">
          <SearchInput />
          <RadioGroups />
        </Space>
      </Flex>
      <GroupList
        setRow={setRow}
        safeModelList={safeModelList}
        loading={loading}
        setModelVisitor={setModelVisitor}
        setEditGroupVisitor={setEditGroupVisitor}
      />
      <CreateModel values={row} open={modelVisitor} onOpenChange={setModelVisitor} />
      <CreateGroups
        title="新建分组"
        open={groupVisitor}
        actionRef={actionRef}
        onOpenChange={setGroupVisitor}
      />
      <CreateGroups
        title="编辑分组"
        open={editGroupVisitor}
        actionRef={actionRef}
        onOpenChange={setEditGroupVisitor}
        values={row}
      />
    </PageContainer>
  );
};

export default ModelManager;
