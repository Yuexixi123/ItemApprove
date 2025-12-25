declare namespace MonitoringApprove {
  interface MonitoringApproveList {
    id: string;
    system_name?: string;
    approval_status?: number;
    create_name?: string;
    create_time?: string;
    model_id?: number;
  }

  // 添加表单相关类型定义
  interface CreateFormValues {
    sys_name?: string;
    host_name?: string;
    approve_status?: number;
    model_id?: number[];
  }

  // 添加更新表单属性接口
  interface UpdateFormProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    title?: string;
    values?: API.RelationshipItem;
    setRow?: (row: API.RelationshipItem | undefined) => void;
    onSuccess?: () => void;
    modelId?: number;
    setApproveOpen: (open: boolean) => void;
  }
}
