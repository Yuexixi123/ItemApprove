import { Request, Response } from 'express';

// 模拟请求延迟
const waitTime = (time: number = 1000) => new Promise((resolve) => setTimeout(resolve, time));

// 模拟关联类型数据
const associationTypes = [
  { id: 1, name: '运行', description: '应用运行在主机上' },
  { id: 2, name: '部署', description: '应用部署在主机上' },
  { id: 3, name: '挂载', description: '存储挂载到主机上' },
  { id: 4, name: '连接', description: '网络设备之间的连接' },
  { id: 5, name: '依赖', description: '应用之间的依赖关系' },
];

// 模拟模型关系数据
const modelRelationships = {
  // 主机模型(ID: 101)的关系
  101: [
    {
      rel_id: 1,
      src_model_id: 101, // 主机
      src_model_name: '主机',
      dest_model_id: 201, // 应用
      dest_model_name: '应用',
      asst_type_id: 1,
      asst_type_name: '运行',
      constraint: 'N-N', // 多对多关系
      rel_desc: '主机可以运行多个应用，应用可以运行在多台主机上',
      create_time: '2023-05-10 14:30:00',
      update_time: '2023-05-15 09:45:00',
    },
    {
      rel_id: 2,
      src_model_id: 101, // 主机
      src_model_name: '主机',
      dest_model_id: 501, // 存储
      dest_model_name: '存储',
      asst_type_id: 3,
      asst_type_name: '挂载',
      constraint: 'N-N', // 多对多关系
      rel_desc: '主机可以挂载多个存储，存储可以被多台主机挂载',
      create_time: '2023-05-12 11:20:00',
      update_time: '2023-05-16 10:30:00',
    },
  ],
  // 应用模型(ID: 201)的关系
  201: [
    {
      rel_id: 1, // 与主机的关系（与上面相同）
      src_model_id: 101,
      src_model_name: '主机',
      dest_model_id: 201,
      dest_model_name: '应用',
      asst_type_id: 1,
      asst_type_name: '运行',
      constraint: 'N-N',
      rel_desc: '主机可以运行多个应用，应用可以运行在多台主机上',
      create_time: '2023-05-10 14:30:00',
      update_time: '2023-05-15 09:45:00',
    },
    {
      rel_id: 3,
      src_model_id: 201, // 应用
      src_model_name: '应用',
      dest_model_id: 201, // 应用（自关联）
      dest_model_name: '应用',
      asst_type_id: 5,
      asst_type_name: '依赖',
      constraint: 'N-N',
      rel_desc: '应用之间可以相互依赖',
      create_time: '2023-05-14 16:45:00',
      update_time: '2023-05-18 13:20:00',
    },
  ],
  // 默认空关系（当请求的模型ID不存在时返回）
  default: [],
};

export default {
  // 获取模型关联关系
  'GET /api/model/relationship/:model_id': async (req: Request, res: Response) => {
    const { model_id } = req.params;

    // 模拟网络延迟
    await waitTime(500);

    // 获取指定模型的关系数据，如果不存在则返回空数组
    const relationships =
      modelRelationships[model_id as keyof typeof modelRelationships] || modelRelationships.default;

    res.send({
      code: 0,
      inside_code: 0,
      msg: '获取模型关联关系成功',
      data: {
        data: relationships,
        pagination: {
          current: 1,
          pageSize: 10,
          total: relationships.length,
        },
      },
    });
  },

  // 新增模型关联关系
  'POST /api/model/relationship/:model_id': async (req: Request, res: Response) => {
    await waitTime(500);

    res.send({
      code: 0,
      inside_code: 0,
      msg: '创建模型关联关系成功',
      data: {
        id: Math.floor(Math.random() * 1000) + 10, // 生成随机ID
      },
    });
  },

  // 删除模型关联关系
  'DELETE /api/model/relationship/:rel_id': async (req: Request, res: Response) => {
    await waitTime(500);

    res.send({
      code: 0,
      inside_code: 0,
      msg: '删除模型关联关系成功',
    });
  },

  // 修改模型关联关系
  'PATCH /api/model/relationship/:rel_id': async (req: Request, res: Response) => {
    await waitTime(500);

    res.send({
      code: 0,
      inside_code: 0,
      msg: '修改模型关联关系成功',
    });
  },
};
