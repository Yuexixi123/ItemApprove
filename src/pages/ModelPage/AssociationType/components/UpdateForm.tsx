import {
  ProFormInstance,
  ProFormText,
  ActionType,
  ProFormRadio,
  ProFormTextArea,
} from '@ant-design/pro-components';
import ConfirmDrawer from '@/components/ConfirmDrawer';
import { useEffect, useRef } from 'react';
import { useTableUpdate } from '@/hooks/useTableUpdate';
import { useTableCreate } from '@/hooks/useTableCreate';
import { createAssociationType, updateAssociationType } from '@/services/association-type/api';

interface UpdateFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  values?: API.AssociationType;
  setRow?: (row: API.AssociationType | undefined) => void;
  actionRef: React.MutableRefObject<ActionType | undefined>;
}

const UpdateForm = ({
  open,
  setOpen,
  title = '新建关联类型',
  values,
  setRow,
  actionRef,
}: UpdateFormProps) => {
  const formRef = useRef<ProFormInstance>();

  // 使用 useTableCreate hook 处理创建操作
  const handleCreate = useTableCreate();

  // 使用 useTableUpdate hook 处理更新操作
  const handleUpdate = useTableUpdate();

  useEffect(() => {
    // 当 values 变化时，更新表单字段值
    formRef.current?.resetFields();
    if (values && formRef.current) {
      formRef.current?.setFieldsValue(values);
    }
  }, [values, formRef?.current]);

  // 处理表单提交
  const handleFinish = async (formValues: Record<string, any>) => {
    try {
      if (values?.id) {
        // 如果有 asst_id，说明是编辑操作
        const updateApiWrapper = (data: any) => {
          // 确保包含asst_id
          return updateAssociationType(values.id, {
            ...data,
          });
        };
        await handleUpdate({
          api: updateApiWrapper,
          data: formValues,
          onSuccess: () => {
            setOpen(false);
            // 更新行数据
            setRow?.({
              ...values,
              ...formValues,
            });
            actionRef?.current?.reload();
          },
        });
      } else {
        // 否则是创建操作
        await handleCreate({
          api: createAssociationType,
          data: formValues as API.AssociationType,
          onSuccess: () => {
            setOpen(false);
            actionRef?.current?.reload();
          },
        });
      }
      return true;
    } catch (error) {
      console.error('提交失败:', error);
      return false;
    }
  };

  return (
    <ConfirmDrawer
      onOpenChange={setOpen}
      title={title}
      formRef={formRef}
      open={open}
      initialValues={values ?? {}}
      onFinish={handleFinish}
    >
      <ProFormText
        name="asst_key"
        label="唯一标识"
        placeholder="请输入英文标识"
        rules={[
          { required: true, message: '该字段是必填项！' },
          {
            pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
            message: '唯一标识必须以英文字母开头，只能包含英文、数字和下划线',
          },
        ]}
      />
      <ProFormText
        name="asst_name"
        label="名称"
        placeholder="请输入名称"
        rules={[{ required: true, message: '该字段是必填项！' }]}
      />
      <ProFormText
        name="src_desc"
        label="源->目标描述"
        placeholder="请输入关联描述如：链接、运行"
        rules={[{ required: true, message: '该字段是必填项！' }]}
      />
      <ProFormText
        name="dest_desc"
        label="目标->源描述"
        placeholder="请输入关联描述如：属于、上联"
        rules={[{ required: true, message: '该字段是必填项！' }]}
      />
      {/* <ProFormText name='count' label='使用数' /> */}
      <ProFormRadio.Group
        name="direction"
        label="方向"
        options={[
          {
            label: '有，源指向目标',
            value: 'src_to_dest',
          },
          {
            label: '无方向',
            value: 'none',
          },
          {
            label: '双向',
            value: 'cbidirectional',
          },
        ]}
      />
      <ProFormTextArea name="desc" label="描述" />
    </ConfirmDrawer>
  );
};

export default UpdateForm;
