// @ts-ignore
/* eslint-disable */

declare namespace API {
  // 模型关联项
  interface AssociationItem {
    src_model_key: string;
    dest_model_key: string;
    asst_type_key: string;
    asst_id: number;
    asst_key: string;
    asst_desc: string;
    mapping: 'N-N' | '1-N' | '1-1';
  }

  // 关联列表响应
  interface AssociationListResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: {
      pagination: Pagination;
      data: AssociationItem[];
    };
  }

  // 创建关联请求类型
  interface CreateAssociationRequest {
    src_model_key: string;
    dest_model_key: string;
    asst_type_key: string;
  }

  // 创建关联响应类型
  interface CreateAssociationResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: AssociationItem;
  }

  // 删除关联请求类型
  interface DeleteAssociationRequest {
    asst_id: number;
  }

  // 删除关联响应类型
  interface DeleteRelationshipResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: any[];
  }

  // 更新关联请求类型
  interface UpdateAssociationRequest {
    asst_id: number;
    asst_desc: string;
  }

  // 更新关联响应类型
  interface UpdateAssociationResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: AssociationItem; // 根据实际返回结构调整
  }

  // 新增关联关系类型
  interface RelationshipItem {
    rel_id: number;
    rel_key: string;
    asst_type: string;
    constraint: 'N-N' | '1-N' | '1-1';
    src_model_name?: string;
    src_model_id?: number;
    dest_model_name?: string;
    dest_model_id?: number;
    rel_desc: string;
  }

  // 关联关系响应类型
  interface RelationshipResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: {
      pagination: Pagination;
      data: RelationshipItem[];
    };
  }

  interface Pagination {
    current: number;
    page_size: number;
    total: number;
  }

  // 新增创建关联请求类型
  interface CreateRelationshipRequest {
    src_model_id: number;
    dest_model_id: number;
    asst_type_id: number;
    constraint: 'N-N' | '1-N' | '1-1';
    rel_desc?: string | null;
  }

  // 新增创建关联响应类型
  interface CreateRelationshipResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: any[]; // 根据示例响应data为空数组，按实际需求调整
  }

  // 新增更新关联请求类型
  interface UpdateRelationshipRequest {
    rel_desc: string;
  }

  // 更新关联响应类型（复用创建响应结构）
  interface UpdateRelationshipResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: any[];
  }

  // 关联类型项
  interface AssociationTypeItem {
    asst_id: number;
    asst_key: string;
    asst_name: string;
    src_desc: string;
    dest_desc: string;
    count: number;
    direction: string;
  }

  // 关联类型响应结构
  interface AssociationTypeResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: {
      total: string;
      asst_type: AssociationTypeItem[];
    };
  }

  // 新增关联类型请求类型
  interface CreateAssociationTypeRequest {
    asst_key: string;
    asst_name: string;
    src_des: string;
    dest_des: string;
    direction: string;
  }

  // 新增修改关联类型请求类型
  interface UpdateAssociationTypeRequest {
    asst_name?: string;
    dest_des?: string;
    src_des?: string;
    direction?: string;
  }

  // 关联类型名称项类型
  interface AssociationTypeNameItem {
    label: string;
    value: number;
  }

  // 关联类型名称列表响应类型
  interface AssociationTypeNameResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: AssociationTypeNameItem[];
  }
}
