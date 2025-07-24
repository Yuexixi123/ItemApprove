// @ts-ignore
/* eslint-disable */

declare namespace API {
  // 模型分组相关类型
  interface ModelGroup {
    modelgroup_id: number;
    modelgroup_key: string;
    modelgroup_name: string;
    is_builtin: boolean;
    models: ModelItem[];
  }

  // 新增修改分组请求类型
  interface UpdateModelGroupRequest {
    modelgroup_name: string;
    modelgroup_key: string;
  }

  // 创建模型分组请求类型
  interface CreateModelGroupRequest {
    modelgroup_key: string;
    modelgroup_name: string;
  }
}
