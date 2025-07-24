import { getModelAttributes } from '@/services/model-api/attribute';
import { useState } from 'react';
import { useRequest } from 'ahooks';
import { history } from '@umijs/max';
import { getModelList } from '@/services/model-api/model-manage';
import { getModelIdFromUrl } from '@/utils';

export default () => {
  // 定义状态
  const [initData, setInitData] = useState<ModelField.ModelAttributeGroup[]>([]);
  const [filteredData, setFilteredData] = useState<ModelField.ModelAttributeGroup[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [allActiveKeys, setAllActiveKeys] = useState<number[]>([]);
  const [collapseDefaultActiveKey, setCollapseDefaultActiveKey] = useState<number[]>([]);
  const [modelGroupSelectValue, setModelGroupSelectValue] = useState<
    { label: string; value: number }[] | []
  >([]);

  // 获取模型字段数据
  const { loading, run: fetchModelAttributes } = useRequest(
    async () => {
      // 优先使用 URL 中的模型 ID
      const currentModelId = getModelIdFromUrl();

      if (!currentModelId) {
        // 清空数据
        setInitData([]);
        setFilteredData([]);
        return [];
      }

      try {
        const res = await getModelAttributes(currentModelId);

        if (res.data && Array.isArray(res.data)) {
          const transformedData = res.data.map((group) => ({
            attrgroup_id: group.attrgroup_id,
            attrgroup_name: group.attrgroup_name,
            is_collapse: group.is_collapse, // 添加 is_collapse 字段，如果不存在则默认为 2
            attrs: Array.isArray(group.attrs) ? group.attrs : [],
          }));
          // 初始化时设置默认展开的面板
          const defaultActiveKeys = transformedData
            .filter((group) => !group.is_collapse)
            .map((group) => group.attrgroup_id);
          // 设置模型分组下拉框的默认值
          const modelGroupOptions = transformedData.map((group) => ({
            label: group.attrgroup_name,
            value: group.attrgroup_id,
          }));
          const allActiveKeys = transformedData.map((group) => group.attrgroup_id);
          setModelGroupSelectValue(modelGroupOptions);
          setCollapseDefaultActiveKey(defaultActiveKeys);
          setAllActiveKeys(allActiveKeys);
          setInitData(transformedData);
          setFilteredData(transformedData);
          return transformedData;
        } else {
          // 接口返回数据格式不正确
          setInitData([]);
          setFilteredData([]);
          return [];
        }
      } catch (err) {
        // 接口调用失败，清空数据
        setInitData([]);
        setFilteredData([]);
        return [];
      }
    },
    {
      manual: true, // 设置为手动触发
      refreshDeps: [history.location.pathname], // 依赖 URL 路径的变化
    },
  );

  // 使用 useRequest 钩子获取模型数据
  const { data: modelDetailsRecord, run: fetchModelsDetails } = useRequest(
    async (params?: { model_id?: number }) => {
      const res = await getModelList(params);

      if (res && res.inside_code === 0 && Array.isArray(res.data)) {
        return res.data;
      }
      return [];
    },
    {
      manual: true, // 设置为手动触发
    },
  );

  // 处理搜索逻辑
  const handleSearch = (term: string) => {
    setSearchTerm(term);

    if (!term) {
      setFilteredData(initData);
      return;
    }

    const lowercasedTerm = term.toLowerCase();

    const result = initData
      .map((group) => {
        const filteredAttributes = group.attrs.filter(
          (attr) =>
            attr.attr_name.toLowerCase().includes(lowercasedTerm) ||
            attr.attr_key.toLowerCase().includes(lowercasedTerm),
        );

        if (
          filteredAttributes.length > 0 ||
          group.attrgroup_name.toLowerCase().includes(lowercasedTerm)
        ) {
          return {
            ...group,
            attrs: filteredAttributes,
          };
        }
        return null;
      })
      .filter((group): group is ModelField.ModelAttributeGroup => group !== null);

    setFilteredData(result);
  };

  // 清除当前模型数据
  const clearModelData = () => {
    setInitData([]);
    setFilteredData([]);
  };

  // 添加设置折叠面板活动键的函数
  const setCollapseActiveKey = (keys: number[]) => {
    setCollapseDefaultActiveKey(keys);
  };

  return {
    filteredData,
    loading,
    searchTerm,
    handleSearch,
    fetchModelAttributes,
    clearModelData,
    modelDetailsRecord,
    collapseDefaultActiveKey,
    modelGroupSelectValue,
    allActiveKeys,
    fetchModelsDetails,
    setCollapseActiveKey, // 导出新添加的函数
  };
};
