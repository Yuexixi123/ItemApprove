import { ProFormInstance, ModalForm, ProFormSwitch, ProFormText } from '@ant-design/pro-components';
import { App } from 'antd';
import { useEffect, useRef } from 'react';
import { createAttributeGroup, updateAttributeGroup } from '@/services/model-api/attribute';
import { useModel, useParams } from '@umijs/max';
import { useTableCreate } from '@/hooks/useTableCreate';
import { useTableUpdate } from '@/hooks/useTableUpdate';

const GroupModal = (props: ModelField.AddGroupModalProps) => {
  const { message } = App.useApp();
  const { open, onOpenChange, isEdit, values } = props;

  const formRef = useRef<ProFormInstance>();

  const params = useParams<{ id: string }>(); // 从URL路径获取modelId
  const modelId = Number(params.id);
  // 获取刷新模型属性的方法
  const { fetchModelAttributes } = useModel('modelDetails', (modelDetails) => {
    return {
      fetchModelAttributes: modelDetails.fetchModelAttributes,
    };
  });

  // 使用hooks处理创建和更新操作
  const handleCreate = useTableCreate();
  const handleUpdate = useTableUpdate();

  useEffect(() => {
    if (values && formRef.current) {
      formRef.current?.setFieldsValue(values);
    } else {
      formRef.current?.resetFields();
    }
  }, [values, formRef.current, open]);

  return (
    <ModalForm<ModelField.ModelAttributeGroup>
      width={500}
      title={isEdit ? '编辑分组' : '新增分组'}
      open={open}
      onOpenChange={onOpenChange}
      formRef={formRef}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
      }}
      submitTimeout={2000}
      onFinish={async (formValues) => {
        try {
          // 处理表单数据，将 is_collapse 转换为数字
          const processedData = {
            ...formValues,
            is_collapse: formValues.is_collapse,
          };

          if (isEdit && values?.attrgroup_id) {
            // 编辑模式
            const updateResult = await handleUpdate({
              api: (data) => updateAttributeGroup(values.attrgroup_id, data),
              data: processedData,
              successMsg: '更新分组成功',
              errorMsg: '更新分组失败',
              onSuccess: () => {
                fetchModelAttributes();
              },
            });
            return updateResult;
          } else {
            // 创建模式
            if (!modelId) {
              message.error('缺少必要参数：模型ID');
              return false;
            }

            const createResult = await handleCreate({
              api: (data) => createAttributeGroup(data),
              data: { ...processedData, model_id: modelId },
              successMsg: '创建分组成功',
              errorMsg: '创建分组失败',
              onSuccess: () => {
                fetchModelAttributes();
              },
            });
            return createResult;
          }
        } catch (error) {
          console.error('操作失败:', error);
          return false;
        }
      }}
    >
      <ProFormText
        name="attrgroup_name"
        label="分组名称"
        rules={[{ required: true, message: '请输入分组名称' }]}
      />
      <ProFormSwitch name="is_collapse" label="是否默认折叠" />
    </ModalForm>
  );
};

export default GroupModal;
