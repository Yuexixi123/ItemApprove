// @ts-ignore
/* eslint-disable */

declare namespace API {
  // 模型基础类型
  type Model = {
    name: string;
    id: string;
    icon: string;
  };

  type ManagementSection = {
    title: string;
    count: number;
    models: Model[];
  };

  interface ModelItem {
    modelgroup_key: string;
    model_icon: string;
    model_id: number;
    model_key: string;
    model_name: string;
    is_active: boolean; // 修改字段名从 is_paused 改为 is_active
    is_builtin: boolean;
    create_name: string;
    create_time: string;
    update_name: string;
    update_time: string;
  }

  interface ModelListResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: ModelGroup[];
  }

  type ModelGroup = {
    modelgroup_id: number;
    modelgroup_key: string;
    modelgroup_name: string;
    models: ModelItem[];
  };

  type ModelFieldsList = {
    fieldName: string;
    fieldId: string;
    type: string;
  };

  // 创建模型请求参数
  interface CreateModelRequest {
    modelgroup_id: number;
    model_icon: string;
    model_name: string;
    model_key: string;
  }

  // 创建模型响应类型
  interface CreateModelResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: ModelItem; // 返回新创建的模型对象
  }

  // 删除模型请求参数
  interface DeleteModelParams {
    model_id: number;
  }

  // 删除模型响应类型
  interface DeleteModelResponse {
    code: number;
    inside_code: number;
    msg: string;
    data?: {}; // 根据实际接口返回决定是否保留
  }

  // 更新模型请求参数
  interface UpdateModelRequest {
    model_id: string;
    model_icon?: string;
    model_name?: string;
    is_paused?: boolean;
    modelgroup_id?: string;
  }

  // 更新模型响应类型
  interface UpdateModelResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: ModelItem; // 返回更新后的模型对象
  }

  // 新增模型名称项类型
  interface ModelNameItem {
    label: string;
    value: number;
    icon: string;
  }

  // 新增模型名称列表响应类型
  interface ModelNameResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: ModelNameItem[];
  }

  // 列设置相关类型
  interface ColumnSetting {
    id: number;
    page: string;
    fieldKey: string;
    visible: boolean;
    createdAt: string;
    updatedAt: string;
  }

  interface ColumnSettingPayload {
    page: string;
    fieldKey: string;
    visible: boolean;
  }

  // 关联类型名称项类型
  interface AssociationTypeNameItem {
    label: string; // 关联类型名，格式：关联类型唯一标识(关联类型名)，示例: belong(属于)
    value: number; // 关联类型ID
  }

  // 关联类型名称列表响应类型
  interface AssociationTypeNameResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: AssociationTypeNameItem[];
  }
}
