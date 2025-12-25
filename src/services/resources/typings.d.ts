// @ts-ignore
/* eslint-disable */

declare namespace API {
  // 资源列表分页参数
  interface ResourceListParams {
    current: number;
    page_size: number;
    no_page_size?: boolean;
    id?: number; // 资源ID，可选
    key?: string; // 资源实例名字段，可选
    create_name?: number; // 创建人，可选
    create_time?: string; // 创建时间（时间字符串），可选
  }

  // 资源数据项
  interface ResourceItem {
    [key: string]: any; // 资源数据可能有多种字段，使用索引签名
  }

  // 分页信息
  interface PaginationInfo {
    current: number;
    page_size: number;
    total: number;
  }

  // 资源列表响应
  interface ResourceListResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: {
      pagination: {
        current: number;
        page_size: number;
        total: number;
      };
      data: ResourceItem[];
    };
  }

  // 模型属性项
  interface ModelAttributeItem {
    attr_id: number; // 属性唯一id
    attr_key: string; // 属性唯一key
    attr_name: string; // 属性名
    attr_index: string; // 属性索引
    attr_type: string; // 属性类型
    is_required: boolean; // 是否必填
    option: string; // 可选项
    is_display: boolean; // 是否显示在表格中
    attr_index: number; // 列排序顺序
    editable: boolean; // 是否可编辑
    attr_default: any; // 属性默认值
    is_form_show: boolean; // 是否在表单中显示
    is_search?: boolean; // 是否可搜索
    api_url: string; // 关联api
  }

  // 模型属性更新项
  interface ModelAttributeUpdateItem {
    attr_key: string; // 属性唯一key
    is_display: boolean; // 是否显示
    attr_index?: number; // 排序顺序
  }

  // 模型属性响应
  interface ModelAttributeResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: ModelAttributeItem[];
  }

  // 基础响应类型
  interface BaseResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: Record<string, any>;
  }

  interface ResourceDetailResponse extends BaseResponse {
    data: {
      id: number;
      instance_name: string;
      create_name: string;
      create_time: string;
      update_user: string;
      update_time: string;
      [key: string]: any;
    };
  }

  // 资源名称项
  interface ResourceNameItem {
    label: string; // 资源实例名称
    value: number; // 资源ID
  }

  // 资源名称列表响应
  interface ResourceNameListResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: ResourceNameItem[]; // 响应体
  }

  // 模型关联关系拼接名项
  interface ModelRelationshipJoinNameItem {
    label: string; // 模型关联关系拼接名（关联类型-被关联模型名）
    value: number; // 模型关联关系ID
    model_id: number; // 模型ID
  }

  // 模型关联关系拼接名列表响应
  interface ModelRelationshipJoinNameResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: ModelRelationshipJoinNameItem[]; // 响应体
  }

  // 关联资源项
  interface RelatedResourceItem {
    id: number;
    resource_id: number; // 资源ID
    instance_name: string; // 实例名
    create_name: string; // 创建人
    create_time: string; // 创建时间
    update_name: string; // 更新人
    update_time: string; // 更新时间
    resource_rel_id: number;
  }

  // 关联资源列表响应
  interface RelatedResourceResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: {
      data: RelatedResourceItem[]; // 关联的资源列表
      pagination?: {
        current: number; // 当前页数
        page_size: number; // 每页条数
        total: number; // 总条数
      };
    };
  }

  // 新增资源关联关系请求参数
  interface CreateResourceRelationshipParams {
    src_resource_id: number; // 源资源ID
    dest_resource_id: number; // 目标资源ID
  }

  // 新增资源关联关系响应
  interface CreateResourceRelationshipResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: Record<string, any>; // 响应数据
  }

  // 删除资源关联关系响应
  interface DeleteResourceRelationshipResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: Record<string, any>; // 响应数据
  }

  interface ModelResourcesWithRelStatusResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: {
      pagination: Pagination;
      data: ModelResourceWithRelStatus[];
    };
  }

  interface ModelResourceWithRelStatus {
    id: number; // 资源ID
    instance_name: string; // 实例名
    create_name: string; // 创建人(用户名)
    create_time: string; // 创建时间
    update_name: string; // 更新人(用户名)
    update_time: string; // 更新时间
    is_relationship?: boolean; // 是否已关联
    rel_id?: number; // 关联关系ID
    resource_rel_id?: number;
  }

  // 获取模型资源列表（仅有关联关系的资源）响应
  interface ModelRelatedResourcesResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: {
      data: ModelRelatedResourceItem[]; // 资源数据
      pagination?: {
        current: number;
        page_size: number;
        total: number;
      };
    };
  }

  // 模型关联资源项
  interface ModelRelatedResourceItem {
    resource_rel_id: number; // 资源关联关系ID
    resource_id: number;
    id: number; // 资源ID
    instance_name: string; // 实例名
    create_name: string; // 创建人(用户名)
    create_time: string; // 创建时间
    update_name: string; // 更新人(用户名)
    update_time: string; // 更新时间
  }
}
