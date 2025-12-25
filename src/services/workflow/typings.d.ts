// @ts-ignore
/* eslint-disable */

declare namespace Workflow {
  interface ApproveParams {
    task_id: string | number;
    approve_info: string;
    data: string;
    user_name: string;
    process_id: string;
    work_type: string;
    work_id: string | number;
  }

  interface CommonResponse<T = any> {
    success?: boolean;
    code?: number;
    inside_code?: number;
    msg?: string;
    message?: string;
    data?: T;
  }

  type ApproveResponse = CommonResponse<any>;

  interface TaskItem {
    createDate: string;
    doRemark: string;
    doResult: string;
    doTaskActor: string;
    doTaskActorName: string;
    endDate: string;
    id: number;
    processCode: string;
    startDate: string;
    taskActorsName: string;
    taskName: string;
    workCreaterName: string;
    workState: string;
    workStateName: string;
  }

  interface TaskListData {
    list: TaskItem[];
    pagination: {
      current: number;
      pageSize: number;
      total: number;
    };
  }

  type TaskListResponse = CommonResponse<TaskListData>;
}
