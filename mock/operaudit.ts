import { Request, Response } from 'express';
import { parse } from 'url';
import { mock, Random } from 'mockjs';

// 生成随机的操作审计数据
const generateAuditData = (count: number, category: string) => {
  const data = [];
  const actions = {
    resource: ['创建', '修改', '删除', '查询'],
    model: ['创建', '修改', '删除', '关联'],
    user: ['登录', '登出', '修改密码', '创建用户', '删除用户'],
  };

  const objects = {
    model: [
      'model',
      'model_group',
      'attribute',
      'attribute_group',
      'model_relationship',
      'model_rule',
    ],
    resource: ['服务器', '网络设备', '应用', '数据库', '存储'],
    user: ['用户', '角色', '权限'],
  };

  for (let i = 0; i < count; i++) {
    const action =
      actions[category as keyof typeof actions][
        Math.floor(Math.random() * actions[category as keyof typeof actions].length)
      ];
    const object =
      objects[category as keyof typeof objects][
        Math.floor(Math.random() * objects[category as keyof typeof objects].length)
      ];

    const item: any = {
      action,
      instance: `${object}-${Random.id()}`,
      operation_desc: `${action}了${object}`,
      operation_time: Random.datetime('yyyy-MM-dd HH:mm:ss'),
      operation_user: Random.name(),
    };

    // 根据不同类别添加特定字段
    if (category === 'resource') {
      item.model_name = object;
    } else if (category === 'model') {
      item.operate_object = objects.model[Math.floor(Math.random() * objects.model.length)];
    }

    data.push(item);
  }

  return data;
};

export default {
  // 操作审计 API
  'POST /api/audit/operation_audit/:category': (req: Request, res: Response) => {
    const { category } = req.params;
    const { start_time, end_time, user_id, operate_object, instance, model_id } = req.body;

    // 验证必需参数
    if (!start_time || !end_time) {
      return res.status(400).json({
        code: 400,
        inside_code: 400,
        msg: '开始时间和结束时间是必需的',
        data: [],
      });
    }

    // 根据不同类别生成不同的数据
    let count = Math.floor(Math.random() * 20) + 10; // 随机生成10-30条数据
    const data = generateAuditData(count, category);

    // 模拟根据查询条件过滤数据
    let filteredData = [...data];

    // 按时间过滤
    filteredData = filteredData.filter((item) => {
      const itemTime = new Date(item.operation_time).getTime();
      const startTimeMs = new Date(start_time).getTime();
      const endTimeMs = new Date(end_time).getTime();
      return itemTime >= startTimeMs && itemTime <= endTimeMs;
    });

    // 按用户ID过滤（模拟）
    if (user_id && user_id.length > 0) {
      // 这里只是模拟，实际上mock数据没有真实的用户ID关联
      filteredData = filteredData.slice(0, Math.max(5, filteredData.length - user_id.length * 2));
    }

    // 按操作对象过滤（仅模型类别）
    if (category === 'model' && operate_object) {
      filteredData = filteredData.filter((item) => item.operate_object === operate_object);
    }

    // 按实例名称过滤
    if (instance) {
      filteredData = filteredData.filter((item) => item.instance.includes(instance));
    }

    // 按模型ID过滤（仅资源类别）
    if (category === 'resource' && model_id && model_id.length > 0) {
      // 这里只是模拟，实际上mock数据没有真实的模型ID关联
      filteredData = filteredData.slice(0, Math.max(3, filteredData.length - model_id.length));
    }

    // 返回成功响应
    return res.json({
      code: 0,
      inside_code: 0,
      msg: '获取操作审计日志成功',
      data: filteredData,
    });
  },
};
