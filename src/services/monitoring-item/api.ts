// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function getMonitoringItemModelNames() {
  return request<MonitoringItem.ModelNameResponse>('/v1/audit/zabbix_approval/item_model_name', {
    method: 'GET',
  });
}

/**
 * 获取监控项审批列表
 * @param params 分页参数
 * @returns 监控项审批列表数据
 */
export async function getMonitoringItemApprovalList(params?: MonitoringItem.ApprovalListParams) {
  return request<MonitoringItem.ApprovalListResponse>('/v1/audit/zabbix_approval/item_approval', {
    method: 'GET',
    params,
  });
}

/**
 * 新建监控项审批
 * @param data 审批数据
 * @returns 创建结果
 */
export async function createMonitoringItemApproval(data: MonitoringItem.CreateApprovalParams) {
  return request<MonitoringItem.CreateApprovalResponse>('/v1/audit/zabbix_approval/item_approval', {
    method: 'POST',
    data,
  });
}

/**
 * 修改监控项审批
 * @param itemApprovalId 监控项审批ID
 * @param data 审批数据
 * @returns 修改结果
 */
export async function updateMonitoringItemApproval(
  itemApprovalId: number,
  data: MonitoringItem.UpdateApprovalParams,
) {
  return request<MonitoringItem.UpdateApprovalResponse>(
    `/v1/audit/zabbix_approval/item_approval/${itemApprovalId}`,
    {
      method: 'PATCH',
      data,
    },
  );
}

/**
 * 获取模型资源属性 - 指定过滤条件
 * @param params 过滤参数，可选 model_id 或 model_key
 * @returns 模型资源属性列表
 */
export async function getModelAttributesWithFilter(
  params?: MonitoringItem.ModelAttributeFilterParams,
) {
  return request<MonitoringItem.ModelAttributeFilterResponse>('/v1/resource/model/attribute', {
    method: 'GET',
    params,
  });
}

/**
 * 获取监控项及关联的触发器资源
 * @param modelId 监控项模型ID
 * @param params 可选参数，包含主机资源ID
 * @returns 监控项及关联触发器资源数据
 */
export async function getMonitoringItemRelatedResources(
  params?: MonitoringItem.RelatedResourceParams,
) {
  return request<MonitoringItem.RelatedResourceResponse>(
    `/v1/audit/zabbix_approval/relate_resource`,
    {
      method: 'GET',
      params,
    },
  );
}
