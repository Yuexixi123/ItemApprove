import React from 'react';
import {
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
// import ApiSelectField from './ApiSelectField';
import dayjs from 'dayjs';
import pinyinMatch from 'pinyin-match';
import { timezoneList } from '@/pages/ModelPage/ModelManager/ModelDetails/ModelField/components/FieldTypeRender';
import { useModel } from '@umijs/max';

interface FormFieldRendererProps {
  formColumns: API.FormFieldConfig[];
}

const FormFieldRenderer: React.FC<FormFieldRendererProps> = ({ formColumns }) => {
  // 获取用户列表数据
  const { userOptions } = useModel('user', (model) => ({
    userOptions: model.userOptions,
  }));

  return (
    <>
      {formColumns.map((column) => {
        if (column.hideInForm) {
          return null;
        }

        const { name, title, valueType, required, options, disabled, defaultValue, originalType } =
          column;

        console.log(column, 'column');

        const key = name;
        const rules = required ? [{ required: true, message: '该项为必填项' }] : undefined;

        // 为每种类型创建特定的属性对象，避免类型冲突
        switch (valueType) {
          // case 'api':
          //   return (
          //     <ApiSelectField
          //       key={key}
          //       name={name}
          //       label={title}
          //       disabled={disabled}
          //       rules={rules}
          //       apiUrl={column.api_url}
          //     />
          //   );
          case 'select': {
            // 根据原始类型决定是否使用多选模式
            const isMultiSelect = originalType === 'enum_multi' || originalType === 'user_multi';

            // 处理多选字段的默认值
            let processedDefaultValue = defaultValue;
            if (isMultiSelect && defaultValue) {
              if (typeof defaultValue === 'string') {
                // 如果是字符串，按逗号分隔转换为数组
                processedDefaultValue = defaultValue
                  .split(',')
                  .map((v) => v.trim())
                  .filter((v) => v !== '');
              } else if (!Array.isArray(defaultValue)) {
                // 如果不是数组，转换为数组
                processedDefaultValue = [defaultValue];
              }
            }

            return (
              <ProFormSelect
                key={key}
                name={name}
                label={title}
                disabled={disabled}
                rules={rules}
                options={options}
                mode={isMultiSelect ? 'multiple' : undefined}
                initialValue={processedDefaultValue}
              />
            );
          }
          case 'date':
            return (
              <ProFormDatePicker
                key={key}
                name={name}
                label={title}
                disabled={disabled}
                rules={rules}
                initialValue={
                  defaultValue && defaultValue.trim() !== '' && dayjs(defaultValue).isValid()
                    ? dayjs(defaultValue)
                    : undefined
                }
                fieldProps={{
                  format: 'YYYY-MM-DD',
                }}
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
                initialValue={
                  defaultValue && defaultValue.trim() !== '' && dayjs(defaultValue).isValid()
                    ? dayjs(defaultValue)
                    : undefined
                }
                fieldProps={{
                  format: 'YYYY-MM-DD HH:mm:ss',
                  showTime: true,
                }}
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
                initialValue={defaultValue}
              />
            );
          case 'number_text':
          case 'digit':
            return (
              <ProFormDigit
                key={key}
                name={name}
                label={title}
                disabled={disabled}
                rules={rules}
                initialValue={defaultValue}
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
                initialValue={defaultValue}
              />
            );
          case 'switch':
            return (
              <ProFormSwitch
                initialValue={defaultValue !== undefined ? defaultValue : false}
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
                initialValue={defaultValue}
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
                initialValue={defaultValue}
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
                initialValue={defaultValue}
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
                initialValue={defaultValue}
              />
            );
          case 'timezone':
            return (
              <ProFormSelect
                key={key}
                name={name}
                disabled={disabled}
                label={title}
                rules={rules}
                showSearch
                options={timezoneList}
                initialValue={defaultValue}
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
                initialValue={defaultValue}
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
                showSearch
                options={userOptions}
                initialValue={defaultValue}
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
          case 'user_multi': {
            // 处理多选用户字段的默认值
            let processedUserMultiDefaultValue = defaultValue;
            if (defaultValue) {
              if (typeof defaultValue === 'string') {
                // 如果是字符串，按逗号分隔转换为数组
                processedUserMultiDefaultValue = defaultValue
                  .split(',')
                  .map((v) => v.trim())
                  .filter((v) => v !== '');
              } else if (!Array.isArray(defaultValue)) {
                // 如果不是数组，转换为数组
                processedUserMultiDefaultValue = [defaultValue];
              }
            }

            return (
              <ProFormSelect
                key={key}
                name={name}
                disabled={disabled}
                label={title}
                rules={rules}
                mode="multiple"
                showSearch
                options={userOptions}
                initialValue={processedUserMultiDefaultValue}
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
          }

          default:
            return (
              <ProFormText
                key={key}
                disabled={disabled}
                name={name}
                label={title}
                rules={rules}
                initialValue={defaultValue}
              />
            );
        }
      })}
    </>
  );
};

export default FormFieldRenderer;
