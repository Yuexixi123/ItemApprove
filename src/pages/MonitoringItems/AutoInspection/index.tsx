import { PageContainer, ProColumns, ActionType } from '@ant-design/pro-components';
import CustomProTable from '@/components/MyProTable/CustomProTable';
import { useState, useRef } from 'react';
import CreateForm from './components/CreateForm';
import { getMonitoringItemApprovalList } from '@/services/monitoring-item/api';

const columnsRender = (): // setRow: (record: MonitoringItem.ApprovalItem) => void = () => {},
// setLookOpen: (open: boolean) => void = () => { },
// setUpdateOpen: (open: boolean) => void = () => {},
ProColumns<any>[] => [
  // 列定义保持不变
  {
    title: '系统名称',
    dataIndex: 'system_name',
    key: 'system_name',
  },
  {
    title: '状态',
    dataIndex: 'approval_status', // 修改为与 API 返回的字段名匹配
    key: 'approval_status',
    hideInSearch: true,
    valueEnum: {
      // 添加状态枚举值
      1: { text: '可编辑', status: 'default' },
      2: { text: '流转中', status: 'processing' },
    },
  },
  {
    title: '申请人',
    dataIndex: 'create_name', // 修改为与 API 返回的字段名匹配
    key: 'create_name',
    hideInSearch: true,
  },
  {
    title: '申请时间',
    dataIndex: 'create_time', // 修改为与 API 返回的字段名匹配
    key: 'create_time',
    hideInSearch: true,
  },
  // {
  //   title: '操作',
  //   dataIndex: 'option',
  //   valueType: 'option',
  //   key: 'option',
  //   width: '10%',
  //   render: (text, record) => (
  //     <Space>
  //       <a
  //         onClick={() => {
  //           setRow(record);
  //           setUpdateOpen(true);
  //         }}
  //       >
  //         编辑
  //       </a>
  //     </Space>
  //   ),
  // },
];
const MonitoringApprove = () => {
  // const { modal } = App.useApp()
  const actionRef = useRef<ActionType>();

  const [createOpen, setCreateOpen] = useState(false);
  // const [updateOpen, setUpdateOpen] = useState(false);
  // const [row, setRow] = useState<MonitoringItem.ApprovalItem>();
  // const [lookOpen, setLookOpen] = useState(false)

  return (
    <PageContainer title={false}>
      <CustomProTable
        pageName="monitoring_approve"
        api={getMonitoringItemApprovalList}
        setCreateOpen={setCreateOpen}
        // columns={columnsRender(setRow, setUpdateOpen)}
        columns={columnsRender()}
        rowKey="id" // 修改为 API 返回数据的主键字段
        actionRef={actionRef}
      />

      <CreateForm open={createOpen} setOpen={setCreateOpen} actionRef={actionRef} />
      {/* <EditForm
        title="编辑申请"
        open={updateOpen}
        setOpen={setUpdateOpen}
        values={row}
        actionRef={actionRef}
        setApproveOpen={setApproveOpen}
        approvalId={row?.id}
      /> */}
    </PageContainer>
  );
};

export default MonitoringApprove;
