import { request } from '@umijs/max';
export async function getModelAttributes(model_id: number, options?: { [key: string]: any }) {
  return request<API.AttributeResponse>(`/attribute/${model_id}`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 获取属性名称列表 GET /attribute/model/{model_id}/attribute_name */
export async function getAttributeNameList(model_id: number, options?: { [key: string]: any }) {
  return request<API.AttributeNameListResponse>(`/attribute/model/${model_id}/attribute_name`, {
    method: 'GET',
    ...(options || {}),
  });
}

/** 创建模型属性 POST /attribute/${model_id}/attr_group/${attrgroup_id} */
export async function createModelAttribute(
  attrgroup_id: number,
  body: API.CreateAttributeRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse>(`/attribute/attr_group/${attrgroup_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除模型属性 DELETE /attribute/${attr_id} */
export async function deleteModelAttribute(attr_id: number, options?: { [key: string]: any }) {
  return request<API.BaseResponse>(`/attribute/${attr_id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 修改模型属性 PATCH /attribute/${attr_id} */
export async function updateModelAttribute(
  attr_id: number,
  body: API.UpdateAttributeRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse>(`/attribute/${attr_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 创建属性分组 POST /attribute/group/${model_id} */
export async function createAttributeGroup(
  body: API.CreateAttributeGroupRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse>(`/attribute/group`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除属性分组 DELETE /attribute/group/${attrgroup_id} */
export async function deleteAttributeGroup(attrgroup_id: number, options?: { [key: string]: any }) {
  return request<API.BaseResponse>(`/attribute/group/${attrgroup_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/** 修改属性分组 PATCH /attribute/group/${attrgroup_id} */
export async function updateAttributeGroup(
  attrgroup_id: number,
  body: API.UpdateAttributeGroupRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse>(`/attribute/group/${attrgroup_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
