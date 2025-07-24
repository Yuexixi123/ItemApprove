import { Request, Response } from 'express';

// 模拟请求延迟
const waitTime = (time: number = 200) => new Promise((resolve) => setTimeout(resolve, time));

// 模拟唯一校验规则数据
const uniqueRules: Record<number, API.UniqueRuleItem[]> = {
  // 模型ID 101 (主机模型) 的唯一校验规则
  101: [
    {
      rule_id: 1001,
      rule: 'IP地址唯一',
      attrs: [{ attr_id: 2001, attr_name: 'IP地址' }],
    },
    {
      rule_id: 1002,
      rule: '主机名+IP地址唯一',
      attrs: [
        { attr_id: 2002, attr_name: '主机名' },
        { attr_id: 2001, attr_name: 'IP地址' },
      ],
    },
  ],
  // 模型ID 201 (应用模型) 的唯一校验规则
  201: [
    {
      rule_id: 2001,
      rule: '应用名称唯一',
      attrs: [{ attr_id: 3001, attr_name: '应用名称' }],
    },
    {
      rule_id: 2002,
      rule: '应用名称+版本号唯一',
      attrs: [
        { attr_id: 3001, attr_name: '应用名称' },
        { attr_id: 3002, attr_name: '版本号' },
      ],
    },
  ],
};

// 生成分页数据
const getPaginatedData = (
  data: API.UniqueRuleItem[],
  current: number = 1,
  pageSize: number = 10,
) => {
  const startIndex = (current - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedData = data.slice(startIndex, endIndex);

  return {
    pagination: {
      current,
      pageSize,
      total: data.length,
    },
    data: paginatedData,
  };
};

export default {
  // 获取唯一校验规则列表
  'GET /api/model/rule/:model_id': async (req: Request, res: Response) => {
    const { model_id } = req.params;
    const { current = 1, pageSize = 10 } = req.query;

    await waitTime(500);

    const modelId = parseInt(model_id as string, 10);
    const rules = uniqueRules[modelId] || [];

    res.send({
      code: 0,
      inside_code: 0,
      msg: '获取唯一校验规则成功',
      data: getPaginatedData(rules, Number(current), Number(pageSize)),
    });
  },

  // 创建唯一校验规则
  'POST /api/model/rule/:model_id': async (req: Request, res: Response) => {
    const { model_id } = req.params;
    const body = req.body as API.CreateUniqueRuleRequest;

    await waitTime(800);

    const modelId = parseInt(model_id as string, 10);

    if (!uniqueRules[modelId]) {
      uniqueRules[modelId] = [];
    }

    // 生成新规则ID
    const newRuleId =
      Math.max(
        ...Object.values(uniqueRules)
          .flat()
          .map((rule) => rule.rule_id),
        1000,
      ) + 1;

    // 生成规则名称
    const ruleName = body?.attrs?.map((attr) => attr.attr_name).join('+') + '唯一';

    // 创建新规则
    const newRule: API.UniqueRuleItem = {
      rule_id: newRuleId,
      rule: ruleName,
      attrs: body.attrs,
    };

    uniqueRules[modelId].push(newRule);

    res.send({
      code: 0,
      inside_code: 0,
      msg: '创建唯一校验规则成功',
      data: {},
    });
  },

  // 删除唯一校验规则
  'DELETE /api/model/rule/:rule_id': async (req: Request, res: Response) => {
    const { rule_id } = req.params;

    await waitTime(600);

    const ruleId = parseInt(rule_id as string, 10);

    // 在所有模型中查找并删除规则
    for (const modelId in uniqueRules) {
      uniqueRules[modelId] = uniqueRules[modelId].filter((rule) => rule.rule_id !== ruleId);
    }

    res.send({
      code: 0,
      inside_code: 0,
      msg: '删除唯一校验规则成功',
      data: {},
    });
  },

  // 更新唯一校验规则
  'PATCH /api/model/rule/:rule_id': async (req: Request, res: Response) => {
    const { rule_id } = req.params;
    const body = req.body as API.UpdateUniqueRuleRequest;

    await waitTime(700);

    const ruleId = parseInt(rule_id as string, 10);

    // 在所有模型中查找并更新规则
    let updatedRule: API.UniqueRuleItem | null = null;

    for (const modelId in uniqueRules) {
      const ruleIndex = uniqueRules[modelId].findIndex((rule) => rule.rule_id === ruleId);

      if (ruleIndex !== -1) {
        // 如果提供了新的属性ID列表
        if (body.attr_ids) {
          // 假设我们有一个函数可以根据ID获取属性名称
          // 这里简化处理，实际应用中可能需要从属性服务获取
          const attrIds = body.attr_ids.map((id) => parseInt(id, 10));
          const attrs = attrIds.map((id) => ({
            attr_id: id,
            attr_name: `属性${id}`, // 简化处理
          }));

          uniqueRules[modelId][ruleIndex].attrs = attrs;

          // 更新规则名称
          const ruleName = attrs.map((attr) => attr.attr_name).join('+') + '唯一';
          uniqueRules[modelId][ruleIndex].rule = ruleName;
        }

        updatedRule = uniqueRules[modelId][ruleIndex];
        break;
      }
    }

    if (updatedRule) {
      res.send({
        code: 0,
        inside_code: 0,
        msg: '更新唯一校验规则成功',
        data: {},
      });
    } else {
      res.status(404).send({
        code: 404,
        inside_code: 404,
        msg: '未找到指定的唯一校验规则',
        data: {},
      });
    }
  },
};
