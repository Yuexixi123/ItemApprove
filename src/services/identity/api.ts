// @ts-ignore
/* eslint-disable */
import { request } from '@umijs/max';

export async function login(data: Identity.LoginParams) {
  return request<Identity.LoginResponse>('/identity/login', {
    method: 'POST',
    data,
  });
}

export async function signout() {
  return request<Identity.SignoutResponse>('/identity/signout', {
    method: 'POST',
  });
}
