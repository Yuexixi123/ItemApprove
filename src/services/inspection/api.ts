// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/**
 * 获取系统列表
 * @param params 分页参数
 * @returns 系统列表数据
 */
export async function getSystemList(params: Inspection.SystemListParams) {
  return request<Inspection.SystemListResponse>('/audit/inspection/systems', {
    method: 'GET',
    params,
  });
}

/**
 * 插入系统下的所有主机到Redis缓存
 * @param params 系统ID参数
 * @returns 主机缓存结果
 */
export async function insertSystemHostCache(params: Inspection.SystemHostCacheParams) {
  return request<Inspection.SystemHostCacheResponse>('/audit/inspection/sys_host_cache', {
    method: 'POST',
    params,
  });
}

/**
 * 一键巡检接口
 * @param params 系统ID参数
 * @returns 巡检数据
 */
export async function executeInspection(params: Inspection.InspectionParams) {
  return request<Inspection.InspectionResponse>('/audit/inspection', {
    method: 'POST',
    params,
  });
}

/**
 * 获取监控项历史数据
 * @param itemId 监控项的唯一ID
 * @param params 查询参数
 * @param params.stime 开始时间
 * @param params.etime 结束时间
 * @returns 历史数据
 */
export async function getItemHistoryData(
  itemId: string,
  params?: { stime?: string; etime?: string },
) {
  return request<Inspection.HistoryDataResponse>(`/audit/inspection/item/${itemId}`, {
    method: 'GET',
    params,
  });
}
