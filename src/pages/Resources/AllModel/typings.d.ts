declare namespace API {
  interface ModelField {
    name: string;
    title: string;
    type:
      | 'text'
      | 'number'
      | 'date'
      | 'enum'
      | 'link'
      | 'datetime'
      | 'textarea'
      | 'boolean'
      | 'radio'
      | 'checkbox'
      | 'rate'
      | 'slider'
      | 'money'
      | 'password';
    hideInTable?: boolean;
    enum?: string[];
    linkField?: {
      href: string;
      target?: string;
    };
    required?: boolean;
    hideInSearch?: boolean;
    hideInForm?: boolean;
    hideInTable?: boolean;
    hideInDescription?: boolean;
  }
  // 定义数据项类型
  interface DataItem {
    id: number;
    name: string;
    ip: string;
    status: string;
    createdAt: string;
  }
  interface ColumnSetting {
    id?: string;
    page: string;
    fieldKey: string;
    visible: boolean;
    createdAt?: string;
    updatedAt?: string;
  }

  // ModelFormDrawer 相关类型定义
  interface ModelFormDrawerProps {
    visible: boolean;
    onClose: () => void;
    mode: 'create' | 'edit';
    modelId: number;
    recordId?: number;
    recordData?: any;
    onSubmitSuccess?: () => void;
  }

  // 表单字段配置类型
  interface FormFieldConfig {
    name: string;
    title: string;
    valueType: string;
    required: boolean;
    hideInForm: boolean;
    disabled: boolean;
    api_url?: string;
    defaultValue?: any;
    options?: { label: string; value: string }[];
    originalType?: string; // 添加原始类型字段
    regxp?: string; // 添加正则表达式字段
  }
}
