import { AvatarDropdown, AvatarName } from '@/components';
import NoticeIcon from '@/components/NoticeIcon';
// import { currentUser as queryCurrentUser } from '@/services/ant-design-pro/api';
import type { Settings as LayoutSettings, MenuDataItem } from '@ant-design/pro-components';
import { SettingDrawer } from '@ant-design/pro-components';
import type { RunTimeLayoutConfig } from '@umijs/max';
import { history } from '@umijs/max';
import React, { lazy, Suspense } from 'react'; // 使用 React 的 lazy 和 Suspense
import defaultSettings from '../config/defaultSettings';
import { fetchMenuFromApi } from '@/services/getMenu';
import * as Icons from '@ant-design/icons';
import { App, Spin } from 'antd';
import { ReactElement, JSXElementConstructor, ReactNode, ReactPortal } from 'react';
import { setNotificationInstance } from '@/utils/notification';
// 导入请求配置
import { requestConfig } from '@/services/requestConfig';

// AppWrapper组件用于获取App context
const AppWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { notification } = App.useApp();

  // 设置全局notification实例
  React.useEffect(() => {
    setNotificationInstance(notification);
  }, [notification]);

  return <>{children}</>;
};

// // 添加控制台警告过滤，忽略 findDOMNode 警告
// if (process.env.NODE_ENV !== 'production') {
//   const originalConsoleError = console.error;
//   console.error = (...args) => {
//     if (args[0] && typeof args[0] === 'string' && args[0].includes('findDOMNode')) {
//       return;
//     }
//     originalConsoleError(...args);
//   };
// }

// 使用 React.lazy 替代 dynamic
const lazyLoad = (importFunc: () => Promise<any>) => {
  const Component = lazy(importFunc);
  return (props: any) => (
    <Suspense fallback={<div>加载中...</div>}>
      <Component {...props} />
    </Suspense>
  );
};

// 路由组件映射表
const routeComponentMap: Record<string, any> = {
  // 基础路由
  '/home': lazyLoad(() => import('@/pages/Home')),
  '/user/login': lazyLoad(() => import('@/pages/User/Login')),

  // 资源相关路由
  '/resources/resourcesDirectory': lazyLoad(() => import('@/pages/Resources/ResourcesDirectory')),

  // 模型相关路由
  '/modelPage/modelManager': lazyLoad(() => import('@/pages/ModelPage/ModelManager')),
  '/modelPage/modelManager/details': lazyLoad(
    () => import('@/pages/ModelPage/ModelManager/ModelDetails'),
  ),
  '/modelPage/modelRelation': lazyLoad(() => import('@/pages/ModelPage/ModelRelation')),
  '/modelPage/associationType': lazyLoad(() => import('@/pages/ModelPage/AssociationType')),

  // 运行分析相关路由
  '/operationalAnalysis/operationalAudit': lazyLoad(
    () => import('@/pages/OperationalAnalysis/OperationalAudit'),
  ),
  '/operationalAnalysis/resourceAudit': lazyLoad(
    () => import('@/pages/OperationalAnalysis/ResourceTable'),
  ),

  // ACL相关路由
  '/ACL/userGroups': lazyLoad(() => import('@/pages/ACL/UserGroups')),
  '/ACL/userManager': lazyLoad(() => import('@/pages/ACL/UserManager')),

  // 监控相关路由
  '/monitoringItems/MonitoringApprove': lazyLoad(
    () => import('@/pages/MonitoringItems/MonitoringApprove'),
  ),

  // 错误页面
  '/404': lazyLoad(() => import('@/pages/404')),
};

// 根据路径获取组件
const getComponentByPath = (path: string) => {
  return routeComponentMap[path] || routeComponentMap['/404'];
};

const isDev = process.env.NODE_ENV === 'development';
const loginPath = '/user/login';

/**
 * @see  https://umijs.org/zh-CN/plugins/plugin-initial-state
 * */
export async function getInitialState(): Promise<{
  settings?: Partial<LayoutSettings>;
  currentUser?: API.CurrentUser;
  loading?: boolean;
  fetchUserInfo?: () => Promise<API.CurrentUser | undefined>;
  menus?: Menu.MenuItem[];
  fetchMenus?: () => Promise<Menu.MenuItem[]>;
}> {
  const params = new URLSearchParams(window.location.search);
  const token = params.get('token');

  if (token) {
    localStorage.setItem('access_token', token);

    try {
      // 解析 JWT token
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        window
          .atob(base64)
          .split('')
          .map(function (c) {
            return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
          })
          .join(''),
      );

      const payload = JSON.parse(jsonPayload);
      if (payload.name) localStorage.setItem('userName', payload.name);
      if (payload.cname) localStorage.setItem('userCName', payload.cname);
      if (payload.id) localStorage.setItem('userId', payload.id);
    } catch (e) {
      console.error('解析 Token 失败:', e);
    }
  }
  // 初始化时设置loading为true
  let loading = true;

  const fetchUserInfo = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return undefined;
    return {
      name: localStorage.getItem('userCName') || localStorage.getItem('userName') || '',
      userid: localStorage.getItem('userId') || '',
      access: 'admin',
    };
  };

  // 获取菜单数据
  const fetchMenus = async () => {
    try {
      const response = await fetchMenuFromApi();
      // 处理后端返回的新格式
      if (response && response.inside_code === 0 && response.data) {
        // 菜单加载成功后，设置loading为false
        loading = false;
        return response.data;
      }
      // 即使返回空数组，也设置loading为false
      loading = false;
      return [];
    } catch (error) {
      console.error('获取菜单失败:', error);
      // 发生错误时也设置loading为false
      loading = false;
      return [];
    }
  };

  // 如果不是登录页面，执行
  const { location } = history;

  if (location.pathname !== loginPath) {
    const currentUser = await fetchUserInfo();
    let menus: Menu.MenuItem[] = [];

    if (currentUser) {
      menus = await fetchMenus();
      // 这里不需要再设置loading，因为fetchMenus已经处理了
    } else {
      // 如果没有用户信息，也设置loading为false
      loading = false;
    }

    return {
      fetchUserInfo,
      fetchMenus,
      currentUser,
      menus,
      loading, // 返回loading状态
      settings: defaultSettings as Partial<LayoutSettings>,
    };
  }
  return {
    fetchUserInfo,
    fetchMenus,
    menus: [],
    loading: false, // 登录页面不需要loading
    settings: defaultSettings as Partial<LayoutSettings>,
  };
}

// ProLayout 支持的api https://procomponents.ant.design/components/layout
export const layout: RunTimeLayoutConfig = ({ initialState, setInitialState }) => {
  const processMenuData = (menus: MenuDataItem[]): MenuDataItem[] => {
    if (!menus || !Array.isArray(menus)) return [];

    return menus.map((menu) => {
      const processedMenu = { ...menu };

      // 处理图标
      if (processedMenu.icon) {
        const IconComponent = (Icons as any)[processedMenu.icon as string];
        if (IconComponent) {
          processedMenu.icon = <IconComponent />;
        } else {
          // 默认图标
          processedMenu.icon = <Icons.AppstoreOutlined />;
        }
      }

      // 添加组件映射
      if (processedMenu.path && !processedMenu.redirect) {
        processedMenu.component = getComponentByPath(processedMenu.path);
      }

      // 递归处理子菜单,将routes转换为children
      if (processedMenu.routes && Array.isArray(processedMenu.routes)) {
        processedMenu.children = processMenuData(processedMenu.routes);
        delete processedMenu.routes;
      }

      return processedMenu;
    });
  };

  // 添加日志以便调试
  const processedMenus = processMenuData((initialState?.menus as MenuDataItem[]) || []);

  return {
    actionsRender: () => [<NoticeIcon key="noticeIcon" />],
    avatarProps: {
      src: initialState?.currentUser?.avatar,
      title: <AvatarName />,
      render: (
        _: any,
        avatarChildren:
          | string
          | number
          | boolean
          | ReactElement<any, string | JSXElementConstructor<any>>
          | Iterable<ReactNode>
          | ReactPortal
          | null
          | undefined,
      ) => {
        return <AvatarDropdown>{avatarChildren}</AvatarDropdown>;
      },
    },
    menu: {
      // 修改菜单配置，确保登录后能立即显示菜单
      locale: false, // 关闭国际化
      defaultOpenAll: true, // 默认展开所有菜单
      ignoreFlatMenu: true, // 忽略平铺菜单功能
      type: 'group', // 使用分组类型菜单
      params: {
        userId: initialState?.currentUser?.userid,
      },
      request: async () => {
        // 如果菜单为空但用户已登录，尝试重新获取菜单
        if ((!processedMenus || processedMenus.length === 0) && initialState?.currentUser) {
          try {
            const menus = await fetchMenuFromApi();
            if (menus && menus.inside_code === 0 && menus.data) {
              const newMenus = processMenuData(menus.data as MenuDataItem[]);
              setInitialState((s) => ({ ...s, menus: menus.data }));
              return newMenus;
            }
          } catch (error) {
            console.error('重新获取菜单失败:', error);
          }
        }
        return processedMenus;
      },
    },
    loading: false, // 修改这里，不使用initialState中的loading
    logo: require('@/assets/logo.jpg'),
    // waterMarkProps: {
    //   content: initialState?.currentUser?.name,
    // },
    onPageChange: () => {
      const { location } = history;
      // 如果没有登录，重定向到 login
      if (
        (!initialState?.currentUser || !localStorage.getItem('access_token')) &&
        location.pathname !== loginPath
      ) {
        history.push(loginPath);
      }
    },
    menuHeaderRender: undefined,
    // 自定义 403 页面
    // unAccessible: <div>unAccessible</div>,
    // 增加一个 loading 的状态
    childrenRender: (children) => {
      // 使用initialState中的loading状态
      const isLoading = initialState?.loading;

      if (isLoading) {
        return (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              height: '100vh',
              flexDirection: 'column',
            }}
          >
            <Spin size="large" />
            <div style={{ marginTop: 16 }}>正在加载页面</div>
            <div style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
              初次加载数据可能需要几秒钟，请耐心等待
            </div>
          </div>
        );
      }

      return (
        <App>
          <AppWrapper>
            {children}
            {isDev && (
              <SettingDrawer
                disableUrlParams
                enableDarkTheme
                settings={initialState?.settings}
                onSettingChange={(settings) => {
                  setInitialState((preInitialState) => ({
                    ...preInitialState,
                    settings,
                  }));
                }}
              />
            )}
          </AppWrapper>
        </App>
      );
    },
    ...initialState?.settings,
  };
};

// 导出请求配置
export const request = requestConfig;
