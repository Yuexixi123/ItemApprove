import React, { useState, useEffect, useMemo } from 'react';
import type { RadioChangeEvent } from 'antd';
import { Radio } from 'antd';
import { useModel } from '@umijs/max';

// 动态生成选项，根据数据状态决定是否禁用"已停用"选项
const RadioGroups: React.FC = () => {
  const [value, setValue] = useState('0');
  const { initData, setFilteredData } = useModel('modelPage', (model) => ({
    initData: model.initData,
    setFilteredData: (data: API.ModelGroup[]) => {
      model.setFilteredData(data);
    },
  }));

  // 使用 useMemo 计算选项，避免不必要的重新计算
  const options = useMemo(() => {
    // 检查是否存在已停用的模型（is_active 为 false）
    const hasDisabledModels =
      initData?.some((group) => group.models.some((model) => model.is_active === false)) || false;

    return [
      { label: '全部', value: '0' },
      { label: '启用', value: '1' },
      { label: '已停用', value: '2', disabled: !hasDisabledModels },
    ];
  }, [initData]);

  // 根据选择的值筛选模型
  const filterModelsByStatus = (status: string) => {
    if (!initData || initData.length === 0) return;

    // 如果选择全部，不进行筛选
    if (status === '0') {
      setFilteredData(initData);
      return;
    }

    // 根据 is_active 筛选模型
    const isActive = status === '1'; // 启用对应 is_active 为 true

    const result = initData
      .map((group) => {
        // 筛选符合条件的模型
        const filteredModels = group.models.filter((model) => model.is_active === isActive);

        // 如果组内有匹配的模型，返回过滤后的组
        if (filteredModels.length > 0) {
          return {
            ...group,
            models: filteredModels,
          };
        }
        return null;
      })
      .filter((group) => group !== null) as API.ModelGroup[];

    setFilteredData(result);
  };

  const onChange = ({ target: { value } }: RadioChangeEvent) => {
    setValue(value);
    filterModelsByStatus(value);
  };

  // 当 initData 变化时，重新应用当前筛选
  useEffect(() => {
    if (initData && initData.length > 0 && value !== '0') {
      filterModelsByStatus(value);
    }
  }, [initData]);

  return (
    <Radio.Group
      options={options}
      onChange={onChange}
      defaultValue="0"
      value={value}
      optionType="button"
    />
  );
};

export default RadioGroups;
