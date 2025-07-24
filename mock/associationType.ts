import { Request, Response } from 'express';

// 模拟请求延迟
const waitTime = (time: number = 200) => new Promise((resolve) => setTimeout(resolve, time));

// 模拟关联类型数据
let associationTypes = [
  {
    asst_id: 1,
    asst_key: 'run_on',
    asst_name: '运行',
    src_des: '运行在',
    dest_des: '运行',
    direction: 'src_to_dest',
    count: 10,
    create_time: '2023-05-10 14:30:00',
    update_time: '2023-05-15 09:45:00',
  },
  {
    asst_id: 2,
    asst_key: 'deploy_on',
    asst_name: '部署',
    src_des: '部署在',
    dest_des: '部署',
    direction: 'src_to_dest',
    count: 5,
    create_time: '2023-05-11 10:20:00',
    update_time: '2023-05-16 11:30:00',
  },
  {
    asst_id: 3,
    asst_key: 'mount_on',
    asst_name: '挂载',
    src_des: '挂载到',
    dest_des: '被挂载',
    direction: 'src_to_dest',
    count: 8,
    create_time: '2023-05-12 09:15:00',
    update_time: '2023-05-17 14:25:00',
  },
  {
    asst_id: 4,
    asst_key: 'connect_to',
    asst_name: '连接',
    src_des: '连接到',
    dest_des: '被连接',
    direction: 'bidirectional',
    count: 12,
    create_time: '2023-05-13 16:40:00',
    update_time: '2023-05-18 10:50:00',
  },
  {
    asst_id: 5,
    asst_key: 'depend_on',
    asst_name: '依赖',
    src_des: '依赖于',
    dest_des: '被依赖',
    direction: 'src_to_dest',
    count: 7,
    create_time: '2023-05-14 11:35:00',
    update_time: '2023-05-19 15:40:00',
  },
];

// 生成标准响应
const generateResponse = (code = 0, msg = 'success', data = {}) => {
  return {
    code,
    inside_code: code,
    msg,
    data,
  };
};

export default {
  // 获取关联类型列表
  'GET /api/association_type': async (req: Request, res: Response) => {
    const { limit = 10, sort } = req.query;

    // 模拟网络延迟
    await waitTime(500);

    let result = [...associationTypes];

    // 处理排序
    if (sort) {
      const sortField = sort.toString().replace(/^-/, '');
      const sortOrder = sort.toString().startsWith('-') ? -1 : 1;

      result.sort((a: any, b: any) => {
        if (a[sortField] < b[sortField]) return -1 * sortOrder;
        if (a[sortField] > b[sortField]) return 1 * sortOrder;
        return 0;
      });
    }

    // 处理分页
    if (limit) {
      result = result.slice(0, parseInt(limit.toString(), 10));
    }

    res.json(
      generateResponse(0, '获取关联类型列表成功', {
        pagination: {
          current: 1,
          page_size: 10,
          total: result.length,
        },
        data: result,
      }),
    );
  },

  // 创建关联类型
  'POST /api/association_type': async (req: Request, res: Response) => {
    const { asst_key, asst_name, src_des, dest_des, direction } = req.body;

    // 模拟网络延迟
    await waitTime(800);

    // 验证必填字段
    if (!asst_key || !asst_name || !src_des || !dest_des || !direction) {
      return res.status(400).json(generateResponse(400, '缺少必要参数', {}));
    }

    // 检查 asst_key 是否已存在
    const exists = associationTypes.some((item) => item.asst_key === asst_key);
    if (exists) {
      return res.status(400).json(generateResponse(400, '关联类型标识已存在', {}));
    }

    // 创建新关联类型
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const newAssociationType = {
      asst_id:
        associationTypes.length > 0
          ? Math.max(...associationTypes.map((item) => item.asst_id)) + 1
          : 1,
      asst_key,
      asst_name,
      src_des,
      dest_des,
      direction,
      count: 0,
      create_time: now,
      update_time: now,
    };

    associationTypes.push(newAssociationType);

    res.status(201).json(generateResponse(0, '创建关联类型成功', newAssociationType));
  },

  // 删除关联类型
  'DELETE /api/association_type/:asst_id': async (req: Request, res: Response) => {
    const { asst_id } = req.params;

    // 模拟网络延迟
    await waitTime(600);

    const id = parseInt(asst_id, 10);
    const index = associationTypes.findIndex((item) => item.asst_id === id);

    if (index === -1) {
      return res.status(404).json(generateResponse(404, '关联类型不存在', {}));
    }

    // 删除关联类型
    associationTypes.splice(index, 1);

    res.json(generateResponse(0, '删除关联类型成功', {}));
  },

  // 更新关联类型
  'PATCH /api/association_type/:asst_id': async (req: Request, res: Response) => {
    const { asst_id } = req.params;
    const { asst_name, src_des, dest_des, direction } = req.body;

    // 模拟网络延迟
    await waitTime(700);

    const id = parseInt(asst_id, 10);
    const index = associationTypes.findIndex((item) => item.asst_id === id);

    if (index === -1) {
      return res.status(404).json(generateResponse(404, '关联类型不存在', {}));
    }

    // 更新关联类型
    const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const updatedAssociationType = {
      ...associationTypes[index],
      ...(asst_name && { asst_name }),
      ...(src_des && { src_des }),
      ...(dest_des && { dest_des }),
      ...(direction && { direction }),
      update_time: now,
    };

    associationTypes[index] = updatedAssociationType;

    res.json(generateResponse(0, '更新关联类型成功', updatedAssociationType));
  },
};
