import { request } from '@umijs/max';

/** 获取模型列表 GET /model */
export async function getModelList(
  params?: {
    is_active?: number;
    model_name?: string;
    model_id?: number;
  },
  options?: { [key: string]: any },
) {
  return request<API.ModelListResponse>('/model', {
    method: 'GET',
    params: {
      ...params,
      // 转换数字类型为字符串查询参数（按接口要求）
      ...(params?.is_active !== undefined && { is_active: String(params.is_active) }),
    },
    ...(options || {}),
  });
}

/** 获取模型名称列表 GET /model/model_name */
export async function getModelNames(options?: { [key: string]: any }) {
  return request<API.ModelNameResponse>('/model/model_name', {
    method: 'GET',
    params: {
      ...options,
    },
  });
}

/** 创建新模型 POST /model */
export async function createModel(body: API.CreateModelRequest, options?: { [key: string]: any }) {
  return request<API.CreateModelResponse>('/model', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 更新模型 PATCH /model */
export async function updateModel(body: API.UpdateModelRequest, options?: { [key: string]: any }) {
  return request<API.UpdateModelResponse>(`/model/${body.model_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 获取唯一校验列表 GET /model/rule/${model_id} */
export async function getUniqueRules(model_id: number, options?: { [key: string]: any }) {
  return request<API.UniqueRuleResponse>(`/model/rule/${model_id}`, {
    method: 'GET',
    params: {
      ...options,
    },
  });
}

/** 新增唯一校验 POST /model/rule/${model_id} */
export async function createUniqueRule(
  model_id: number,
  body: API.CreateUniqueRuleRequest,
  options?: { [key: string]: any },
) {
  return request<API.CreateUniqueRuleResponse>(`/model/rule/${model_id}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}

/** 删除唯一校验 DELETE /model/rule/${rule_id} */
export async function deleteUniqueRule(rule_id: number, options?: { [key: string]: any }) {
  return request<API.DeleteUniqueRuleResponse>(`/model/rule/${rule_id}`, {
    method: 'DELETE',
    headers: {
      'Content-Type': 'application/json',
    },
    ...(options || {}),
  });
}

/** 修改唯一校验 PATCH /model/rule/${rule_id} */
export async function updateUniqueRule(
  rule_id: number,
  body: API.UpdateUniqueRuleRequest,
  options?: { [key: string]: any },
) {
  return request<API.UpdateUniqueRuleResponse>(`/model/rule/${rule_id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    data: body,
    ...(options || {}),
  });
}
/** 删除模型 DELETE /model */
export async function deleteModel(params: API.DeleteModelParams, options?: { [key: string]: any }) {
  return request<API.DeleteModelResponse>(`/model/${params.model_id}`, {
    method: 'DELETE',
    params: {
      ...params,
    },
    ...(options || {}),
  });
}

export async function saveColumnSettings(payload: API.ColumnSettingPayload[]) {
  return request('/column-settings', {
    method: 'POST',
    data: payload,
  });
}
