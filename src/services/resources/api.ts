import { request } from '@umijs/max';

/**
 * 获取模型资源列表
 * @param modelId - 模型ID
 * @param params - 分页和筛选参数
 * @returns 资源列表数据
 */
export async function getModelResources(
  modelId: number,
  params?: API.ResourceListParams,
): Promise<API.ResourceListResponse> {
  return request(`/resource/model/${modelId}`, {
    method: 'GET',
    params: {
      ...params,
    },
  });
}

/**
 * 获取模型资源属性
 * @param modelId - 模型ID
 * @returns 模型属性列表
 * @description 将模型属性字段返回给前端，提前渲染表格字段
 */
export async function getModelAttributes(modelId: number): Promise<API.ModelAttributeResponse> {
  return request(`/resource/model/${modelId}/attribute`, {
    method: 'GET',
  });
}

/**
 * 新增模型资源
 * @param modelId - 模型ID
 * @param data - 资源属性数据，根据模型属性定义的字段
 * @returns 创建结果
 */
export async function createModelResource(
  modelId: string | number,
  data: Record<string, any>,
): Promise<API.BaseResponse> {
  return request(`/resource/model/${modelId}`, {
    method: 'POST',
    data,
  });
}

/**
 * 删除模型资源
 * @param resourceId - 资源ID
 * @param resourceIds - 要删除的资源ID数组
 * @returns 删除结果
 */
export async function deleteResource(resourceIds: number[]): Promise<API.BaseResponse> {
  return request(`/resource`, {
    method: 'DELETE',
    data: {
      resource_ids: resourceIds,
    },
  });
}

/**
 * 修改模型资源
 * @param resourceId - 资源ID
 * @param data - 资源属性数据，根据模型属性定义的字段
 * @returns 修改结果w
 */
export async function updateResource(
  resourceId: string | number,
  body: Record<string, any>,
): Promise<API.BaseResponse> {
  return request(`/resource/${resourceId}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
  });
}

/**
 * 保存模型属性列状态
 * @param modelId - 模型ID
 * @param attributes - 属性配置数组
 * @returns 保存结果
 */
export async function saveModelAttributes(
  modelId: number,
  attributes: API.ModelAttributeUpdateItem[],
): Promise<API.BaseResponse> {
  return request(`/resource/model/${modelId}/attribute`, {
    method: 'POST',
    data: { attrs: attributes },
  });
}

/**
 * 获取单条资源信息
 * @param resourceId - 资源ID
 * @param modelId - 模型ID
 * @returns 资源信息
 */
export async function getResourceDetail(params: {
  resource_id: number;
  model_id: number;
}): Promise<API.ResourceDetailResponse> {
  return request<API.ResourceDetailResponse>(
    `/resource/${params.resource_id}/model/${params.model_id}`,
    {
      method: 'GET',
    },
  );
}

/**
 * 获取模型资源名称列表
 * @param model_key - 模型KEY（必填）
 * @returns 资源名称列表
 * @description 应用场景：监控项审批功能"获取系统资源名称列表"API
 */
export async function getModelResourceNames(
  model_key: string,
): Promise<API.ResourceNameListResponse> {
  return request('/resource/model/resource_name', {
    method: 'GET',
    params: { model_key },
  });
}

/**
 * 获取指定资源关联的资源名列表
 * @param resource_id - 资源ID
 * @param params - 筛选参数
 * @returns 关联资源名称列表
 * @description 应用场景：监控项审批功能"获取系统资源关联的主机资源名称列表"API
 */
export async function getResourceNameRelationship(
  resource_id: number,
  params: {
    model_key: string;
  },
): Promise<API.ResourceNameListResponse> {
  return request<API.ResourceNameListResponse>(
    `/resource/${resource_id}/resource_name_relationship`,
    {
      method: 'GET',
      params,
    },
  );
}
