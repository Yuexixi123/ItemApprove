import React from 'react';
import { ProTable, type ProColumns } from '@ant-design/pro-components';
import { getWorkflowTaskList } from '@/services/workflow';

interface WorkflowTableProps {
  workId: string | number;
  workType: string;
  taskId?: string | number;
  processId: string | number;
}

const WorkflowTable: React.FC<WorkflowTableProps> = ({ workId, workType, taskId, processId }) => {
  const actionRef = React.useRef<any>();

  React.useEffect(() => {
    if (workId) {
      actionRef.current?.reload();
    }
  }, [workId]);

  const columns: ProColumns<Workflow.TaskItem>[] = [
    // { title: 'ID', dataIndex: 'id', key: 'id', width: 100 },
    { title: '任务名称', dataIndex: 'taskName', key: 'taskName' },
    { title: '处理人', dataIndex: 'taskActorsName', key: 'taskActorsName', width: 120 },
    { title: '处理结果', dataIndex: 'doResult', key: 'doResult', width: 100 },
    { title: '处理意见', dataIndex: 'doRemark', key: 'doRemark' },
    { title: '开始时间', dataIndex: 'startDate', key: 'startDate', width: 180 },
    { title: '结束时间', dataIndex: 'endDate', key: 'endDate', width: 180 },
    { title: '状态', dataIndex: 'workStateName', key: 'workStateName', width: 100 },
    { title: '发起人', dataIndex: 'workCreaterName', key: 'workCreaterName', width: 120 },
    // { title: '流程编码', dataIndex: 'processCode', key: 'processCode' },
  ];

  return (
    <ProTable<Workflow.TaskItem>
      actionRef={actionRef}
      columns={columns}
      rowKey="id"
      search={false}
      pagination={{ pageSize: 10 }}
      toolBarRender={false}
      params={{ workId, taskId, processId }}
      request={async () => {
        const res = await getWorkflowTaskList(workId, workType, processId);
        const success = !!(res && (res.success === true || res.inside_code === 0));
        const list = res?.data?.list || [];
        const total = res?.data?.pagination?.total || 0;
        return {
          data: list,
          success,
          total,
        };
      }}
    />
  );
};

export default WorkflowTable;
