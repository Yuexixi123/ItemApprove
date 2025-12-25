import { request } from '@umijs/max';

export async function getCapacityApprovalDetail(id: number) {
  return request(`/audit/approval/capacity_approval/${id}`, {
    method: 'GET',
  });
}

export async function approveWorkflow(data: Workflow.ApproveParams) {
  return request('/workflow/approve', {
    method: 'POST',
    data,
  });
}

export async function getWorkflowTaskList(
  work_id: string | number,
  work_type: string,
  process_id: string | number,
  params?: { current?: number; pageSize?: number },
) {
  return request('/workflow/task-list', {
    method: 'GET',
    params: {
      work_id,
      work_type,
      process_id,
      current: params?.current,
      pageSize: params?.pageSize,
    },
  });
}
