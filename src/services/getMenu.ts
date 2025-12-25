import { request } from '@umijs/max';

export async function fetchMenuFromApi(): Promise<Menu.ResponseMenu> {
  return request('/home/menu', {
    method: 'GET',
  });
}
