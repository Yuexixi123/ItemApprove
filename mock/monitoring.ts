import { Request, Response } from 'express';

// 模拟监控项相关资源数据
const mockMonitoringData: Record<string, any> = {
  // 系统56的监控项资源数据
  '56': {
    zabbix_item: [
      {
        id: 1001,
        name: 'CPU使用率',
        key: 'system.cpu.util',
        type: 'Zabbix agent',
        interval: '1m',
        history: '90d',
        trends: '365d',
        status: 'Enabled',
        description: '监控CPU使用率',
        trigger_resource_datas: [
          {
            id: 2001,
            name: 'CPU使用率过高',
            expression: '{host:system.cpu.util.last()}>80',
            priority: 'High',
            status: 'Enabled',
            description: 'CPU使用率超过80%时触发告警',
          },
          {
            id: 2002,
            name: 'CPU使用率严重过高',
            expression: '{host:system.cpu.util.last()}>95',
            priority: 'Disaster',
            status: 'Enabled',
            description: 'CPU使用率超过95%时触发严重告警',
          },
        ],
      },
      {
        id: 1002,
        name: '内存使用率',
        key: 'vm.memory.util',
        type: 'Zabbix agent',
        interval: '1m',
        history: '90d',
        trends: '365d',
        status: 'Enabled',
        description: '监控内存使用率',
        trigger_resource_datas: [
          {
            id: 2003,
            name: '内存使用率过高',
            expression: '{host:vm.memory.util.last()}>85',
            priority: 'High',
            status: 'Enabled',
            description: '内存使用率超过85%时触发告警',
          },
        ],
      },
      {
        id: 1003,
        name: '磁盘使用率',
        key: 'vfs.fs.size[/,pused]',
        type: 'Zabbix agent',
        interval: '5m',
        history: '90d',
        trends: '365d',
        status: 'Enabled',
        description: '监控根分区磁盘使用率',
        trigger_resource_datas: [
          {
            id: 2004,
            name: '磁盘使用率过高',
            expression: '{host:vfs.fs.size[/,pused].last()}>90',
            priority: 'Warning',
            status: 'Enabled',
            description: '磁盘使用率超过90%时触发告警',
          },
        ],
      },
    ],
    zabbix_trigger: [
      {
        id: 2001,
        name: 'CPU使用率过高',
        expression: '{host:system.cpu.util.last()}>80',
        priority: 'High',
        status: 'Enabled',
        description: 'CPU使用率超过80%时触发告警',
      },
      {
        id: 2002,
        name: 'CPU使用率严重过高',
        expression: '{host:system.cpu.util.last()}>95',
        priority: 'Disaster',
        status: 'Enabled',
        description: 'CPU使用率超过95%时触发严重告警',
      },
      {
        id: 2003,
        name: '内存使用率过高',
        expression: '{host:vm.memory.util.last()}>85',
        priority: 'High',
        status: 'Enabled',
        description: '内存使用率超过85%时触发告警',
      },
      {
        id: 2004,
        name: '磁盘使用率过高',
        expression: '{host:vfs.fs.size[/,pused].last()}>90',
        priority: 'Warning',
        status: 'Enabled',
        description: '磁盘使用率超过90%时触发告警',
      },
    ],
  },
  // 系统363的监控项资源数据
  '363': {
    zabbix_item: [
      {
        id: 1004,
        name: '服务状态检查',
        key: 'proc.num[java]',
        type: 'Zabbix agent',
        interval: '30s',
        history: '90d',
        trends: '365d',
        status: 'Enabled',
        description: '监控Java进程数量',
        trigger_resource_datas: [
          {
            id: 2005,
            name: 'Java服务异常',
            expression: '{host:proc.num[java].last()}=0',
            priority: 'High',
            status: 'Enabled',
            description: 'Java服务进程不存在时触发告警',
          },
        ],
      },
      {
        id: 1005,
        name: '网络连接数',
        key: 'net.tcp.listen[8080]',
        type: 'Zabbix agent',
        interval: '1m',
        history: '90d',
        trends: '365d',
        status: 'Enabled',
        description: '监控8080端口监听状态',
        trigger_resource_datas: [
          {
            id: 2006,
            name: '端口监听异常',
            expression: '{host:net.tcp.listen[8080].last()}=0',
            priority: 'High',
            status: 'Enabled',
            description: '8080端口未监听时触发告警',
          },
        ],
      },
    ],
    zabbix_trigger: [
      {
        id: 2005,
        name: 'Java服务异常',
        expression: '{host:proc.num[java].last()}=0',
        priority: 'High',
        status: 'Enabled',
        description: 'Java服务进程不存在时触发告警',
      },
      {
        id: 2006,
        name: '端口监听异常',
        expression: '{host:net.tcp.listen[8080].last()}=0',
        priority: 'High',
        status: 'Enabled',
        description: '8080端口未监听时触发告警',
      },
    ],
  },
};

// 监控项模型名称数据
const mockModelNames = [
  {
    model_id: 101,
    model_name: 'zabbix_item',
    model_key: 'zabbix_item',
    display_name: 'Zabbix监控项',
  },
  {
    model_id: 102,
    model_name: 'zabbix_trigger',
    model_key: 'zabbix_trigger',
    display_name: 'Zabbix触发器',
  },
];

export default {
  // 获取监控项模型名称
  'GET /audit/zabbix_approval/item_model_name': (req: Request, res: Response) => {
    setTimeout(() => {
      res.json({
        code: 0,
        inside_code: 0,
        msg: '获取监控项模型名称成功',
        data: mockModelNames,
      });
    }, 200);
  },

  // 获取监控项相关资源
  'GET /audit/zabbix_approval/relate_resource': (req: Request, res: Response) => {
    const {
      sys_resource_id,
      host_resource_id,
      model_key,
      sys_rel,
      host_rel,
      item_rel,
      approval_id,
    } = req.query;

    console.log('Mock API - 获取监控项相关资源:', {
      sys_resource_id,
      host_resource_id,
      model_key,
      sys_rel,
      host_rel,
      item_rel,
      approval_id,
    });

    setTimeout(() => {
      // 根据系统ID获取对应的监控数据
      const systemData = mockMonitoringData[sys_resource_id as string];

      if (!systemData) {
        res.json({
          code: 0,
          inside_code: 0,
          msg: '获取监控项相关资源成功',
          data: [],
        });
        return;
      }

      // 根据model_key获取对应类型的数据
      const resourceData = systemData[model_key as string] || [];

      res.json({
        code: 0,
        inside_code: 0,
        msg: '获取监控项相关资源成功',
        data: resourceData,
      });
    }, 300);
  },

  // 获取监控项审批列表
  'GET /audit/zabbix_approval/item_approval': (req: Request, res: Response) => {
    const { current = 1, pageSize = 10 } = req.query;

    const mockApprovalList = [
      {
        id: 1,
        system_name: 'ATMP系统/天燃气充值系统',
        system_id: 56,
        model_id: [101, 102],
        approval_status: 1,
        is_approval: true,
        create_time: '2024-01-15 10:30:00',
        create_name: '张三',
        resources: [
          {
            model_id: 101,
            model_name: 'zabbix_item',
            resource: mockMonitoringData['56']['zabbix_item'] || [],
          },
          {
            model_id: 102,
            model_name: 'zabbix_trigger',
            resource: mockMonitoringData['56']['zabbix_trigger'] || [],
          },
        ],
      },
      {
        id: 2,
        system_name: 'ATM密码锁系统',
        system_id: 363,
        model_id: [101, 102],
        approval_status: 2,
        is_approval: false,
        create_time: '2024-01-14 14:20:00',
        create_name: '李四',
        resources: [
          {
            model_id: 101,
            model_name: 'zabbix_item',
            resource: mockMonitoringData['363']['zabbix_item'] || [],
          },
          {
            model_id: 102,
            model_name: 'zabbix_trigger',
            resource: mockMonitoringData['363']['zabbix_trigger'] || [],
          },
        ],
      },
    ];

    setTimeout(() => {
      const start = (Number(current) - 1) * Number(pageSize);
      const end = start + Number(pageSize);
      const data = mockApprovalList.slice(start, end);

      res.json({
        code: 0,
        inside_code: 0,
        msg: '获取监控项审批列表成功',
        data: {
          list: data,
          total: mockApprovalList.length,
          current: Number(current),
          pageSize: Number(pageSize),
        },
      });
    }, 200);
  },

  // 创建监控项审批
  'POST /audit/zabbix_approval/item_approval': (req: Request, res: Response) => {
    console.log('Mock API - 创建监控项审批:', req.body);

    setTimeout(() => {
      res.json({
        code: 0,
        inside_code: 0,
        msg: '创建监控项审批成功',
        data: {
          id: Date.now(),
          ...req.body,
        },
      });
    }, 500);
  },

  // 更新监控项审批
  'PATCH /audit/zabbix_approval/item_approval/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    console.log('Mock API - 更新监控项审批:', { id, body: req.body });

    setTimeout(() => {
      res.json({
        code: 0,
        inside_code: 0,
        msg: '更新监控项审批成功',
        data: {
          id: Number(id),
          ...req.body,
        },
      });
    }, 500);
  },

  // 获取监控项审批详情
  'GET /audit/zabbix_approval/item_approval/:id': (req: Request, res: Response) => {
    const { id } = req.params;
    console.log('Mock API - 获取监控项审批详情:', { id });

    // 模拟审批详情数据
    const mockApprovalDetail = {
      system_id: 1,
      model_id: [11],
      resources: {
        '11': [
          {
            create_name: 5690,
            host_resource_id: 4,
            instance_name: 'memory-154',
            trigger_resource_datas: [
              {
                create_name: 5690,
                create_time: '2025-09-05 11:35:18',
                instance_name: 'trigger-1',
                model_id: 13,
                update_name: null,
                update_time: null,
              },
              {
                create_name: 5690,
                create_time: '2025-09-05 11:35:26',
                instance_name: 'trigger-2',
                model_id: 13,
                update_name: null,
                update_time: null,
              },
              {
                create_name: 5690,
                create_time: '2025-09-05 11:35:35',
                instance_name: 'trigger-3',
                model_id: 13,
                update_name: null,
                update_time: null,
              },
            ],
            item_resource_action: 'update',
          },
          {
            item_resource_action: 'create',
            host_resource_id: 4,
            instance_name: 'iuytr567757',
          },
        ],
      },
      approval_status: 1,
    };

    setTimeout(() => {
      res.json({
        code: 0,
        inside_code: 0,
        msg: '获取监控项审批详情成功',
        data: mockApprovalDetail,
      });
    }, 300);
  },
};
