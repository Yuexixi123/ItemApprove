import { PageContainer } from '@ant-design/pro-components';
import { ActionType, ProColumns } from '@ant-design/pro-table';
import { Space } from 'antd';
import UpdateForm from './components/UpdateForm';
import CreateForm from './components/UpdateForm';
import LookForm from '@/components/LookForm';
import { useRef, useState } from 'react';
import CustomProTable from '@/components/MyProTable/CustomProTable';
import { getAssociationType, deleteAssociationType } from '@/services/association-type/api';
import { useTableDelete } from '@/hooks/useTableDelete';

export const columnsRender = (
  handleDelete: (record: API.AssociationType) => void,
  setRow?: (record: API.AssociationType) => void,
  setUpdateOpen?: (open: boolean) => void,
  setLookOpen?: (open: boolean) => void,
): ProColumns<API.AssociationType>[] => {
  return [
    {
      title: '唯一标识',
      dataIndex: 'asst_key',
      hideInSearch: true,
      hideInDescriptions: true,
      render: (dom: React.ReactNode, record: API.AssociationType) => {
        return (
          <a
            onClick={() => {
              setRow?.(record);
              setLookOpen?.(true);
            }}
          >
            {dom}
          </a>
        );
      },
    },
    {
      title: '唯一标识',
      dataIndex: 'asst_key',
      hideInSearch: true,
      hideInTable: true,
      hideInForm: true,
    },
    {
      title: '名称',
      dataIndex: 'asst_name',
    },
    {
      title: '源->目标描述',
      dataIndex: 'src_desc',
      hideInSearch: true,
    },
    {
      title: '目标->源描述',
      dataIndex: 'dest_desc',
      hideInSearch: true,
    },
    {
      title: '方向',
      dataIndex: 'direction',
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '使用数',
      dataIndex: 'count',
      hideInSearch: true,
      hideInForm: true,
    },
    {
      title: '描述',
      dataIndex: 'desc',
      hideInSearch: true,
      hideInTable: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      width: '20%',
      render: (_text: any, record: API.AssociationType) => {
        return (
          <Space>
            <a
              key="edit"
              onClick={(e) => {
                e.stopPropagation();
                setRow?.(record);
                setUpdateOpen?.(true);
              }}
            >
              编辑
            </a>
            <a key="delete" style={{ color: 'red' }} onClick={() => handleDelete(record)}>
              删除
            </a>
          </Space>
        );
      },
    },
  ];
};

export default () => {
  const [createOpen, setCreateOpen] = useState(false);

  const [updateOpen, setUpdateOpen] = useState(false);

  const [lookOpen, setLookOpen] = useState(false);

  const [row, setRow] = useState<API.AssociationType>();

  const handleTableDelete = useTableDelete();

  const actionRef = useRef<ActionType>();

  const handleDelete = async (record: API.AssociationType) => {
    const success = await handleTableDelete({
      api: deleteAssociationType,
      params: record?.id,
    });
    if (success) {
      actionRef.current?.reload();
    }
  };

  const columns = columnsRender(handleDelete, setRow, setUpdateOpen, setLookOpen);

  // Create a version of columns without 'key' properties for LookForm
  const lookFormColumns = columns.map((column) => {
    const { ...rest } = column;
    return rest;
  });

  return (
    <PageContainer title={false}>
      <CustomProTable
        api={getAssociationType}
        pageName="modelRelationships"
        columns={columns}
        actionRef={actionRef}
        rowKey="asst_id"
        search={false}
        setCreateOpen={setCreateOpen}
      />
      <CreateForm open={createOpen} setOpen={setCreateOpen} actionRef={actionRef} />
      <LookForm
        title="关联类型详情"
        open={lookOpen}
        setOpen={setLookOpen}
        values={row}
        columns={lookFormColumns}
      />
      {row && (
        <UpdateForm
          title="编辑关联类型"
          open={updateOpen}
          setOpen={setUpdateOpen}
          values={row}
          setRow={setRow}
          actionRef={actionRef}
        />
      )}
    </PageContainer>
  );
};
