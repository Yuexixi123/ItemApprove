import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Spin, App } from 'antd';
import { ProForm } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { createModelResource } from '@/services/resources/api';
import { useModel } from '@umijs/max';
import { mapAttributeTypeToValueType } from '@/models/monitoring';
import FormFieldRenderer from './FormFieldRenderer';

interface CreateFormDrawerProps {
  visible: boolean;
  onClose: () => void;
  modelId: number;
  onSubmitSuccess?: () => void;
}

const CreateFormDrawer: React.FC<CreateFormDrawerProps> = ({
  visible,
  onClose,
  modelId,
  onSubmitSuccess,
}) => {
  const [formColumns, setFormColumns] = useState<API.FormFieldConfig[]>([]);
  const [metadataLoaded, setMetadataLoaded] = useState(false);
  const formRef = useRef<ProFormInstance>();
  const { message, modal } = App.useApp();

  // 使用 resource model
  const { modelAttributes } = useModel('resource', (model) => ({
    modelAttributes: model.modelAttributes,
  }));

  // 获取用户列表数据
  const { userOptions } = useModel('user', (model) => ({
    userOptions: model.userOptions,
  }));

  // 字段配置加载
  useEffect(() => {
    if (!visible || !modelId) return;

    const loadMetadata = async () => {
      try {
        const columns = modelAttributes.map((field) => {
          // 使用自定义类型创建字段配置
          const fieldConfig: API.FormFieldConfig = {
            name: field.attr_key,
            title: field.attr_name,
            valueType: mapAttributeTypeToValueType(field.attr_type),
            required: field.is_required,
            disabled: !field.editable,
            hideInForm: !field.is_form_show,
            defaultValue: field.attr_default,
            originalType: field.attr_type, // 添加原始类型信息
            regxp: '', // 初始化正则表达式为空字符串
          };

          if (field.attr_type === 'api' && field.option && Array.isArray(field.option)) {
            fieldConfig.api_url = field.option[0]?.api_url;
          }
          // 为用户类型添加选项
          if (field.attr_type === 'user' || field.attr_type === 'user_multi') {
            fieldConfig.options = userOptions.map((option) => ({
              label: option.label,
              value: option.value.toString(),
            }));
          }
          // 为枚举类型添加选项
          else if (field.option) {
            if (Array.isArray(field.option)) {
              fieldConfig.options = field.option;

              // 提取正则配置
              const firstOption = field.option[0];
              if (firstOption && firstOption.regxp) {
                fieldConfig.regxp = firstOption.regxp;
              }
            }
          }

          return fieldConfig;
        });

        setFormColumns(columns);
        setMetadataLoaded(true);
      } catch (error) {
        message.error('表单配置加载失败');
        setMetadataLoaded(true);
      }
    };

    loadMetadata();
  }, [visible, modelId, modelAttributes, userOptions, message]);

  // 检查表单是否被修改
  const checkFormModified = () => {
    // 检查表单是否被触碰
    if (!formRef.current?.isFieldsTouched()) {
      return false;
    }

    // 获取当前表单值
    const currentValues = formRef.current?.getFieldsValue();

    // 检查是否有非空值
    for (const key in currentValues) {
      if (currentValues.hasOwnProperty(key)) {
        const value = currentValues[key];
        if (value !== undefined && value !== null && value !== '') {
          return true;
        }
      }
    }

    return false;
  };

  const handleClose = () => {
    if (checkFormModified()) {
      modal.confirm({
        title: '确认离开当前页？',
        content: '离开将会导致未保存信息丢失',
        okText: '离开',
        cancelText: '取消',
        onOk: () => {
          // 确认离开
          setMetadataLoaded(false);
          formRef.current?.resetFields();
          onClose();
        },
      });
    } else {
      // 没有修改，直接关闭
      setMetadataLoaded(false);
      formRef.current?.resetFields();
      onClose();
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const result = await createModelResource(modelId, values);

      if (result.inside_code === 0) {
        message.success('创建成功');
        onSubmitSuccess?.();
        setMetadataLoaded(false);
        formRef.current?.resetFields();
        onClose();
      } else {
        message.error(`提交失败: ${result.msg || '未知错误'}`);
      }
    } catch (error) {
      message.error('提交失败');
      console.error('提交错误:', error);
    }
  };

  const loading = !metadataLoaded;

  return (
    <Drawer
      title="新建记录"
      width={600}
      open={visible}
      onClose={handleClose}
      destroyOnClose
      forceRender
    >
      <Spin spinning={loading}>
        <ProForm
          formRef={formRef}
          onFinish={handleSubmit}
          submitter={{
            resetButtonProps: { style: { display: 'none' } },
            submitButtonProps: { style: { width: '100px' } },
          }}
        >
          <FormFieldRenderer formColumns={formColumns} />
        </ProForm>
      </Spin>
    </Drawer>
  );
};

export default CreateFormDrawer;
