declare namespace ModelManager {
  interface Model {
    modelgroup_name: string;
    model_icon: string;
    model_id: number;
    model_key: string;
    model_name: string;
    is_active: boolean;
    is_builtin: string;
    create_name: string;
    create_time: string;
    update_name: string;
    update_time: string;
  }

  interface GroupItem {
    modelgroup_id: number;
    modelgroup_key: string;
    modelgroup_name: string;
    models: Model[];
  }

  interface GroupListProps {
    safeModelList: GroupItem[];
    loading: boolean;
    setRow: (item: GroupItem) => void;
    setModelVisitor: React.Dispatch<React.SetStateAction<boolean>>;
    setEditGroupVisitor: React.Dispatch<React.SetStateAction<boolean>>;
  }

  interface ModelListProps {
    item: GroupItem;
    setRow: (item: GroupItem) => void;
    setModelVisitor: React.Dispatch<React.SetStateAction<boolean>>;
    setEditGroupVisitor: React.Dispatch<React.SetStateAction<boolean>>;
  }

  interface CreateModelProps {
    title?: string;
    open: boolean;
    actionRef?: React.MutableRefObject<ActionType | undefined>;
    values?: any;
    onOpenChange: (open: boolean) => void;
  }
}
