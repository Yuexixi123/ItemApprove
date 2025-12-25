import { request } from '@umijs/max';

/** 获取关联类型列表 GET /association_type */
export async function getAssociationTypes(
  params?: {
    current?: number;
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.AssociationTypeResponse>('/association_type', {
    method: 'GET',
    params,
    ...(options || {}),
  });
}

/** 创建关联类型 POST /association_type */
export async function createAssociationType(
  body: API.CreateAssociationTypeRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse>('/association_type', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除关联类型 DELETE /association_type/${asst_id} */
export async function deleteAssociationType(asst_id: number, options?: { [key: string]: any }) {
  return request<API.BaseResponse>(`/association_type/${asst_id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 修改关联类型 PATCH /association_type/${asst_id} */
export async function updateAssociationType(
  asst_id: number,
  body: API.UpdateAssociationTypeRequest,
  options?: { [key: string]: any },
) {
  return request<API.BaseResponse>(`/association_type/${asst_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
