// @ts-ignore
/* eslint-disable */

declare namespace MonitoringItem {
  // 监控项模型名称列表接口返回类型
  interface ModelNameResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: ModelNameItem[]; // 响应体
  }

  // 监控项模型名称项
  interface ModelNameItem {
    label: string; // 模型名称
    value: number; // 模型ID
    icon: string; // 模型图标
    model_key: string;
  }

  // 监控项审批列表请求参数
  interface ApprovalListParams {
    current?: number; // 当前页数
    page_size?: number; // 当前页条数
  }

  // 监控项审批列表响应类型
  interface ApprovalListResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: {
      data: ApprovalItem[]; // 响应体
      pagination: {
        current: number; // 当前页数
        page_size: number; // 每页条数
        total: number; // 总条数
      };
    };
  }

  // 监控项审批项
  interface ApprovalItem {
    model_id: number[]; // 模型ID列表，模型ID为监控项类型
    system_name: string; // 系统名
    system_id: number;
    approval_status: number; // 审批状态，1: 可编辑；2:流转中
    is_approval: boolean; // 是否当前人审批
    create_time: string; // 申请时间，审批数据的创建时间
    create_name: string; // 申请人，审批数据的创建用户
    resources: ResourceItem[]; // 资源数据，模型资源，不要默认的5条属性数据
  }

  // 资源项
  interface ResourceItem {
    model_id: number; // 模型ID
    model_name: string; // 模型名称
    resource: any[]; // 资源数据
  }

  // 新建监控项审批请求参数
  interface CreateApprovalParams {
    system_id: number; // 系统ID
    approval_status: number; // 审批状态. 1: 可编辑；2:流转中
    model_id: number[]; // 模型ID， 模型ID为监控项类型
    resources: ResourceCreateItem[]; // 资源数据
  }

  // 资源创建项
  interface ResourceCreateItem {
    model_id: number; // 模型ID
    resource: any[]; // 资源数据
  }

  // 新建监控项审批响应类型
  interface CreateApprovalResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: {
      data: ApprovalItem[]; // 响应体
    };
  }

  // 修改监控项审批请求参数
  interface UpdateApprovalParams {
    system_id: number; // 系统ID
    approval_status: number; // 审批状态. 1: 可编辑；2:流转中
    model_id: number[]; // 模型ID， 模型ID为监控项类型
    resources: ResourceCreateItem[]; // 资源数据
  }

  // 修改监控项审批响应类型
  interface UpdateApprovalResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: {
      data: ApprovalItem[]; // 响应体
    };
  }

  // 下拉框通用项
  interface SelectorItem {
    value: string; // 值
    id: string | number; // ID
    label: string; // 标签
    name: string; // 名称
    status: string | number; // 状态
    is_information: boolean; // 是否信息
  }

  // 下拉框通用响应
  interface SelectorResponse {
    data: SelectorItem[]; // 下拉框数据
    message: string; // 消息
    ret_code: string; // 返回码
  }

  // 获取模型资源属性（带过滤条件）请求参数
  interface ModelAttributeFilterParams {
    model_id?: number; // 模型ID，可选
    model_key?: string; // 模型key，可选
  }

  // 模型属性项
  interface ModelAttributeItem {
    attr_key: string; // 属性唯一key
    attr_name: string; // 属性名
    attr_index: string; // 属性索引
    attr_type: string; // 属性类型
    is_required: boolean; // 是否必填
    is_display: boolean; // 是否显示
    is_form_show: boolean; // 是否表单展示
    editable: boolean; // 是否可编辑
    option: any; // 可选项
    attr_default: any; // 默认值
    api_url: string;
  }

  // 获取模型资源属性（带过滤条件）响应类型
  interface ModelAttributeFilterResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: ModelAttributeItem[]; // 响应体
  }

  // 获取监控项及关联触发器资源请求参数
  interface RelatedResourceParams {
    sys_resource_id: number; // 主机资源ID，可选
    host_resource_id?: number; // 主机资源ID，可选
    sys_rel: string;
    host_rel: string;
    item_rel: string;
  }

  // 监控项及关联触发器资源响应类型
  interface RelatedResourceResponse {
    code: number; // 外部状态码
    inside_code: number; // 内部状态码
    msg: string; // 消息体
    data: RelatedResourceItem[];
  }

  // 关联资源项
  interface RelatedResourceItem {
    [key: string]: any; // 具体的资源数据结构，根据实际返回调整
    trigger_resource_datas: TriggerResourceItem[];
  }

  interface TriggerResourceItem {
    [key: string]: any; // 触发器资源数据结构，根据实际返回调整
  }
}
