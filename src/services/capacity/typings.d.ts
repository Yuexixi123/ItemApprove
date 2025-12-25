declare namespace CapacityManagement {
  /**
   * 容量管理审批列表项
   */
  interface ApprovalItem {
    id: number;
    system_id: number;
    system_name: string;
    approval_status: 1 | 2; // 1: 可编辑；2: 流转中
    create_time: string;
    create_user: string;
    create_type: number; // 1: 新增资源；2: 现有资源
    project_no: string;
    project_name: string;
    desc: string;
  }

  /**
   * 分页信息
   */
  interface PaginationInfo {
    current: number;
    page_size: number;
    total: number;
  }

  /**
   * 容量审批列表响应（与CustomProTable一致）
   */
  interface ApprovalListResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: {
      data: ApprovalItem[]; // 审批数据
      pagination: PaginationInfo; // 分页信息
    };
  }

  /**
   * 获取审批列表请求参数
   */
  interface GetApprovalListParams {
    current?: number;
    page_size?: number;
    system_id?: number;
    approval_status?: number;
    create_user?: number;
  }

  /**
   * 新建容量管理审批请求参数
   */
  interface CreateApprovalParams {
    system_id: number;
    approval_status: 1 | 2;
    project_no: string;
    create_type: number; // 1: 新增资源；2: 现有资源
    project_name: string;
    desc?: string;
    resources: Record<number, any[]>; // 以数值model_id为key的资源数组（与接口一致）
    file_ids?: (string | number)[];
  }

  interface UpdateApprovalParams {
    system_id: number;
    approval_status: 1 | 2;
    project_no: string;
    project_name: string;
    desc?: string;
    resources: Record<string, any[]>;
    model_id?: number[];
    file_ids?: (string | number)[];
  }

  /**
   * 通用接口响应
   */
  interface CommonResponse<T = any> {
    code?: number;
    inside_code?: number;
    msg?: string;
    success?: boolean;
    data?: T;
  }

  /**
   * 模型名称选项项
   */
  interface ModelNameItem {
    label: string;
    value: number;
    model_key?: string;
  }

  /**
   * 模型名称响应
   */
  interface ModelNameListResponse {
    code?: number;
    inside_code?: number;
    msg?: string;
    data?: ModelNameItem[];
    success?: boolean;
  }

  /**
   * 容量审批详情数据
   */
  interface ApprovalDetailData {
    id?: number;
    system_id: number;
    approval_status: number; // 1:可编辑、2:流转中
    model_id: number[];
    resources: Record<string, any[]>;
  }

  /**
   * 容量审批详情响应（使用类型别名以避免空接口继承警告）
   */
  type ApprovalDetailResponse = CommonResponse<ApprovalDetailData>;

  /**
   * 关联资源项（主资源及其子资源）
   */
  interface RelateResourceItem {
    host_resource_id: number;
    rel_resource_datas: Record<number, any[]>;
    [key: string]: any; // 动态主模型资源字段
  }

  /**
   * 关联资源响应
   */
  type RelateResourceResponse = CommonResponse<RelateResourceItem[]>;

  interface ModelAttributeItem {
    attr_key: string;
    attr_name: string;
    attr_index: string | number;
    attr_type: string;
    is_required: boolean;
    is_display: boolean;
    is_form_show: boolean;
    is_search: boolean;
    editable: boolean;
    option: any;
    attr_default: any;
  }

  type ModelAttributeResponse = CommonResponse<ModelAttributeItem[]>;
}
