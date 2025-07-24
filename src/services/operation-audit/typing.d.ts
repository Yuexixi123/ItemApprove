declare namespace API {
  // 操作审计请求参数接口
  export interface OperationAuditParams {
    user_id?: number[];
    start_time: string;
    end_time: string;
    operate_object?: string;
    instance?: string;
    model_id?: number[];
  }
  // 操作审计响应项接口
  export interface OperationAuditItem {
    operate_object?: string;
    model_name?: string;
    action: string;
    instance: string;
    operation_desc: string;
    operation_time: string;
    operation_user: string;
  }

  // 操作审计响应接口
  export interface OperationAuditResponse {
    code: number;
    inside_code: number;
    msg: string;
    data: {
      pagination: Pagination;
      data: OperationAuditItem[];
    };
  }
}
