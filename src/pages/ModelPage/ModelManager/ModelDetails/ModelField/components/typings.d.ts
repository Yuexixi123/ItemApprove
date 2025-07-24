declare namespace ModelField {
  interface Model {
    id: string;
    name: string;
    icon: string;
  }

  // 定义API响应类型
  type ModelAttributeGroup = {
    attrgroup_id: number;
    attrgroup_name: string;
    is_collapse: boolean;
    attrs: ModelAttribute[];
  };

  type ModelAttribute = {
    attr_id: number;
    attr_index: number;
    description: string;
    editable: boolean;
    attr_type_name: string;
    option: any[];
    attr_key: string;
    attr_name: string;
    attr_type: FieldType;
    is_required: boolean;
    is_builtin: boolean;
  };

  // 从FieldPreview.tsx中提取的字段类型
  type FieldType =
    | 'text'
    | 'number'
    | 'float'
    | 'date'
    | 'datetime'
    | 'long_text'
    | 'timezone'
    | 'boolean'
    | 'user'
    | 'enum'
    | 'enum_multi'
    | 'api';

  interface CollapseContentProps {
    list?: FieldItem[];
    attrGroupId?: number;
  }
  interface CollapseItemProps {
    item: FieldItem;
    row?: FieldItem;
    setRow: (value: FieldItem) => void;
    setUpdateDrawerVisit?: (value: boolean) => void;
    setLookDrawerVisit?: (value: boolean) => void;
  }
  interface AddGroupModalProps {
    isEdit: boolean;
    open: boolean;
    groupId?: number;
    values?: ModelAttributeGroup;
    onOpenChange: (value: boolean) => void;
  }
}
