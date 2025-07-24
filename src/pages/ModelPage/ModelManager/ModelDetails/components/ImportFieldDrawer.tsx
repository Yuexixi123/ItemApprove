import { DrawerForm, ProFormUploadDragger } from '@ant-design/pro-components';
import { App } from 'antd';
const ImportFieldDrawer = ({
  open,
  setOpen,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
}) => {
  const { message } = App.useApp();

  const handleFinish = async (values: any) => {
    console.log(values);
    message.success('导入成功');
    return true;
  };

  return (
    <DrawerForm title="导入字段" open={open} onOpenChange={setOpen} onFinish={handleFinish}>
      <ProFormUploadDragger name="file" />
    </DrawerForm>
  );
};

export default ImportFieldDrawer;
