import { PageContainer, ProColumns, ActionType } from '@ant-design/pro-components';
import CustomProTable from '@/components/MyProTable/CustomProTable';
// import { Space } from 'antd';
import { useState, useRef } from 'react';
import CreateForm from './components/CreateForm';
import EditForm from './components/UpdateForm';
import ApproveForm from './components/ApproveForm';
import GetResourceCreateForm from './components/GetResourceCreateForm';
import LookForm from './components/LookForm';
// 导入容量管理审批列表 API
import { getCapacityApprovalList } from '@/services/capacity';
import { Button, Space } from 'antd';
import { PlusOutlined } from '@ant-design/icons';

const columnsRender = (
  setRow: (record: MonitoringItem.ApprovalItem) => void,
  setUpdateOpen: (open: boolean) => void,
  setApproveOpen: (open: boolean) => void,
  setLookOpen: (open: boolean) => void,
): // setRow: (record: MonitoringItem.ApprovalItem) => void = () => {},
// setLookOpen: (open: boolean) => void = () => { },
// setUpdateOpen: (open: boolean) => void = () => {},
ProColumns<any>[] => [
  {
    title: '序号',
    valueType: 'indexBorder',
    width: 60,
    render: (_, record, index, action) => {
      // 自动计算全局序号
      return (
        ((action?.pageInfo?.current || 1) - 1) * (action?.pageInfo?.pageSize || 10) + index + 1
      );
    },
  },
  // 列定义保持不变
  {
    title: '系统名称',
    dataIndex: 'system_name',
    key: 'system_name',
  },
  {
    title: '申请类型',
    dataIndex: 'create_type', // 修改为与 API 返回的字段名匹配
    key: 'create_type',
    valueEnum: {
      // 添加状态枚举值
      1: { text: '新增资源' },
      2: { text: '现有资源' },
    },
  },
  {
    title: '项目名称',
    dataIndex: 'project_name', // 修改为与 API 返回的字段名匹配
    key: 'project_name',
  },
  {
    title: '项目编号',
    dataIndex: 'project_code', // 修改为与 API 返回的字段名匹配
    key: 'project_code',
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
  {
    title: '状态',
    dataIndex: 'approval_status', // 修改为与 API 返回的字段名匹配
    key: 'approval_status',
    valueEnum: {
      // 添加状态枚举值
      1: { text: '可编辑', status: 'default' },
      2: { text: '流转中', status: 'processing' },
      3: { text: '完成', status: 'success' },
    },
  },
  {
    title: '操作',
    dataIndex: 'option',
    valueType: 'option',
    key: 'option',
    width: '10%',
    render: (text, record) => (
      <Space>
        {!record.workflow_info?.is_approve && (
          <a
            onClick={() => {
              setRow(record);
              setLookOpen(true);
            }}
          >
            查看
          </a>
        )}
        {record.workflow_info?.is_approve && (
          <a
            style={{ color: 'red' }}
            onClick={() => {
              setRow(record);
              setApproveOpen(true);
            }}
          >
            审批
          </a>
        )}
        {(record?.is_edit || record?.approval_status === 1) && (
          <a
            onClick={() => {
              setRow(record);
              setUpdateOpen(true);
            }}
          >
            编辑
          </a>
        )}
      </Space>
    ),
  },
];
const CapacityManagement = () => {
  // const { modal } = App.useApp()
  const actionRef = useRef<ActionType>();

  const [createOpen, setCreateOpen] = useState(false);

  const [getResouceCreateOpen, setGetResouceCreateOpen] = useState(false);

  const [updateOpen, setUpdateOpen] = useState(false);

  const [lookOpen, setLookOpen] = useState(false);

  const [approveOpen, setApproveOpen] = useState(false);

  const [row, setRow] = useState<MonitoringItem.ApprovalItem>();

  return (
    <PageContainer title={false}>
      {/* 预先构建列，复用到查看组件 */}
      {(() => {
        const columns = columnsRender(setRow, setUpdateOpen, setApproveOpen, setLookOpen);
        return (
          <CustomProTable
            pageName="capacity_management"
            api={getCapacityApprovalList}
            toolBarRender={() => [
              <Button
                key="create"
                type="primary"
                onClick={() => setCreateOpen?.(true)}
                icon={<PlusOutlined />}
              >
                新增资源申请
              </Button>,
              <Button
                key="getResouceCreate"
                type="primary"
                onClick={() => setGetResouceCreateOpen?.(true)}
                icon={<PlusOutlined />}
              >
                现有资源申请
              </Button>,
            ]}
            setCreateOpen={setCreateOpen}
            columns={columns}
            rowKey="id" // 修改为 API 返回数据的主键字段
            actionRef={actionRef}
          />
        );
      })()}

      <CreateForm
        open={createOpen}
        setOpen={setCreateOpen}
        setApproveOpen={setApproveOpen}
        actionRef={actionRef}
      />
      <GetResourceCreateForm
        open={getResouceCreateOpen}
        setOpen={setGetResouceCreateOpen}
        setApproveOpen={setApproveOpen}
        actionRef={actionRef}
      />
      <EditForm
        title="编辑申请"
        open={updateOpen}
        setOpen={setUpdateOpen}
        actionRef={actionRef}
        approvalId={row?.id}
        row={row}
      />

      <ApproveForm
        open={approveOpen}
        setOpen={setApproveOpen}
        actionRef={actionRef}
        approvalId={row?.id}
        row={row}
      />

      {/* 查看详情 */}
      <LookForm
        // title="审批详情"
        open={lookOpen}
        setOpen={setLookOpen}
        values={row}
      />
    </PageContainer>
  );
};

export default CapacityManagement;
