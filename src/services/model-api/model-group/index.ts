import { request } from '@umijs/max';

/** 创建模型分组 POST /model/group */
export async function createModelGroup(
  body: API.CreateModelGroupRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse>('/v1/model_group', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除模型分组 DELETE /model/group/${modelgroup_id} */
export async function deleteModelGroup(modelgroup_id: string, options?: { [key: string]: any }) {
  return request<API.BaseResponse>(`/v1/model_group/${modelgroup_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/** 修改模型分组 PATCH /model/group/${modelgroup_id} */
export async function updateModelGroup(
  modelgroup_id: number,
  body: API.UpdateModelGroupRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse>(`/v1/model_group/${modelgroup_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
