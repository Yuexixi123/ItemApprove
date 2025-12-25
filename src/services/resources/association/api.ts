import { request } from '@umijs/max';

/**
 * 获取模型关联关系名称拼接列表
 * @param model_id - 模型ID
 * @param params - 查询参数
 * @returns 模型关联关系拼接名列表
 * @description 应用场景：
 * 1. 资源->关联关系->关联资源列表
 * 2. 资源->关联关系->新建关联关系->模型关联关系列表
 * 关联关系名称为：关联类型+被关联模型名
 */
export async function getModelRelationshipJoinNames(
  model_id: number,
  params?: {
    is_select?: boolean; // 是否获取完整数据。False: 仅获取有关联资源的名称列表，True：获取所有模型关联关系拼接名列表
  },
): Promise<API.ModelRelationshipJoinNameResponse> {
  return request(`/model/${model_id}/relationship/rel_join_name`, {
    method: 'GET',
    params,
  });
}

/**
 * 获取关联的资源
 * @param resource_rel_id - 资源关联关系ID
 * @returns 关联的资源列表
 * @description 目前仅支持向下查询1层的关联资源
 * 支持获取方向：向上(该资源向上关联的资源)、向下(该资源向下关联的资源)、无向(该资源所有关联的资源)
 * 支持获取关联层级：1层、2层、3层、所有层
 */
export async function getRelatedResources(
  resource_rel_id: number,
): Promise<API.RelatedResourceResponse> {
  return request(`/resource/resource_rel/${resource_rel_id}/relationship`, {
    method: 'GET',
  });
}

/**
 * 获取模型资源列表 (带有关联关系状态)
 * @param model_id - 模型ID
 * @param params - 查询参数
 * @returns 模型资源列表（带关联关系状态）
 * @description 获取指定模型下的资源列表，包含关联关系状态信息
 * 需要过滤的参数值较多，路由传参可能不太方便
 */
export async function getModelResourcesWithRelStatus(
  model_id: number,
  params: {
    current: number; // 当前页
    page_size: number; // 每页条数
    id?: number; // 用于过滤的资源ID
    instance_name?: string; // 资源实例名字段
    create_name?: number; // 创建人
    create_time?: string; // 创建时间（时间字符串）
    rel_id?: number; // 模型关联关系ID
    resource_id?: number; // 用于获取关联关系的资源ID
  },
): Promise<API.ModelResourcesWithRelStatusResponse> {
  return request(`/resource/model/${model_id}/rel_status`, {
    method: 'GET',
    params,
  });
}

/**
 * 新增资源关联关系
 * @param model_relationship_id - 模型关联关系ID
 * @param params - 关联关系参数
 * @returns 创建结果
 * @description 在指定的模型关联关系下创建资源之间的关联关系
 */
export async function createResourceRelationship(
  model_relationship_id: number,
  params: API.CreateResourceRelationshipParams,
): Promise<API.CreateResourceRelationshipResponse> {
  return request(`/resource/model_rel/${model_relationship_id}/relationship`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: params,
  });
}

/**
 * 取消资源关联关系
 * @param rel_id - 关联关系ID
 * @returns 删除结果
 * @description 删除指定的资源关联关系
 */
export async function deleteResourceRelationship(
  rel_id: string,
): Promise<API.DeleteResourceRelationshipResponse> {
  return request(`/resource/relationship/${rel_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    data: {},
  });
}

/**
 * 获取模型资源列表 (仅获取有"资源关联关系"的资源)
 * @param model_id - 模型ID
 * @param params - 查询参数
 * @returns 模型资源列表（仅包含有关联关系的资源）
 * @description 新建资源关联关系时，获取带关联资源列表(仅展示内置属性)
 */
export async function getModelRelatedResources(
  model_id: number,
  params: {
    rel_id: number; // 模型关联关系ID
    resource_id: number; // 用于获取关联关系的资源ID
    current: number; // 当前页
    page_size: number; // 每页条数
  },
): Promise<API.ModelRelatedResourcesResponse> {
  return request(`/resource/model/${model_id}/rel_resource`, {
    method: 'GET',
    params,
  });
}
