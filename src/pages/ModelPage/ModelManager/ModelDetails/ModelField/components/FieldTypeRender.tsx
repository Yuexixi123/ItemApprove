import {
  ProFormDatePicker,
  ProFormDateTimePicker,
  ProFormDigit,
  ProFormSelect,
  ProFormSwitch,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import '../index.less';
import React, { useState } from 'react';
import pinyinMatch from 'pinyin-match';
import { useModel } from '@umijs/max';
import { Button, Input, Space, App } from 'antd';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';

export const timezoneList = [
  // 亚洲
  { label: '上海 (Asia/Shanghai)', value: 'Shanghai' },
  { label: '香港 (Asia/Hong_Kong)', value: 'Hong_Kong' },
  { label: '台北 (Asia/Taipei)', value: 'Taipei' },
  { label: '东京 (Asia/Tokyo)', value: 'Tokyo' },
  { label: '首尔 (Asia/Seoul)', value: 'Seoul' },
  { label: '新加坡 (Asia/Singapore)', value: 'Singapore' },
  { label: '曼谷 (Asia/Bangkok)', value: 'Bangkok' },
  { label: '迪拜 (Asia/Dubai)', value: 'Dubai' },
  { label: '雅加达 (Asia/Jakarta)', value: 'Jakarta' },
  { label: '孟买 (Asia/Kolkata)', value: 'Kolkata' },
  { label: '吉隆坡 (Asia/Kuala_Lumpur)', value: 'Kuala_Lumpur' },
  { label: '马尼拉 (Asia/Manila)', value: 'Manila' },
  { label: '大阪 (Asia/Osaka)', value: 'Osaka' },
  { label: '利雅得 (Asia/Riyadh)', value: 'Riyadh' },
  { label: '特拉维夫 (Asia/Tel_Aviv)', value: 'Tel_Aviv' },

  // 欧洲
  { label: '伦敦 (Europe/London)', value: 'London' },
  { label: '巴黎 (Europe/Paris)', value: 'Paris' },
  { label: '柏林 (Europe/Berlin)', value: 'Berlin' },
  { label: '莫斯科 (Europe/Moscow)', value: 'Moscow' },
  { label: '阿姆斯特丹 (Europe/Amsterdam)', value: 'Amsterdam' },
  { label: '雅典 (Europe/Athens)', value: 'Athens' },
  { label: '布鲁塞尔 (Europe/Brussels)', value: 'Brussels' },
  { label: '哥本哈根 (Europe/Copenhagen)', value: 'Copenhagen' },
  { label: '都柏林 (Europe/Dublin)', value: 'Dublin' },
  { label: '赫尔辛基 (Europe/Helsinki)', value: 'Helsinki' },
  { label: '伊斯坦布尔 (Europe/Istanbul)', value: 'Istanbul' },
  { label: '里斯本 (Europe/Lisbon)', value: 'Lisbon' },
  { label: '马德里 (Europe/Madrid)', value: 'Madrid' },
  { label: '奥斯陆 (Europe/Oslo)', value: 'Oslo' },
  { label: '罗马 (Europe/Rome)', value: 'Rome' },
  { label: '斯德哥尔摩 (Europe/Stockholm)', value: 'Stockholm' },
  { label: '华沙 (Europe/Warsaw)', value: 'Warsaw' },
  { label: '苏黎世 (Europe/Zurich)', value: 'Zurich' },

  // 北美洲
  { label: '纽约 (America/New_York)', value: 'New_York' },
  { label: '洛杉矶 (America/Los_Angeles)', value: 'Los_Angeles' },
  { label: '芝加哥 (America/Chicago)', value: 'Chicago' },
  { label: '多伦多 (America/Toronto)', value: 'Toronto' },
  { label: '温哥华 (America/Vancouver)', value: 'Vancouver' },
  { label: '墨西哥城 (America/Mexico_City)', value: 'Mexico_City' },
  { label: '迈阿密 (America/Miami)', value: 'Miami' },
  { label: '丹佛 (America/Denver)', value: 'Denver' },
  { label: '凤凰城 (America/Phoenix)', value: 'Phoenix' },
  { label: '休斯顿 (America/Houston)', value: 'Houston' },

  // 南美洲
  { label: '圣保罗 (America/Sao_Paulo)', value: 'Sao_Paulo' },
  { label: '布宜诺斯艾利斯 (America/Argentina/Buenos_Aires)', value: 'Buenos_Aires' },
  { label: '里约热内卢 (America/Rio_de_Janeiro)', value: 'Rio_de_Janeiro' },
  { label: '利马 (America/Lima)', value: 'Lima' },
  { label: '圣地亚哥 (America/Santiago)', value: 'Santiago' },
  { label: '波哥大 (America/Bogota)', value: 'Bogota' },

  // 非洲
  { label: '开罗 (Africa/Cairo)', value: 'Cairo' },
  { label: '开普敦 (Africa/Johannesburg)', value: 'Johannesburg' },
  { label: '内罗毕 (Africa/Nairobi)', value: 'Nairobi' },
  { label: '拉各斯 (Africa/Lagos)', value: 'Lagos' },
  { label: '卡萨布兰卡 (Africa/Casablanca)', value: 'Casablanca' },

  // 大洋洲
  { label: '悉尼 (Australia/Sydney)', value: 'Sydney' },
  { label: '墨尔本 (Australia/Melbourne)', value: 'Melbourne' },
  { label: '奥克兰 (Pacific/Auckland)', value: 'Auckland' },
  { label: '斐济 (Pacific/Fiji)', value: 'Fiji' },
  { label: '夏威夷 (Pacific/Honolulu)', value: 'Honolulu' },
];

interface FieldTypeRenderProps {
  fieldType: ModelField.FieldType;
  onOptionsChange?: (options: Record<string, any>) => void;
  values?: Record<string, any>;
}

const FieldTypeRender = ({ fieldType, onOptionsChange, values }: FieldTypeRenderProps) => {
  // 添加状态管理多选默认值
  const [multiDefaultValue, setMultiDefaultValue] = useState<string[]>(
    Array.isArray(values?.attr_default) ? values.attr_default : [],
  );
  // 添加本地状态来跟踪当前的选项值
  const [currentOptions, setCurrentOptions] = useState<Record<string, any>>({});
  // 使用 userModel 获取用户列表
  const { userOptions } = useModel('user', (model) => ({
    userOptions: model.userOptions,
  }));

  const { message } = App.useApp();

  // 初始化currentOptions
  React.useEffect(() => {
    if (values?.option?.[0]) {
      setCurrentOptions(values.option[0]);
    }
  }, [values]);

  // 用于收集字段值变化的函数（保留用于其他字段类型）
  // const handleFieldChange = (fieldName: string, value: any) => {
  //   if (onOptionsChange && fieldName !== 'attr_default') {
  //     onOptionsChange({ [fieldName]: value });
  //   }
  // };

  // 枚举值状态管理
  const [enumValues, setEnumValues] = useState<{ value: string; label: string }[]>(
    values?.option
      ? Array.isArray(values.option)
        ? values.option.map((item: { value: string; label: string }) => ({
            value: item.value,
            label: item.label,
          }))
        : []
      : [{ value: '', label: '' }],
  );

  // 处理添加枚举值
  const handleAddEnumValue = () => {
    // 检查最后一个枚举值是否为空
    const lastItem = enumValues[enumValues.length - 1];
    if (!lastItem.value || !lastItem.label) {
      message.warning('请先填写当前枚举值的ID和值');
      return;
    }
    setEnumValues([...enumValues, { value: '', label: '' }]);
  };

  // 处理删除枚举值
  const handleRemoveEnumValue = (index: number) => {
    const newValues = [...enumValues];
    newValues.splice(index, 1);
    setEnumValues(newValues);

    // 更新选项
    if (onOptionsChange) {
      onOptionsChange(newValues);
    }
  };

  // 处理枚举值变化
  const handleEnumValueChange = (index: number, field: 'value' | 'label', value: string) => {
    const newValues = [...enumValues];
    newValues[index][field] = value;
    setEnumValues(newValues);

    // 更新选项
    if (onOptionsChange) {
      onOptionsChange(newValues);
    }
  };

  // 获取有效的枚举选项（过滤掉空ID和空值的选项）
  const getValidEnumOptions = () => {
    return enumValues.filter((item) => item.value && item.label);
  };

  if (fieldType === 'text') {
    const regxp = values?.option?.[0]?.regxp || '';

    // 处理文本类型字段的选项变更
    const handleTextFieldChange = (fieldName: string, value: any) => {
      if (onOptionsChange) {
        // 使用本地状态来获取当前的选项值，确保不会丢失其他字段
        const newOptions = {
          ...currentOptions,
          [fieldName]: value,
        };
        // 更新本地状态
        setCurrentOptions(newOptions);
        // 直接传递完整的选项对象，而不是嵌套的对象
        onOptionsChange([newOptions]);
      }
    };

    return (
      <div className="field-detail">
        <ProFormTextArea
          name="regxp"
          label="正则校验"
          placeholder="请输入"
          initialValue={regxp}
          fieldProps={{
            onChange: (e) => handleTextFieldChange('regxp', e.target.value),
          }}
          disabled={!!values?.attr_id && values?.is_builtin} // 如果是编辑模式，禁用该字段
        />
        <ProFormText
          name="attr_default"
          label="默认值"
          placeholder="请输入短字符"
          disabled={!!values?.attr_id && values?.is_builtin} // 如果是编辑模式，禁用该字段
        />
      </div>
    );
  }

  if (fieldType === 'user') {
    return (
      <div className="field-detail">
        <ProFormSelect
          name="attr_default"
          label="默认值"
          showSearch
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
          disabled={!!values?.attr_id && values?.is_builtin} // 如果是编辑模式，禁用该字段
        />
      </div>
    );
  }

  if (fieldType === 'user_multi') {
    return (
      <div className="field-detail">
        <ProFormSelect
          name="attr_default"
          label="默认值"
          showSearch
          mode="multiple"
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
          disabled={!!values?.attr_id && values?.is_builtin} // 如果是编辑模式，禁用该字段
        />
      </div>
    );
  }

  if (fieldType === 'number' || fieldType === 'float') {
    // 从 currentOptions 中获取 min_value 和 max_value
    const minValue = currentOptions?.min_value || values?.option?.[0]?.min_value || '';
    const maxValue = currentOptions?.max_value || values?.option?.[0]?.max_value || '';

    // 处理数字类型字段的选项变更
    const handleNumberFieldChange = (fieldName: string, value: any) => {
      if (onOptionsChange) {
        // 使用本地状态来获取当前的选项值，确保不会丢失其他字段
        const newOptions = {
          ...currentOptions,
          [fieldName]: value,
        };
        // 更新本地状态
        setCurrentOptions(newOptions);
        // 直接传递完整的选项对象，而不是嵌套的对象
        onOptionsChange([newOptions]);
      }
    };

    return (
      <div className="field-detail">
        <ProFormText
          name="min_value"
          label="最小值"
          placeholder="请输入短字符"
          initialValue={minValue}
          fieldProps={{
            onChange: (e) => handleNumberFieldChange('min_value', e.target.value),
          }}
          disabled={!!values?.attr_id && values?.is_builtin} // 如果是编辑模式，禁用该字段
        />
        <ProFormText
          name="max_value"
          label="最大值"
          placeholder="请输入短字符"
          initialValue={maxValue}
          fieldProps={{
            onChange: (e) => handleNumberFieldChange('max_value', e.target.value),
          }}
          disabled={!!values?.attr_id && values?.is_builtin} // 如果是编辑模式，禁用该字段
        />
        <ProFormDigit
          name="attr_default"
          label="默认值"
          disabled={!!values?.attr_id && values?.is_builtin} // 如果是编辑模式，禁用该字段
        />
      </div>
    );
  }

  if (fieldType === 'date') {
    return (
      <div className="field-detail">
        <ProFormDatePicker
          name="attr_default"
          label="默认值"
          disabled={!!values?.attr_id && values?.is_builtin} // 如果是编辑模式，禁用该字段
        />
      </div>
    );
  }

  if (fieldType === 'datetime') {
    return (
      <div className="field-detail">
        <ProFormDateTimePicker
          name="attr_default"
          label="默认值"
          disabled={!!values?.attr_id && values?.is_builtin} // 如果是编辑模式，禁用该字段
        />
      </div>
    );
  }

  if (fieldType === 'long_text') {
    const regxp = values?.option?.[0]?.regxp || '';

    // 处理长文本类型字段的选项变更
    const handleLongTextFieldChange = (fieldName: string, value: any) => {
      if (onOptionsChange) {
        // 使用本地状态来获取当前的选项值，确保不会丢失其他字段
        const newOptions = {
          ...currentOptions,
          [fieldName]: value,
        };
        // 更新本地状态
        setCurrentOptions(newOptions);
        // 直接传递完整的选项对象，而不是嵌套的对象
        onOptionsChange([newOptions]);
      }
    };

    return (
      <div className="field-detail">
        <ProFormTextArea
          name="regxp"
          label="正则校验"
          placeholder="请输入"
          initialValue={regxp}
          fieldProps={{
            onChange: (e) => handleLongTextFieldChange('regxp', e.target.value),
          }}
          disabled={!!values?.attr_id && values?.is_builtin} // 如果是编辑模式，禁用该字段
        />
        <ProFormTextArea
          name="attr_default"
          label="默认值"
          placeholder="请输入长字符"
          disabled={!!values?.attr_id && values?.is_builtin} // 如果是编辑模式，禁用该字段
        />
      </div>
    );
  }

  // if (fieldType === 'api') {
  //   return (
  //     <div className="field-detail">
  //       <ProFormText
  //         name="api_url"
  //         label="接口URL"
  //         placeholder="请输入用于获取下拉选项的接口地址"
  //         initialValue={values?.option?.[0]?.api_url || ''}
  //         fieldProps={{
  //           onChange: (e) => handleFieldChange('api_url', e.target.value),
  //         }}
  //         disabled={!!values?.attr_id && values?.is_builtin}
  //       />
  //     </div>
  //   );
  // }

  if (fieldType === 'timezone') {
    return (
      <div className="field-detail">
        <ProFormSelect
          name="attr_default"
          label="默认值"
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
          disabled={!!values?.attr_id && values?.is_builtin} // 如果是编辑模式，禁用该字段
        />
      </div>
    );
  }

  if (fieldType === 'boolean') {
    return (
      <div className="field-detail">
        <ProFormSwitch
          name="attr_default"
          label="默认值"
          disabled={!!values?.attr_id && values?.is_builtin} // 如果是编辑模式，禁用该字段
        />
      </div>
    );
  }

  // 添加枚举类型
  if (fieldType === 'enum') {
    return (
      <div className="field-detail">
        <div className="enum-values">
          <div className="enum-header">
            <span>枚举值</span>
          </div>
          {enumValues.map((item, index) => (
            <div key={index} className="enum-item">
              <Space>
                <Input
                  placeholder="请输入ID"
                  value={item.value}
                  onChange={(e) => handleEnumValueChange(index, 'value', e.target.value)}
                  style={{ width: 120 }}
                  disabled={!!values?.attr_id && values?.is_builtin}
                />
                <Input
                  placeholder="请输入值"
                  value={item.label}
                  onChange={(e) => handleEnumValueChange(index, 'label', e.target.value)}
                  style={{ width: 200 }}
                  disabled={!!values?.attr_id && values?.is_builtin}
                />
                {enumValues.length > 1 && (
                  <MinusCircleOutlined
                    onClick={() => handleRemoveEnumValue(index)}
                    style={{ color: '#ff4d4f', cursor: 'pointer' }}
                    disabled={!!values?.attr_id && values?.is_builtin}
                  />
                )}
              </Space>
            </div>
          ))}
          <Button
            type="dashed"
            onClick={handleAddEnumValue}
            icon={<PlusOutlined />}
            style={{ marginTop: 8 }}
            disabled={!!values?.attr_id && values?.is_builtin}
          >
            添加枚举值
          </Button>
        </div>
        <ProFormSelect
          name="attr_default"
          label="默认值"
          options={getValidEnumOptions()}
          disabled={!!values?.attr_id && values?.is_builtin}
        />
      </div>
    );
  }

  // 添加枚举(多选)类型
  if (fieldType === 'enum_multi') {
    return (
      <div className="field-detail">
        <div className="enum-values">
          <div className="enum-header">
            <span>枚举值</span>
          </div>
          {enumValues.map((item, index) => (
            <div key={index} className="enum-item">
              <Space>
                <Input
                  placeholder="请输入ID"
                  value={item.value}
                  onChange={(e) => handleEnumValueChange(index, 'value', e.target.value)}
                  style={{ width: 120 }}
                  disabled={!!values?.attr_id && values?.is_builtin}
                />
                <Input
                  placeholder="请输入值"
                  value={item.label}
                  onChange={(e) => handleEnumValueChange(index, 'label', e.target.value)}
                  style={{ width: 200 }}
                  disabled={!!values?.attr_id && values?.is_builtin}
                />
                {enumValues.length > 1 && (
                  <MinusCircleOutlined
                    onClick={() => handleRemoveEnumValue(index)}
                    style={{ color: '#ff4d4f', cursor: 'pointer' }}
                    disabled={!!values?.attr_id && values?.is_builtin}
                  />
                )}
              </Space>
            </div>
          ))}
          <Button
            type="dashed"
            onClick={handleAddEnumValue}
            icon={<PlusOutlined />}
            style={{ marginTop: 8 }}
            disabled={!!values?.attr_id && values?.is_builtin}
          >
            添加枚举值
          </Button>
        </div>

        <ProFormSelect
          name="attr_default"
          label="默认值"
          mode="multiple"
          options={getValidEnumOptions()}
          disabled={!!values?.attr_id && values?.is_builtin}
          initialValue={multiDefaultValue}
          fieldProps={{
            allowClear: true,
            placeholder: '请选择默认值',
            notFoundContent: '请先添加有效的枚举值',
            value: multiDefaultValue,
            onChange: (value) => {
              // 确保值是数组并更新状态
              const newValue = Array.isArray(value) ? value : [];
              setMultiDefaultValue(newValue);
            },
          }}
        />
      </div>
    );
  }

  return <React.Fragment />;
};

export default FieldTypeRender;
