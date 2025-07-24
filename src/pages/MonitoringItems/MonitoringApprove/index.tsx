import { PageContainer, ProColumns } from '@ant-design/pro-components';
import CustomProTable from '@/components/MyProTable/CustomProTable';
import { Space } from 'antd';
import { useState } from 'react';
import CreateForm from './components/CreateForm';
import UpdateForm from './components/CreateForm';
import WorkflowForm from '@/components/Workflow/WorkflowForm';
// 导入 getMonitoringItemApprovalList API
import { getMonitoringItemApprovalList } from '@/services/monitoring-item/api';

const columnsRender = (
  setRow: (record: MonitoringItem.ApprovalItem) => void = () => {},
  // setLookOpen: (open: boolean) => void = () => { },
  setUpdateOpen: (open: boolean) => void = () => {},
): ProColumns<any>[] => [
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
  },
  {
    title: '申请时间',
    dataIndex: 'create_time', // 修改为与 API 返回的字段名匹配
    key: 'create_time',
    hideInSearch: true,
  },
  {
    title: '操作',
    dataIndex: 'option',
    valueType: 'option',
    key: 'option',
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
          }}
        >
          删除
        </a>
      </Space>
    ),
  },
];
const MonitoringApprove = () => {
  // const { modal } = App.useApp()

  const [createOpen, setCreateOpen] = useState(false);
  const [updateOpen, setUpdateOpen] = useState(false);
  const [row, setRow] = useState<MonitoringItem.ApprovalItem>();
  // const [lookOpen, setLookOpen] = useState(false)
  const [approveOpen, setApproveOpen] = useState(false);

  return (
    <PageContainer title={false}>
      <CustomProTable
        pageName="monitoring_approve"
        api={getMonitoringItemApprovalList}
        setCreateOpen={setCreateOpen}
        columns={columnsRender(setRow, setUpdateOpen)}
        rowKey="system_name" // 修改为 API 返回数据的主键字段
      />

      <CreateForm open={createOpen} setOpen={setCreateOpen} setApproveOpen={setApproveOpen} />
      <UpdateForm
        title="编辑申请"
        open={updateOpen}
        setOpen={setUpdateOpen}
        values={row}
        setApproveOpen={setApproveOpen}
      />

      <WorkflowForm
        visible={approveOpen}
        onVisibleChange={setApproveOpen}
        // onFinish={handleFinish}
        workType="yourWorkType"
        workId="yourWorkId"
        processCode="yourProcessCode"
      />
    </PageContainer>
  );
};

export default MonitoringApprove;
