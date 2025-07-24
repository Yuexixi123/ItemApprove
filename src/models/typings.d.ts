declare namespace Models {
  // 定义字段列表接口
  interface ModelFieldsList {
    field_name: string;
    field_id: string;
    field_type: string;
  }

  // 定义字段分组接口
  interface ModelFieldsGroup {
    title: string;
    key: string;
    children: ModelFieldsList[];
  }

  interface Model {
    id: string;
    name: string;
    icon: string;
  }

  interface ModelGroup {
    id: string;
    title: string;
    models: Model[];
  }
}
