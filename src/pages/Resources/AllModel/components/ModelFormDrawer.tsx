// src/pages/AllModel/components/ModelFormDrawer/index.tsx
import ApiSelectField from './ApiSelectField';
import { useState, useEffect, useRef } from 'react';
import { Drawer, Spin, App } from 'antd';
import {
  ProForm,
  ProFormText,
  ProFormSelect,
  ProFormDatePicker,
  ProFormDigit,
  ProFormSwitch,
  ProFormRadio,
  ProFormCheckbox,
  ProFormRate,
  ProFormTextArea,
} from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { getModelResources, createModelResource, updateResource } from '@/services/resources/api';
// 移除 getModelAttributes 导入
import dayjs from 'dayjs';
import pinyinMatch from 'pinyin-match';
import { timezoneList } from '@/pages/ModelPage/ModelManager/ModelDetails/ModelField/components/FieldTypeRender';
import { useModel } from '@umijs/max';
import { mapAttributeTypeToValueType } from '@/models/monitoring';

// 使用自定义类型替代 ProFormColumnsType
// const fieldConfigCache = new Map<number, API.FormFieldConfig[]>();

const ModelFormDrawer = ({
  visible,
  onClose,
  mode,
  modelId,
  recordId,
  recordData,
  onSubmitSuccess,
}: API.ModelFormDrawerProps) => {
  const [formColumns, setFormColumns] = useState<API.FormFieldConfig[]>([]);
  const [metadataLoaded, setMetadataLoaded] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);
  const [processedData, setProcessedData] = useState<Record<string, any>>({});
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

  // 数据处理器
  const loadData = useRef<(finalData: any) => Promise<void>>(async () => {});

  useEffect(() => {
    loadData.current = async (finalData: any) => {
      try {
        const processed = Object.entries(finalData || {}).reduce((acc, [key, value]) => {
          if (typeof value === 'string' && value.match(/^\d{4}-\d{2}-\d{2}/)) {
            acc[key] = dayjs(value);
          } else {
            acc[key] = value;
          }
          return acc;
        }, {} as Record<string, any>);

        setProcessedData(processed);
        setDataLoaded(true);
      } catch (error) {
        message.error('数据处理失败');
        setDataLoaded(true);
      }
    };
  }, [message]);

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
          };
          console.log('fieldConfig', fieldConfig);

          console.log('field', field);

          if (field.attr_type === 'api' && field.option && Array.isArray(field.option)) {
            fieldConfig.api_url = field.option[0]?.api_url;
          }
          // 为枚举类型添加选项
          if (field.option) {
            if (Array.isArray(field.option)) {
              fieldConfig.options = field.option;
            }
          }

          return fieldConfig;
        });

        console.log('columns', columns);
        setFormColumns(columns);
        setMetadataLoaded(true);
      } catch (error) {
        message.error('表单配置加载失败');
        setMetadataLoaded(true);
      }
    };

    loadMetadata();
  }, [visible, modelId, modelAttributes]); // 添加 fetchModelAttributes 到依赖数组

  // 数据加载
  useEffect(() => {
    if (!visible || !metadataLoaded) return;

    const fetchData = async () => {
      let finalData = recordData;

      if (mode === 'edit' && !recordData && recordId) {
        // 使用新的 getModelResources 接口获取单个资源详情
        const res = await getModelResources(modelId, { id: recordId });
        if (res.data && res.data.data && res.data.data.length > 0) {
          finalData = res.data.data[0];
        }
      }

      loadData.current(finalData);
    };

    if (mode === 'create') {
      setDataLoaded(true);
      formRef.current?.resetFields();
    } else {
      fetchData();
    }
  }, [visible, metadataLoaded, mode, modelId, recordId, recordData]);

  // 数据更新到表单
  useEffect(() => {
    if (Object.keys(processedData).length > 0) {
      setTimeout(() => {
        formRef.current?.setFieldsValue(processedData);
      }, 50);
    }
  }, [processedData]);

  // 检查表单是否被修改
  const checkFormModified = () => {
    // 检查表单是否被触碰并且有实际的值变化
    if (!formRef.current?.isFieldsTouched()) {
      return false;
    }

    // 获取当前表单值和初始值进行比较
    const currentValues = formRef.current?.getFieldsValue();
    const initialValues = processedData;

    // 比较当前值和初始值是否有差异
    for (const key in currentValues) {
      // 处理日期类型的特殊比较
      if (dayjs.isDayjs(currentValues[key]) && dayjs.isDayjs(initialValues[key])) {
        if (!currentValues[key].isSame(initialValues[key])) {
          return true;
        }
      }
      // 处理普通值的比较
      else if (JSON.stringify(currentValues[key]) !== JSON.stringify(initialValues[key])) {
        return true;
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
          setDataLoaded(false);
          setProcessedData({});
          formRef.current?.resetFields();
          onClose();
        },
      });
    } else {
      // 没有修改，直接关闭
      setMetadataLoaded(false);
      setDataLoaded(false);
      setProcessedData({});
      formRef.current?.resetFields();
      onClose();
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      let result;

      if (mode === 'create') {
        // 使用新的 createModelResource 接口创建资源
        result = await createModelResource(modelId, values);
      } else {
        // 使用新的 updateResource 接口更新资源
        result = await updateResource(recordId!, values);
      }

      if (result.inside_code === 0) {
        message.success(`${mode === 'create' ? '创建' : '更新'}成功`);
        onSubmitSuccess?.();

        // 直接关闭表单，不触发修改确认
        setMetadataLoaded(false);
        setDataLoaded(false);
        setProcessedData({});
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

  const loading = !metadataLoaded || !dataLoaded;

  return (
    <Drawer
      title={`${mode === 'create' ? '新建' : '编辑'}记录`}
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
          {formColumns.map((column) => {
            // 如果 hideInForm 为 true，则不渲染该字段
            if (column.hideInForm) {
              return null;
            }

            const { name, title, valueType, required, options, disabled } = column;

            const key = name;
            const rules = required ? [{ required: true, message: '该项为必填项' }] : undefined;

            // 为每种类型创建特定的属性对象，避免类型冲突
            switch (valueType) {
              case 'api':
                return (
                  <ApiSelectField
                    key={key}
                    name={name}
                    label={title}
                    disabled={disabled}
                    rules={rules}
                    apiUrl={column.api_url}
                  />
                );
              case 'select':
                return (
                  <ProFormSelect
                    key={key}
                    name={name}
                    label={title}
                    disabled={disabled}
                    rules={rules}
                    options={options}
                  />
                );
              case 'date':
                return (
                  <ProFormDatePicker
                    key={key}
                    name={name}
                    label={title}
                    disabled={disabled}
                    rules={rules}
                    fieldProps={{ format: 'YYYY-MM-DD' }}
                  />
                );
              case 'dateTime':
                return (
                  <ProFormDatePicker
                    key={key}
                    name={name}
                    label={title}
                    disabled={disabled}
                    rules={rules}
                    fieldProps={{ format: 'YYYY-MM-DD HH:mm:ss', showTime: true }}
                  />
                );
              case 'textarea':
                return (
                  <ProFormTextArea
                    key={key}
                    name={name}
                    disabled={disabled}
                    label={title}
                    rules={rules}
                  />
                );
              case 'number_text':
                return (
                  <ProFormDigit
                    key={key}
                    name={name}
                    label={title}
                    disabled={disabled}
                    rules={rules}
                  />
                );
              case 'float':
                return (
                  <ProFormDigit
                    key={key}
                    name={name}
                    label={title}
                    disabled={disabled}
                    rules={rules}
                  />
                );
              case 'boolean':
                return (
                  <ProFormSwitch
                    initialValue={false}
                    key={key}
                    name={name}
                    disabled={disabled}
                    label={title}
                    rules={rules}
                  />
                );
              case 'radio':
                return (
                  <ProFormRadio.Group
                    key={key}
                    name={name}
                    disabled={disabled}
                    label={title}
                    rules={rules}
                    options={options}
                  />
                );
              case 'checkbox':
                return (
                  <ProFormCheckbox.Group
                    key={key}
                    name={name}
                    disabled={disabled}
                    label={title}
                    rules={rules}
                    options={options}
                  />
                );
              case 'rate':
                return (
                  <ProFormRate
                    key={key}
                    disabled={disabled}
                    name={name}
                    label={title}
                    rules={rules}
                  />
                );
              case 'long_text':
                return (
                  <ProFormTextArea
                    key={key}
                    disabled={disabled}
                    name={name}
                    label={title}
                    rules={rules}
                  />
                );
              case 'timezone':
                return (
                  <ProFormSelect
                    key={key}
                    name={name} // 修改这里，使用动态的name变量
                    disabled={disabled}
                    label={title}
                    rules={rules}
                    showSearch
                    initialValue={'Shanghai'}
                    options={timezoneList}
                    fieldProps={{
                      filterOption: (input, option) => {
                        return (
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase()) ||
                          !!pinyinMatch.match((option?.label ?? '').toString(), input)
                        );
                      },
                      virtual: true,
                      listHeight: 400,
                    }}
                  />
                );
              case 'password':
                return (
                  <ProFormText.Password
                    key={key}
                    disabled={disabled}
                    name={name}
                    label={title}
                    rules={rules}
                  />
                );
              case 'user':
                return (
                  <ProFormSelect
                    key={key}
                    name={name}
                    disabled={disabled}
                    label={title}
                    rules={rules}
                    options={userOptions}
                    fieldProps={{
                      filterOption: (input, option) => {
                        return (
                          (option?.label ?? '').toLowerCase().includes(input.toLowerCase()) ||
                          !!pinyinMatch.match((option?.label ?? '').toString(), input)
                        );
                      },
                      virtual: true,
                      listHeight: 400,
                    }}
                  />
                );

              default:
                return (
                  <ProFormText
                    key={key}
                    disabled={disabled}
                    name={name}
                    label={title}
                    rules={rules}
                  />
                );
            }
          })}
        </ProForm>
      </Spin>
    </Drawer>
  );
};

export default ModelFormDrawer;
