// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/**
 * 获取容量管理审批列表
 * @param params 查询参数
 * @returns 审批列表数据
 */
export async function getCapacityApprovalList(params?: CapacityManagement.GetApprovalListParams) {
  return request<CapacityManagement.ApprovalListResponse>('/audit/approval/capacity_approval', {
    method: 'GET',
    params,
  });
}

/**
 * 新建容量管理审批
 * 过滤掉原始数据（无操作动作），仅缓存有操作动作的资源与子资源
 */
export async function createCapacityApproval(data: CapacityManagement.CreateApprovalParams) {
  return request<CapacityManagement.CommonResponse>('/audit/approval/capacity_approval', {
    method: 'POST',
    data,
  });
}

/**
 * 获取容量管理审批的模型名称选项
 */
export async function getCapacityApprovalModelNames(params: {
  model_type?: 'capacity_main' | 'capacity_child';
  custom_group?: string;
}) {
  return request<CapacityManagement.ModelNameListResponse>(
    '/audit/approval/capacity_approval/model_name',
    {
      method: 'GET',
      params,
    },
  );
}

/**
 * 获取容量审批详情
 */
export async function getCapacityApprovalDetail(approvalId: number) {
  return request<CapacityManagement.ApprovalDetailResponse>(
    `/audit/approval/capacity_approval/${approvalId}`,
    {
      method: 'GET',
    },
  );
}

/**
 * 获取主资源及关联的子资源（监控项审批定制接口）
 */
export async function getRelateResource(params: {
  sys_rel: string;
  sys_resource_id: number;
  main_model_key: string;
}) {
  return request<CapacityManagement.RelateResourceResponse>(
    '/audit/approval/capacity_approval/relate_resource',
    {
      method: 'GET',
      params,
    },
  );
}

/**
 * 更新容量管理审批
 */
export async function updateCapacityApproval(
  approvalId: number | string,
  data: CapacityManagement.UpdateApprovalParams,
) {
  return request<CapacityManagement.CommonResponse>(
    `/audit/approval/capacity_approval/${approvalId}`,
    {
      method: 'PATCH',
      data,
    },
  );
}

export async function getCapacityApprovalModelAttributes(
  modelId: number,
  params?: { approval_id?: number },
) {
  return request<CapacityManagement.ModelAttributeResponse>(
    `/audit/approval/capacity_approval/model/${modelId}/attributes`,
    {
      method: 'GET',
      params,
    },
  );
}
