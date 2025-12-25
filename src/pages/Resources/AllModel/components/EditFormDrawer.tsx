import React, { useState, useEffect, useRef } from 'react';
import { Drawer, Spin, App } from 'antd';
import { ProForm } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { updateResource, getResourceDetail } from '@/services/resources/api';
import { useModel } from '@umijs/max';
import { mapAttributeTypeToValueType } from '@/models/monitoring';
import dayjs from 'dayjs';
import FormFieldRenderer from './FormFieldRenderer';

interface EditFormDrawerProps {
  visible: boolean;
  onClose: () => void;
  modelId: number;
  recordId: number;
  onSubmitSuccess?: () => void;
}

const EditFormDrawer: React.FC<EditFormDrawerProps> = ({
  visible,
  onClose,
  modelId,
  recordId,
  onSubmitSuccess,
}) => {
  const [formColumns, setFormColumns] = useState<API.FormFieldConfig[]>([]);
  const [metadataLoaded, setMetadataLoaded] = useState(false);
  const [initialValues, setInitialValues] = useState<any>({});
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

  // 数据处理函数
  const loadData = useRef((data: any, attributes: any[]) => {
    const processedData: any = {};

    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const value = data[key];

        // 找到对应的字段属性
        const fieldAttr = attributes.find((attr) => attr.attr_key === key);

        // 处理多选枚举和多选用户字段
        if (
          fieldAttr &&
          (fieldAttr.attr_type === 'enum_multi' || fieldAttr.attr_type === 'user_multi')
        ) {
          if (value === null || value === undefined || value === '') {
            processedData[key] = [];
          } else if (Array.isArray(value)) {
            processedData[key] = value;
          } else if (typeof value === 'string') {
            // 如果是字符串，尝试按逗号分隔转换为数组
            processedData[key] = value
              .split(',')
              .map((v) => v.trim())
              .filter((v) => v !== '');
          } else {
            processedData[key] = [value];
          }
        }
        // 处理日期字段
        else if (typeof value === 'string' && value !== '' && /^\d{4}-\d{2}-\d{2}/.test(value)) {
          const dayjsValue = dayjs(value);
          processedData[key] = dayjsValue.isValid() ? dayjsValue : undefined;
        } else if (value === '') {
          // 空字符串设为 undefined，避免显示 Invalid Date
          processedData[key] = undefined;
        } else {
          processedData[key] = value;
        }
      }
    }

    return processedData;
  });

  // 字段配置和数据加载
  useEffect(() => {
    if (!visible || !modelId || !recordId) return;

    const loadMetadata = async () => {
      try {
        // 加载字段配置
        const columns = modelAttributes.map((field) => {
          const fieldConfig: API.FormFieldConfig = {
            name: field.attr_key,
            title: field.attr_name,
            valueType: mapAttributeTypeToValueType(field.attr_type),
            originalType: field.attr_type,
            required: field.is_required,
            disabled: !field.editable,
            hideInForm: !field.is_form_show,
            // 编辑模式下不使用defaultValue，使用实际数据值
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
            }
          }

          return fieldConfig;
        });

        setFormColumns(columns);

        // 加载记录数据
        const response = await getResourceDetail({ resource_id: recordId, model_id: modelId });
        if (response.inside_code === 0) {
          const processedData = loadData.current(response.data, modelAttributes);
          setInitialValues(processedData);
          formRef.current?.setFieldsValue(processedData);
        } else {
          message.error('数据加载失败');
        }

        setMetadataLoaded(true);
      } catch (error) {
        message.error('数据加载失败');
        setMetadataLoaded(true);
      }
    };

    loadMetadata();
  }, [visible, modelId, recordId, modelAttributes, userOptions, message]);

  // 检查表单是否被修改
  const checkFormModified = () => {
    if (!formRef.current?.isFieldsTouched()) {
      return false;
    }

    const currentValues = formRef.current?.getFieldsValue();

    // 比较当前值与初始值
    for (const key in currentValues) {
      if (currentValues.hasOwnProperty(key)) {
        const currentValue = currentValues[key];
        const initialValue = initialValues[key];

        // 处理 dayjs 对象的比较
        if (dayjs.isDayjs(currentValue) && dayjs.isDayjs(initialValue)) {
          if (!currentValue.isSame(initialValue)) {
            return true;
          }
        } else if (currentValue !== initialValue) {
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
          setMetadataLoaded(false);
          setInitialValues({});
          formRef.current?.resetFields();
          onClose();
        },
      });
    } else {
      setMetadataLoaded(false);
      setInitialValues({});
      formRef.current?.resetFields();
      onClose();
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const result = await updateResource(recordId, values);

      if (result.inside_code === 0) {
        message.success('更新成功');
        onSubmitSuccess?.();
        setMetadataLoaded(false);
        setInitialValues({});
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
      title="编辑记录"
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

export default EditFormDrawer;
