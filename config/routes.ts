export default [
  {
    path: '/user',
    layout: false,
    routes: [{ name: '登录', path: '/user/login', component: './User/Login' }],
  },
  { path: '/', redirect: '/Home' },
  {
    path: '/home',
    name: '首页',
    component: './Home',
  },
  {
    name: '资源',
    path: '/resources',
    routes: [
      { path: '/resources', redirect: '/resources/resourcesDirectory' },
      {
        path: '/resources/resourcesDirectory',
        name: '资源目录',
        component: './Resources/ResourcesDirectory',
      },
      { path: '/resources/dynamic/:id', name: '动态资源', component: './Resources/AllModel' },
      { path: '/resources/dynamic/:id/details', name: '', component: './Resources/Details' },
    ],
  },
  {
    name: '模型',
    path: '/modelPage',
    routes: [
      { path: '/modelPage', redirect: '/modelPage/modelManager' },
      {
        path: '/modelPage/modelManager',
        name: '模型管理',
        icon: 'PartitionOutlined',
        component: './ModelPage/ModelManager',
      },
      {
        path: '/modelPage/modelManager/details/:id',
        name: '模型详情',
        hideInMenu: true,
        icon: 'NodeIndexOutlined',
        component: './ModelPage/ModelManager/ModelDetails',
      },
      {
        path: '/modelPage/modelRelation',
        name: '模型关系',
        icon: 'NodeIndexOutlined',
        component: './ModelPage/ModelRelation',
      },
      {
        path: '/modelPage/associationType',
        name: '模型实例',
        icon: 'ShareAltOutlined',
        component: './ModelPage/AssociationType',
      },
    ],
  },
  {
    name: '运行分析',
    path: '/operationalAnalysis',
    routes: [
      { path: '/operationalAnalysis', redirect: '/operationalAnalysis/operationalAudit' },
      {
        path: '/operationalAnalysis/operationalAudit',
        name: '操作审计',
        icon: 'SnippetsOutlined',
        component: './OperationalAnalysis/OperationalAudit',
      },
    ],
  },
  {
    name: 'ACL',
    path: '/ACL',
    routes: [
      { path: '/ACL', redirect: '/ACL/userGroups' },
      {
        path: '/ACL/userGroups',
        name: '用户组',
        icon: 'UsergroupAddOutlined',
        component: './ACL/UserGroups',
      },
      {
        path: '/ACL/userManager',
        name: '用户管理',
        icon: 'UserOutlined',
        component: './ACL/UserManager',
      },
    ],
  },
  {
    name: '监控项',
    path: '/monitoringItems',
    routes: [
      { path: '/monitoringItems', redirect: '/monitoringItems/monitoringApprove' },
      {
        path: '/monitoringItems/monitoringApprove',
        name: '监控项审批',
        icon: 'LineChartOutlined',
        component: './MonitoringItems/MonitoringApprove',
      },
    ],
  },
  { path: '*', layout: false, component: './404' },
];
