import { request } from '@umijs/max';

/** 获取用户中文名列表 GET /user/user_name */
export async function getUserNames(options?: { [key: string]: any }) {
  return request<API.UserNamesResponse>('/v1/user/user_name', {
    method: 'GET',
    ...(options || {}),
  });
}
