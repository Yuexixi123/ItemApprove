import { ModalForm, ProFormText } from '@ant-design/pro-components';
import { Form } from 'antd';
import { useEffect } from 'react';
import { createModelGroup, updateModelGroup } from '@/services/model-api/model-group';
import { useTableCreate } from '@/hooks/useTableCreate';
import { useTableUpdate } from '@/hooks/useTableUpdate';
import { useModel } from '@umijs/max';

const CreateGroups: React.FC<ModelManager.CreateModelProps> = (props) => {
  const { open, onOpenChange, title, values, actionRef } = props;

  const [form] = Form.useForm();
  const handleCreate = useTableCreate();
  const handleUpdate = useTableUpdate();

  const { fetchModels } = useModel('modelPage', (model) => ({ fetchModels: model.fetchModels }));

  // 移除 console.log

  // 修改 useEffect，添加 open 作为依赖项，并调整重置和设置表单值的逻辑
  useEffect(() => {
    // 当弹窗打开时，处理表单数据
    if (open) {
      // 先重置表单
      form.resetFields();

      // 如果有值，则设置表单值
      if (values) {
        // 使用 setTimeout 确保在下一个事件循环中设置值，避免与重置冲突
        form.setFieldsValue(values);
      }
    }
  }, [open, values, form]);

  return (
    <ModalForm
      width={500}
      form={form}
      title={title}
      open={open}
      onOpenChange={onOpenChange}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
        forceRender: true,
        onCancel: () => console.log('run'),
      }}
      submitTimeout={2000}
      onFinish={async (value) => {
        if (values) {
          // 编辑模式
          return handleUpdate({
            api: (data) => updateModelGroup(values.modelgroup_id, data),
            data: value,
            actionRef,
            successMsg: '编辑分组成功',
            onSuccess: () => {
              fetchModels();
            },
          });
        }
        // 新增模式
        return handleCreate({
          api: createModelGroup,
          data: value,
          actionRef,
          successMsg: '创建分组成功',
          onSuccess: () => {
            fetchModels();
          },
        });
      }}
    >
      <ProFormText
        name="modelgroup_key"
        label="唯一标识"
        rules={[
          { required: true, message: '该字段是必填项！' },
          {
            pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
            message: '唯一标识必须以英文字母开头，只能包含英文、数字和下划线',
          },
        ]}
        disabled={!!values} // 编辑模式下禁用唯一标识字段
      />
      <ProFormText
        name="modelgroup_name"
        label="名称"
        rules={[{ required: true, message: '该字段是必填项！' }]}
      />
    </ModalForm>
  );
};

export default CreateGroups;
