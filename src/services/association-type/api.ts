// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

/** 获取关联类型列表 GET /association_type */
export async function getAssociationType(
  params: {
    current?: number;
    page_size?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.AssociationTypeListResponse>('/v1/association_type', {
    method: 'GET',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

/** 创建关联类型 POST /association_type */
export async function createAssociationType(
  body: API.CreateAssociationTypeRequest,
  options?: { [key: string]: any },
) {
  return request<API.CreateAssociationTypeResponse>('/v1/association_type', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除关联类型 DELETE /association_type/{asst_id} */
export async function deleteAssociationType(asst_id: number, options?: { [key: string]: any }) {
  return request<API.DeleteAssociationTypeResponse>(`/v1/association_type/${asst_id}`, {
    method: 'DELETE',
    ...(options || {}),
  });
}

/** 更新关联类型 PATCH /association_type/{asst_id} */
export async function updateAssociationType(
  asst_id: number,
  body: {
    asst_name?: string;
    dest_desc?: string;
    src_desc?: string;
    direction?: string;
    desc?: string;
  },
  options?: { [key: string]: any },
) {
  return request<API.UpdateAssociationTypeResponse>(`/v1/association_type/${asst_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
