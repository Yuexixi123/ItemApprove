import { PlusOutlined } from '@ant-design/icons';
import '../index.css';
import GroupModel from './GroupModal';

type AddGroupProps = {
  editOpen: boolean;
  setEditOpen: (open: boolean) => void;
  currentGroupId?: number;
  values?: ModelField.ModelAttributeGroup;
};

const AddGroup = (props: AddGroupProps) => {
  const { editOpen, setEditOpen, currentGroupId, values } = props;

  const handleAddGroup = () => {
    setEditOpen(true);
  };

  return (
    <div
      className="add-group"
      onClick={handleAddGroup}
      style={{ margin: '10px 0 0', cursor: 'pointer' }}
    >
      <PlusOutlined />
      <span className="ml8">添加分组</span>
      <GroupModel
        open={editOpen}
        onOpenChange={setEditOpen}
        groupId={currentGroupId}
        isEdit={Boolean(currentGroupId)}
        values={values}
      />
    </div>
  );
};

export default AddGroup;
