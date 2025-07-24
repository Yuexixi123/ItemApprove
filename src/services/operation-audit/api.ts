import { request } from '@umijs/max';
/**
 * 获取操作审计日志
 * @param category 类别 - resource: 资源, model: 模型, user: 用户
 * @param params 查询参数
 * @param options 请求选项
 * @returns 操作审计日志列表
 */
export async function getOperationAudit(
  category: 'resource' | 'model' | 'user',
  params: API.OperationAuditParams,
  options?: { [key: string]: any },
) {
  return request<API.OperationAuditResponse>(`/v1/audit/operation_audit/${category}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
    ...(options || {}),
  });
}
