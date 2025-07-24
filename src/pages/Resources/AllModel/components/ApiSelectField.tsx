import { useEffect, useState } from 'react';
import { ProFormSelect } from '@ant-design/pro-components';
import { App } from 'antd';
import { request } from '@umijs/max';

interface ApiSelectFieldProps {
  name: string;
  label: string;
  rules?: any[];
  apiUrl?: string;
  disabled?: boolean;
}

interface OptionType {
  label: string;
  value: string | number;
}

const ApiSelectField: React.FC<ApiSelectFieldProps> = ({
  name,
  label,
  rules,
  apiUrl,
  disabled,
}) => {
  const [options, setOptions] = useState<OptionType[]>([]);
  const { message } = App.useApp();

  useEffect(() => {
    if (!apiUrl) return;
    request(apiUrl)
      .then((data) => {
        setOptions(data.data);
      })
      .catch(() => {
        message.error('接口选项获取失败');
      });
  }, [apiUrl]);

  return (
    <ProFormSelect
      name={name}
      label={label}
      rules={rules}
      options={options}
      disabled={disabled}
      showSearch
    />
  );
};

export default ApiSelectField;
