// @ts-ignore
/* eslint-disable */

declare namespace Menu {
  interface ResponseMenu {
    inside_code: number;
    message: string;
    data: MenuItem[];
  }
  interface MenuItem {
    path: string; // 路由路径
    name: string; // 菜单名称
    icon?: string; // 图标
    component?: string; // 组件路径
    routes?: MenuItem[]; // 子菜单
    access?: string; // 权限标识
  }
}
