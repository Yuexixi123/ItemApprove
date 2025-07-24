import { request } from '@umijs/max';

export async function fetchMenuFromApi(): Promise<Menu.ResponseMenu> {
  return request('/v1/home/menu', {
    method: 'GET',
  });
}
