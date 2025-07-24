import { ModalForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Form, Tooltip } from 'antd';
import { InfoCircleOutlined } from '@ant-design/icons';
import IconSelect from '@/components/IconSelect';
import { useModel } from '@umijs/max';
import { createModel } from '@/services/model-api/model-manage';
import { useTableCreate } from '@/hooks/useTableCreate';
import { useEffect } from 'react';
/**
 * 等待指定时间
 * @param time 等待时间(毫秒)
 * @returns Promise
 */

/**
 * 创建模型组件
 * @param props 组件属性
 * @returns React组件
 */
const CreateModel: React.FC<ModelManager.CreateModelProps> = (props) => {
  const { open, onOpenChange, values } = props;

  const [form] = Form.useForm<API.CreateModelRequest>();

  // 使用 useTableCreate hook
  const handleCreate = useTableCreate();

  // 获取分组选项
  const { groupOptions, refreshData } = useModel('modelPage', (model) => {
    return {
      groupOptions: model.groupOptions,
      refreshData: model.refreshData,
    };
  });

  // 当弹窗打开且有预设值时，设置表单默认值
  useEffect(() => {
    if (open && values && values.modelgroup_id) {
      form.setFieldValue('modelgroup_id', values.modelgroup_id);
    }
  }, [open, values, form]);

  return (
    <ModalForm<API.CreateModelRequest>
      width={700}
      title="新建模型"
      open={open}
      onOpenChange={onOpenChange}
      form={form}
      autoFocusFirstInput
      modalProps={{
        destroyOnClose: true,
      }}
      submitTimeout={2000}
      onFinish={async (values) => {
        // 使用 handleCreate 处理创建逻辑
        const success = await handleCreate({
          api: createModel,
          data: values,
          successMsg: '模型创建成功',
          errorMsg: '模型创建失败',
          onSuccess: () => {
            // 刷新模型列表
            refreshData();
          },
        });

        return success;
      }}
    >
      <Form.Item
        name="model_icon"
        label="图标"
        rules={[{ required: true, message: '该图标是必填项！' }]}
        initialValue="AccountBookOutlined"
      >
        <IconSelect />
      </Form.Item>
      <ProFormSelect
        name="modelgroup_id"
        label="所属分组"
        options={groupOptions}
        rules={[{ required: true, message: '该字段是必填项！' }]}
      />
      <ProFormText
        name="model_key"
        label="唯一标识"
        fieldProps={{
          suffix: (
            <Tooltip title="可使用英文、数字、下划线，需以字母开头">
              <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
            </Tooltip>
          ),
        }}
        rules={[{ required: true, message: '该字段是必填项！' }]}
      />
      <ProFormText
        name="model_name"
        label="名称"
        fieldProps={{
          suffix: (
            <Tooltip title="请填写模型名">
              <InfoCircleOutlined style={{ color: 'rgba(0,0,0,.45)' }} />
            </Tooltip>
          ),
        }}
        rules={[{ required: true, message: '该字段是必填项！' }]}
      />
    </ModalForm>
  );
};

export default CreateModel;
