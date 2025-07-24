import { Request, Response } from 'express';

const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

export default {
  'GET /api/v1/home/menu': async (req: Request, res: Response) => {
    await waitTime(200);
    res.send({
      code: 0,
      inside_code: 0,
      msg: '获取菜单成功',
      data: [
        {
          path: '/user',
          layout: false,
          routes: [{ name: '登录', path: '/user/login' }],
        },
        {
          path: '/home',
          name: '首页',
          icon: 'HomeOutlined',
        },
        {
          name: '资源',
          path: '/resources',
          icon: 'AppstoreOutlined',
          routes: [
            { path: '/resources', redirect: '/resources/resourcesDirectory' },
            { path: '/resources/resourcesDirectory', name: '资源目录', icon: 'FolderOutlined' },
          ],
        },
        {
          name: '模型',
          path: '/modelPage',
          icon: 'ClusterOutlined',
          routes: [
            { path: '/modelPage', redirect: '/modelPage/modelManager' },
            {
              path: '/modelPage/modelManager',
              name: '模型管理',
              icon: 'PartitionOutlined',
            },
            {
              path: '/modelPage/modelManager/details',
              name: '模型详情',
              hideInMenu: true,
              icon: 'NodeIndexOutlined',
            },
            { path: '/modelPage/modelRelation', name: '模型关系', icon: 'NodeIndexOutlined' },
            { path: '/modelPage/associationType', name: '关联类型', icon: 'ShareAltOutlined' },
          ],
        },
        {
          name: '运行分析',
          path: '/operationalAnalysis',
          icon: 'LineChartOutlined',
          routes: [
            { path: '/operationalAnalysis', redirect: '/operationalAnalysis/operationalAudit' },
            {
              path: '/operationalAnalysis/operationalAudit',
              name: '操作审计',
              icon: 'SnippetsOutlined',
            },
            { path: '/operationalAnalysis/resourceAudit', name: '资源审计', icon: 'AuditOutlined' },
          ],
        },
        {
          name: 'ACL',
          path: '/ACL',
          icon: 'SafetyCertificateOutlined',
          routes: [
            { path: '/ACL', redirect: '/ACL/userGroups' },
            { path: '/ACL/userGroups', name: '用户组', icon: 'UsergroupAddOutlined' },
            { path: '/ACL/userManager', name: '用户管理', icon: 'UserOutlined' },
          ],
        },
        {
          name: '监控项',
          path: '/monitoringItems',
          icon: 'NotificationOutlined',
          routes: [
            { path: '/monitoringItems', redirect: '/monitoringItems/monitoringApprove' },
            {
              path: '/monitoringItems/monitoringApprove',
              name: '监控项审批',
              icon: 'LineChartOutlined',
            },
          ],
        },
        { path: '/', redirect: '/home' },
        { path: '*', layout: false },
      ],
    });
  },
};
