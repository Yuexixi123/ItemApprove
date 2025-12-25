import type { ActionType, ProColumns } from '@ant-design/pro-components';
import { Space, App } from 'antd';
import { useRef, useState, useEffect } from 'react';
import UpdateForm from './components/UpdateForm';
import CreateForm from './components/UpdateForm';
import LookForm from '@/components/LookForm';
import { useParams } from '@umijs/max';
import {
  getModelRelationships,
  deleteModelRelationship,
} from '@/services/model-api/model-manage/model-relationship';
import CustomProTable from '@/components/MyProTable/CustomProTable';
import { useTableDelete } from '@/hooks/useTableDelete';

// columnsRender 函数保持不变
const columnsRender = (
  setRow: (record: API.RelationshipItem) => void = () => {},
  setLookOpen: (open: boolean) => void = () => {},
  handleDelete: (record: API.RelationshipItem) => void = () => {},
  setUpdateOpen: (open: boolean) => void = () => {},
): ProColumns<API.RelationshipItem>[] => [
  // 列定义保持不变
  {
    title: '唯一标识',
    dataIndex: 'rel_key',
    hideInDescriptions: true,
    key: 'rel_key',
    render: (text, record) => (
      <a
        onClick={() => {
          setRow(record);
          setLookOpen(true);
        }}
      >
        {text}
      </a>
    ),
  },
  {
    title: '唯一标识',
    dataIndex: 'rel_key',
    hideInForm: true,
    hideInSearch: true,
    hideInTable: true,
    key: 'rel_key',
  },
  {
    title: '关联类型',
    dataIndex: 'asst_type',
    key: 'asst_type',
  },
  {
    title: '源-目标约束',
    dataIndex: 'constraint',
    key: 'constraint',
  },
  {
    title: '源模型',
    dataIndex: 'src_model_name',
    key: 'src_model_name',
  },
  {
    title: '目标模型',
    dataIndex: 'dest_model_name',
    key: 'dest_model_name',
  },
  {
    title: '关联描述',
    dataIndex: 'rel_desc',
    key: 'rel_desc',
    hideInTable: true,
  },
  {
    title: '操作',
    dataIndex: 'action',
    hideInDescriptions: true,
    key: 'action',
    width: '20%',
    render: (text, record) => (
      <Space>
        <a
          onClick={() => {
            setRow(record);
            setUpdateOpen(true);
          }}
        >
          编辑
        </a>
        <a
          style={{
            color: 'red',
          }}
          onClick={() => {
            setRow(record);
            handleDelete(record);
          }}
        >
          删除
        </a>
      </Space>
    ),
  },
];

// 定义组件接口
interface ModelAssociationProps {
  active?: boolean;
}

const ModelAssociation: React.FC<ModelAssociationProps> = ({ active }) => {
  const [row, setRow] = useState<API.RelationshipItem>();
  const [updateOpen, setUpdateOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [lookOpen, setLookOpen] = useState(false);
  const actionRef = useRef<ActionType>();
  const handleTableDelete = useTableDelete();
  const { message } = App.useApp();

  const params = useParams<{ id: string }>(); // 从URL路径获取modelId
  const model_id = Number(params.id);

  // 移除 loadData 函数和 useEffect，让 CustomProTable 自己处理数据加载
  // 只在 active 变化时触发一次刷新
  useEffect(() => {
    if (active && actionRef.current) {
      actionRef.current.reload();
    }
  }, [active]);

  const handleDelete = async (record: API.RelationshipItem) => {
    try {
      await handleTableDelete({
        api: deleteModelRelationship,
        params: record.rel_id,
        actionRef,
      });
    } catch (error) {
      console.error('删除模型关联失败:', error);
      message.error('删除失败，请稍后重试');
    }
  };

  return (
    <>
      <CustomProTable
        api={getModelRelationships}
        apiParams={model_id}
        pageName="modelRelationships"
        columns={columnsRender(setRow, setLookOpen, handleDelete, setUpdateOpen)}
        rowKey="rel_id"
        actionRef={actionRef}
        search={false}
        setCreateOpen={setCreateOpen}
      />

      {/* 其他模态框组件 */}
      <CreateForm
        modelId={model_id}
        open={createOpen}
        actionRef={actionRef}
        setOpen={setCreateOpen}
      />
      <UpdateForm
        title="编辑模型关联"
        open={updateOpen}
        actionRef={actionRef}
        setOpen={setUpdateOpen}
        values={row}
      />
      <LookForm
        title="模型关联详情"
        open={lookOpen}
        setOpen={setLookOpen}
        values={row}
        columns={columnsRender()}
      />
    </>
  );
};

export default ModelAssociation;
