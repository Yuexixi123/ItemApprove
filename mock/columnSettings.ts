// mock/model-manager.ts
import { Request, Response } from 'express';

const defaultSettings = [
  { fieldKey: 'target', visible: true },
  { fieldKey: 'constraint', visible: true },
  { fieldKey: 'type', visible: true },
  { fieldKey: 'id', visible: true, hideInSearch: true },
  { fieldKey: 'source', visible: true },
];

let customSettings: any[] = [];

export default {
  // 获取列配置
  'GET /api/column-settings': (req: Request, res: Response) => {
    const mergedSettings = [...defaultSettings];

    customSettings.forEach((setting) => {
      const target = mergedSettings.find((item) => item.fieldKey === setting.fieldKey);
      if (target) target.visible = setting.visible;
    });

    setTimeout(() => {
      res.send({
        code: 0,
        data: mergedSettings,
      });
    }, 500);
  },

  // 保存列配置
  'POST /api/column-settings': (req: Request, res: Response) => {
    customSettings = req.body.map(({ fieldKey, visible }: any) => ({
      fieldKey,
      visible,
    }));

    setTimeout(() => {
      res.send({ code: 0, message: '保存成功' });
    }, 800);
  },

  // 重置mock数据
  'POST /api/mock-reset': () => {
    customSettings = [];
  },
};
