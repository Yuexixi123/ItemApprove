import { Request, Response } from 'express';

// 模拟请求延迟
const waitTime = (time: number = 100) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, time);
  });
};

// 生成响应数据的辅助函数
const generateResponse = (code = 0, msg = 'success', data = {}) => {
  return {
    code,
    inside_code: code,
    msg,
    data,
  };
};

// 模拟属性分组数据
const attributeGroupsData: Record<string, any[]> = {
  '101': [
    {
      attrgroup_id: 1,
      attrgroup_name: '基本信息',
      model_id: 101,
      description: '服务器基本信息',
      create_time: '2023-05-10 10:00:00',
      update_time: '2023-05-10 10:00:00',
    },
    {
      attrgroup_id: 2,
      attrgroup_name: '系统信息',
      model_id: 101,
      description: '服务器系统信息',
      create_time: '2023-05-10 10:00:00',
      update_time: '2023-05-10 10:00:00',
    },
    {
      attrgroup_id: 3,
      attrgroup_name: '高级配置',
      model_id: 101,
      description: '服务器高级配置信息',
      create_time: '2023-05-10 10:00:00',
      update_time: '2023-05-10 10:00:00',
    },
    {
      attrgroup_id: 4,
      attrgroup_name: '用户配置',
      model_id: 101,
      description: '服务器用户配置信息',
      create_time: '2023-05-10 10:00:00',
      update_time: '2023-05-10 10:00:00',
    },
    {
      attrgroup_id: 5,
      attrgroup_name: '资源配置',
      model_id: 101,
      description: '服务器资源配置信息',
      create_time: '2023-05-10 10:00:00',
      update_time: '2023-05-10 10:00:00',
    },
  ],
};

// 用于生成自增ID的计数器
let attrgroupIdCounter = 100;

export default {
  // 创建属性分组
  'POST /api/model/attribute/group/:model_id': async (req: Request, res: Response) => {
    await waitTime(1000);
    const { model_id } = req.params;
    const groupData = req.body;

    // 验证必要参数
    if (!groupData.attrgroup_name) {
      return res.status(400).send(generateResponse(400, '缺少必要参数: attrgroup_name'));
    }

    // 检查模型是否存在
    if (!attributeGroupsData[model_id]) {
      attributeGroupsData[model_id] = [];
    }

    // 生成新的属性组ID
    const newGroupId = ++attrgroupIdCounter;

    // 创建新属性组
    const newGroup = {
      attrgroup_id: newGroupId,
      attrgroup_name: groupData.attrgroup_name,
      model_id: parseInt(model_id),
      description: groupData.description || '',
      create_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
      update_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };

    // 添加到属性组数据
    attributeGroupsData[model_id].push(newGroup);

    // 返回成功响应
    res.send(generateResponse(0, '创建属性分组成功', newGroup));
  },

  // 删除属性分组
  'DELETE /api/model/attribute/group/:attrgroup_id': async (req: Request, res: Response) => {
    await waitTime(1000);
    const { attrgroup_id } = req.params;

    // 查找并删除属性组
    let found = false;

    for (const modelId in attributeGroupsData) {
      const groupIndex = attributeGroupsData[modelId].findIndex(
        (group) => group.attrgroup_id.toString() === attrgroup_id,
      );

      if (groupIndex !== -1) {
        // 删除属性组
        const deletedGroup = attributeGroupsData[modelId].splice(groupIndex, 1)[0];
        found = true;

        // 返回成功响应
        return res.send(generateResponse(0, '删除属性分组成功', deletedGroup));
      }
    }

    if (!found) {
      return res.status(404).send(generateResponse(404, '未找到指定的属性分组'));
    }
  },

  // 更新属性分组
  'PATCH /api/model/attribute/group/:attrgroup_id': async (req: Request, res: Response) => {
    await waitTime(1000);
    const { attrgroup_id } = req.params;
    const updateData = req.body;

    // 查找并更新属性组
    let found = false;

    for (const modelId in attributeGroupsData) {
      const groupIndex = attributeGroupsData[modelId].findIndex(
        (group) => group.attrgroup_id.toString() === attrgroup_id,
      );

      if (groupIndex !== -1) {
        // 更新属性组
        const updatedGroup = {
          ...attributeGroupsData[modelId][groupIndex],
          ...updateData,
          attrgroup_id: parseInt(attrgroup_id), // 保持ID不变
          update_time: new Date().toISOString().replace('T', ' ').substring(0, 19),
        };

        attributeGroupsData[modelId][groupIndex] = updatedGroup;
        found = true;

        // 返回成功响应
        return res.send(generateResponse(0, '更新属性分组成功', updatedGroup));
      }
    }

    if (!found) {
      return res.status(404).send(generateResponse(404, '未找到指定的属性分组'));
    }
  },
};
