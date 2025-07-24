import { Request, Response } from 'express';

// 模拟请求延迟（与 user.ts 保持统一）
const waitTime = (time: number = 200) => new Promise((resolve) => setTimeout(resolve, time));

// 基于 Ant Design Pro 的字段类型定义
type ProValueType =
  | 'text' // 文本（默认）
  | 'digit' // 数字输入
  | 'date' // 日期（YYYY-MM-DD）
  | 'datetime' // 日期时间（YYYY-MM-DD HH:mm:ss）
  | 'switch' // 布尔开关
  | 'select' // 下拉选择
  | 'textarea' // 多行文本
  | 'money' // 金额（自动格式化）
  | 'index' // 序号列
  | 'option'; // 操作项列

// 动态字段数据结构
interface DynamicField {
  id: string; // 字段唯一标识
  name: string; // 字段显示名称
  valueType: ProValueType;
  required?: boolean; // 是否必填（默认false）
  filterable?: boolean; // 是否可筛选（默认false）
  valueEnum?: {
    // 选择型字段的枚举值
    [key: string]: {
      text: string;
      status?: 'Success' | 'Error' | 'Processing'; // 状态徽标
    };
  };
}

let columnSettingsStore: Record<string, any> = {};

// 模型元数据存储
const modelMetadataStore: Record<string, any> = {
  101: {
    modelName: '主机',
    fields: [
      {
        name: 'id',
        title: 'ID',
        type: 'number',
        readOnly: true,
        required: true,
        hideInSearch: true,
        attr_index: 0,
        is_display: true,
      },
      {
        name: 'name',
        title: '主机名称',
        type: 'text',
        required: true,
        maxLength: 50,
        attr_index: 1,
        is_display: true,
      },
      {
        name: 'ip',
        title: 'IP 地址',
        type: 'text',
        pattern: /^(\d{1,3}\.){3}\d{1,3}$/, // IP格式验证
        required: true,
        attr_index: 2,
        is_display: true,
      },
      {
        name: 'status',
        title: '状态',
        type: 'enum',
        enum: ['在线', '离线'],
        attr_index: 3,
        is_display: false,
      },
      {
        name: 'createdAt',
        title: '创建时间',
        type: 'date',
        hideInForm: true,
        attr_index: 4,
        is_display: false,
      },
    ],
  },
};

// 表格数据存储
const tableDataStore: Record<string, any[]> = {
  101: [
    { id: 1, name: '主机1', ip: '192.168.1.1', status: '在线', createdAt: '2023-07-20' },
    { id: 2, name: '主机2', ip: '192.168.1.2', status: '离线', createdAt: '2023-07-21' },
    {
      id: 3,
      name: '负载均衡服务器',
      ip: '192.168.1.100',
      status: '在线',
      createdAt: '2023-08-01',
      spec: '4C8G', // 添加新字段示例
      region: '华东1区',
    },
    {
      id: 4,
      name: '数据库主节点',
      ip: '10.0.0.1',
      status: '离线',
      createdAt: '2023-08-05',
      spec: '8C16G',
      region: '华北2区',
    },
  ],
};

let customSettings: any[] = [];

// Mock 数据（包含典型字段示例）
const dynamicFields: DynamicField[] = [
  {
    id: 'id',
    name: '唯一标识',
    valueType: 'text',
    required: true,
    filterable: false,
  },
  {
    id: 'title',
    name: '标题',
    valueType: 'text',
    filterable: true,
    required: true,
  },
  {
    id: 'status',
    name: '状态',
    valueType: 'select',
    valueEnum: {
      '1': { text: '已发布', status: 'Success' },
      '0': { text: '草稿', status: 'Processing' },
      '-1': { text: '已删除', status: 'Error' },
    },
  },
  {
    id: 'create_time',
    name: '创建时间',
    valueType: 'datetime',
    filterable: true,
  },
  {
    id: 'amount',
    name: '金额',
    valueType: 'money',
    filterable: true,
  },
];

// 标准响应接口（保持与 user.ts 一致）
interface ResponseData<T> {
  success: boolean;
  data: T;
  code?: number;
  errorMessage?: string;
}

export default {
  // 动态字段获取接口
  'GET /api/dynamic/fields': async (req: Request, res: Response) => {
    await waitTime(500); // 保持统一延迟风格

    try {
      // 分页参数处理（与 user.ts 风格一致）
      const { current = 1, pageSize = 10, name } = req.query;

      // 过滤逻辑
      const filteredData = dynamicFields.filter((item) => {
        const nameMatch = name ? item.name.includes(name.toString()) : true;
        return nameMatch;
      });

      // 分页处理
      const pagedData = filteredData.slice(
        (Number(current) - 1) * Number(pageSize),
        Number(current) * Number(pageSize),
      );

      res.send(<
        ResponseData<{
          list: DynamicField[];
          total: number;
        }>
      >{
        success: true,
        data: {
          list: pagedData,
          total: filteredData.length,
        },
        code: 0,
      });
    } catch (error) {
      res.status(500).send(<ResponseData<null>>{
        success: false,
        data: null,
        code: 500,
        errorMessage: '获取动态字段失败',
      });
    }
  },

  // 字段更新接口（保持与登录接口类似的 POST 处理）
  'POST /api/dynamic/fields': async (req: Request, res: Response) => {
    await waitTime(800);
    const newField = {
      id: `field_${Date.now()}`,
      ...req.body,
    };
    dynamicFields.push(newField);

    res.send(<ResponseData<DynamicField>>{
      success: true,
      data: newField,
      code: 0,
    });
  },

  // 字段删除接口（与退出登录接口类似风格）
  'DELETE /api/dynamic/fields/:id': async (req: Request, res: Response) => {
    await waitTime(300);
    const index = dynamicFields.findIndex((item) => item.id === req.params.id);

    if (index >= 0) {
      dynamicFields.splice(index, 1);
      res.send({ success: true, code: 0 });
    } else {
      res.status(404).send({
        success: false,
        code: 404,
        errorMessage: '字段不存在',
      });
    }
  },
  // 列配置接口
  'GET /api/column-settings/:page': (req: Request, res: Response) => {
    const page = req.params.page;
    const data = columnSettingsStore[page] || [];

    setTimeout(() => {
      res.send({
        code: 0,
        data: data.map((item: any) => ({
          fieldKey: item.fieldKey,
          visible: item.visible,
        })),
      });
    }, 500);
  },

  'POST /api/column-settings': (req: Request, res: Response) => {
    const payload = req.body;

    payload.forEach((item: any) => {
      const pageKey = item.page;
      if (!columnSettingsStore[pageKey]) {
        columnSettingsStore[pageKey] = [];
      }

      // 更新或新增配置
      const index = columnSettingsStore[pageKey].findIndex(
        (i: any) => i.fieldKey === item.fieldKey,
      );

      if (index >= 0) {
        columnSettingsStore[pageKey][index] = item;
      } else {
        columnSettingsStore[pageKey].push(item);
      }
    });

    setTimeout(() => {
      res.send({ code: 0 });
    }, 800);
  },
  // 获取模型元数据
  'GET /api/resource/model/:modelId/attribute': (req: Request, res: Response) => {
    setTimeout(() => {
      const data = modelMetadataStore[req.params.modelId] || {};

      // 转换字段格式以匹配新的 API 响应结构
      const attributes = (data.fields || []).map((field: any, index: number) => ({
        attr_key: field.name,
        attr_name: field.title,
        attr_index: index,
        attr_type: field.type,
        is_display: field.is_display,
        option: field.enum ? JSON.stringify(field.enum) : '',
        // visible: field.hideInTable !== true, // 默认显示
        // order: index // 默认按索引排序
      }));

      res.json({
        code: 0,
        inside_code: 0,
        msg: 'success',
        data: attributes,
      });
    }, 500);
  },
  // 添加到现有的 resource.ts 文件中
  // 保存模型属性配置
  'POST /api/resource/model/:modelId/attribute': (req: Request, res: Response) => {
    const { modelId } = req.params;
    const { attributes } = req.body;

    setTimeout(() => {
      console.log(`保存模型 ${modelId} 的属性配置:`, attributes);

      // 模拟保存成功
      res.json({
        code: 0,
        inside_code: 0,
        msg: 'success',
        data: {
          updated: attributes.length,
        },
      });
    }, 500);
  },

  // 获取表格数据
  'GET /api/resource/model/:modelId': (req: Request, res: Response) => {
    setTimeout(() => {
      res.json({
        code: 0,
        data: {
          pagination: {
            current: 1,
            pageSize: 10,
            total: tableDataStore[req.params.modelId]?.length || 0,
          },
          data: tableDataStore[req.params.modelId] || [],
        },
      });
    }, 800);
  },

  // 删除资源数据
  'DELETE /api/resource': (req: Request, res: Response) => {
    const { resource_ids } = req.body;

    setTimeout(() => {
      if (!Array.isArray(resource_ids) || resource_ids.length === 0) {
        return res.status(400).json({
          code: 400,
          success: false,
          message: '无效的资源ID列表',
        });
      }

      // 遍历所有模型数据，删除匹配的资源
      let deletedCount = 0;

      Object.keys(tableDataStore).forEach((modelId) => {
        const modelData = tableDataStore[modelId];

        // 过滤出要保留的记录
        const filteredData = modelData.filter((item) => !resource_ids.includes(item.id));

        // 计算删除的记录数
        const deleted = modelData.length - filteredData.length;
        deletedCount += deleted;

        // 更新数据存储
        tableDataStore[modelId] = filteredData;
      });

      // 返回成功响应
      res.json({
        code: 0,
        success: true,
        message: `成功删除 ${deletedCount} 条记录`,
        data: {
          deleted_count: deletedCount,
        },
      });
    }, 600);
  },

  'GET /api/resources/model/:modelId/data/:recordId': (req: Request, res: Response) => {
    const { modelId, recordId } = req.params;

    setTimeout(() => {
      // 校验模型是否存在
      if (!modelMetadataStore[modelId]) {
        return res.status(404).json({
          success: false,
          error: 'Model not found',
        });
      }

      // 查找对应数据
      const modelData = tableDataStore[modelId] || [];
      const record = modelData.find((item) => item.id == recordId); // 宽松比较处理字符串/数字ID

      if (!record) {
        return res.status(404).json({
          success: false,
          error: 'Record not found',
        });
      }

      // 返回符合字段结构的详细数据
      res.json({
        success: true,
        data: {
          ...record,
          // 添加关联数据示例（可根据实际需求扩展）
          _relations: {
            createdBy: { id: 1, name: '管理员' },
          },
        },
      });
    }, 600);
  },

  // 更新记录接口
  'PUT /api/resource/:recordId': (req: Request, res: Response) => {
    const { modelId, recordId } = req.params;
    const payload = req.body;

    setTimeout(() => {
      // 校验模型是否存在
      if (!tableDataStore[modelId]) {
        return res.status(404).json({
          success: false,
          error: 'Model not found',
        });
      }

      // 查找记录索引
      const dataIndex = tableDataStore[modelId].findIndex((item) => item.id == recordId);
      if (dataIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Record not found',
        });
      }

      // 执行更新（保留原始ID和创建时间）
      const originalData = tableDataStore[modelId][dataIndex];
      tableDataStore[modelId][dataIndex] = {
        ...originalData,
        ...payload,
        id: originalData.id, // 防止ID被修改
        createdAt: originalData.createdAt, // 保留创建时间
        updatedAt: new Date().toISOString(), // 添加更新时间
      };

      res.json({
        success: true,
        data: tableDataStore[modelId][dataIndex],
      });
    }, 800);
  },

  // 创建记录接口
  'POST /api/resources/:modelId/data': (req: Request, res: Response) => {
    const { modelId } = req.params;
    const payload = req.body;

    setTimeout(() => {
      if (!tableDataStore[modelId]) {
        tableDataStore[modelId] = [];
      }

      // 生成模拟ID（实际项目应使用更健壮的ID生成方式）
      const newId = Math.max(...tableDataStore[modelId].map((item) => Number(item.id)), 0) + 1;

      const newRecord = {
        ...payload,
        id: newId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      tableDataStore[modelId].push(newRecord);

      res.json({
        success: true,
        data: newRecord,
      });
    }, 800);
  },
};
