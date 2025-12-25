// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function approveWorkflow(data: Workflow.ApproveParams) {
  return request<Workflow.ApproveResponse>('/workflow/approve', {
    method: 'POST',
    data,
  });
}

export async function getWorkflowTaskList(
  work_id: string | number,
  work_type: string,
  params?: { current?: number; pageSize?: number },
) {
  return request<Workflow.TaskListResponse>('/workflow/task-list', {
    method: 'GET',
    params: {
      work_id,
      work_type,
      current: params?.current,
      pageSize: params?.pageSize,
    },
  });
}

export async function getCapacityApprovalDetail(id: number) {
  return request(`/audit/approval/capacity_approval/${id}`, {
    method: 'GET',
  });
}
