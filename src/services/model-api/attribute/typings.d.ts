// @ts-ignore
/* eslint-disable */

declare namespace API {
  // 新增属性项类型
  interface AttributeItem {
    model_key: string;
    attrgroup_id: number;
    attrgroup_name: string;
    attr_id: number;
    attr_key: string;
    attr_index: number;
    attr_name: string;
    attr_type: string;
    description: string;
    editable: boolean;
    is_required: boolean;
    option: any; // 根据文档示例使用any类型适配多种格式
  }

  // 属性列表响应类型
  interface AttributeResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: {
      attrgroup_id: number;
      attrgroup_name: string;
      is_collapse: boolean;
      attrs: {
        attr_id: number;
        attr_key: string;
        attr_index: number;
        attr_name: string;
        attr_type: string;
        attr_type_name: string;
        description: string;
        editable: boolean;
        is_required: boolean;
        option: string;
      };
    }[];
  }

  // 新增创建属性请求类型
  interface CreateAttributeRequest {
    attr_key: string;
    model_id: number;
    attr_name: string;
    attr_type: string;
    editable: boolean;
    description: string;
    is_required: boolean;
    option?: any; // 适配多种格式
  }

  // 新增修改属性请求类型
  interface UpdateAttributeRequest {
    attr_name: string;
    description: string;
    attrgroup_id: number;
    model_id: number;
    editable: boolean;
    option?: any;
    is_required: boolean;
  }

  // 新增属性分组请求类型
  interface CreateAttributeGroupRequest {
    model_id: number;
    attrgroup_name: string;
    is_collapse: boolean;
  }

  // 新增修改分组请求类型
  interface UpdateAttributeGroupRequest {
    attrgroup_name?: string;
    is_collapse?: boolean;
  }

  interface AttributeCustomColumnResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: {
      attr_id: number;
      attr_index: string;
      editable: string;
      is_required: string;
      attr_type: string;
      option: string[];
    };
  }

  // 唯一校验项
  interface UniqueCheckItem {
    model_id: number;
    model_key: string;
    must_check: '0' | '1';
    attr_ids: string[];
  }

  // 唯一校验响应
  interface UniqueCheckResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: UniqueCheckItem[];
  }

  // 创建唯一校验请求
  interface CreateUniqueCheckRequest {
    model_key: string;
    must_check: boolean;
    attr_ids: string[];
  }

  // 创建唯一校验响应
  interface CreateUniqueCheckResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: UniqueCheckItem;
  }

  // 删除唯一校验请求
  interface DeleteUniqueCheckRequest {
    model_key: string;
    uniquecheck_id: string;
  }

  // 删除唯一校验响应
  interface DeleteUniqueCheckResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: {};
  }

  // 更新唯一校验请求
  interface UpdateUniqueCheckRequest {
    model_key: string;
    uniquecheck_id: string;
    must_check?: boolean;
    attr_ids?: string[];
  }

  // 更新唯一校验响应
  interface UpdateUniqueCheckResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: UniqueCheckItem;
  }

  // 新增唯一校验规则类型
  interface UniqueRuleItem {
    rule_id: number;
    rule: string;
    attrs: AttrItem[];
  }

  // 唯一校验列表响应类型
  interface UniqueRuleResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: {
      pagination: Pagination;
      data: UniqueRuleItem[];
    };
  }

  interface AttrItem {
    attr_id: number;
    attr_name: string;
  }

  // 新增创建唯一校验请求类型
  interface CreateUniqueRuleRequest {
    attrs: AttrItem[];
  }

  // 新增创建唯一校验响应类型
  interface CreateUniqueRuleResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: any; // 根据示例响应data为空对象
  }

  // 新增删除唯一校验响应类型
  interface DeleteUniqueRuleResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: Record<string, never>;
  }

  // 新增更新唯一校验请求类型
  interface UpdateUniqueRuleRequest {
    attr_ids?: string[];
  }

  // 复用已有删除响应类型
  interface UpdateUniqueRuleResponse extends DeleteUniqueRuleResponse {}

  // 复用基础响应类型
  interface BaseResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: {};
  }

  /** 属性名称列表响应 */
  type AttributeNameListResponse = {
    code: number;
    inside_code: number;
    msg: string;
    data: AttributeNameItem[];
  };

  /** 属性名称项 */
  type AttributeNameItem = {
    label: string; // 属性名称
    value: number; // 属性ID
  };
}
