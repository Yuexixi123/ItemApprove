import { request } from '@umijs/max';

/** 获取关联类型名称列表 GET /association_type/association_type_name */
export async function getAssociationTypeNames(options?: { [key: string]: any }) {
  return request<API.AssociationTypeNameResponse>(`/v1/association_type/association_type_name`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取模型关联关系 GET /model/relationship/${model_id} */
export async function getModelRelationships(model_id: number, options?: { [key: string]: any }) {
  return request<API.RelationshipResponse>(`/v1/model/${model_id}/relationship`, {
    method: 'GET',
    params: {
      ...options,
    },
  });
}

/** 新增模型关联关系 POST /model/relationship/${model_id} */
export async function createModelRelationship(
  model_id: number,
  body: {
    src_model_id: number;
    dest_model_id: number;
    asst_type_id: number;
    constraint: string; // "N-N" | "1-N" | "1-1"
    rel_desc?: string | null;
  },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse>(`/v1/model/${model_id}/relationship`, {
    method: 'POST',
    data: body,
    ...(options || {}),
  });
}

/** 删除模型关联关系 DELETE /model/relationship/${rel_id} */
export async function deleteModelRelationship(rel_id: number, options?: { [key: string]: any }) {
  return request<API.BaseResponse>(`/v1/model/relationship/${rel_id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 修改模型关联关系 PATCH /model/relationship/${rel_id} */
export async function updateModelRelationship(
  rel_id: string,
  body: {
    rel_desc: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse>(`/v1/model/relationship/${rel_id}`, {
    method: 'PATCH',
    data: body,
    ...(options || {}),
  });
}
