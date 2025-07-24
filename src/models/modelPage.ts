// 导入所需的依赖
import { getModelList } from '@/services/model-api/model-manage';
import { useState } from 'react';
import { useRequest } from '@umijs/max';

// 模型页面的数据和逻辑处理
export default () => {
  // 搜索关键词状态
  const [searchTerm, setSearchTerm] = useState('');
  // 初始数据状态 - 修改类型定义与API返回类型一致
  const [initData, setInitData] = useState<API.ModelGroup[]>([]);
  // 过滤后的数据状态 - 修改类型定义与API返回类型一致
  const [filteredData, setFilteredData] = useState<API.ModelGroup[]>([]);

  // 添加分组选项状态
  const [groupOptions, setGroupOptions] = useState<{ label: string; value: number }[]>([]);

  // 使用 useRequest 钩子获取模型数据
  const { loading, run: fetchModels } = useRequest(
    async () => {
      const res = await getModelList();

      if (res && res.inside_code === 0 && Array.isArray(res.data)) {
        setInitData(res.data);
        setFilteredData(res.data);

        // 从返回的数据中提取分组选项
        const options = res.data.map((group) => ({
          label: group.modelgroup_name,
          value: group.modelgroup_id,
        }));
        setGroupOptions(options);

        return res.data;
      }
      return [];
    },
    {
      manual: true, // 设置为手动触发
    },
  );

  // 刷新数据的方法
  const refreshData = () => {
    fetchModels();
  };

  // 处理搜索的方法
  const handleSearch = (term: string) => {
    setSearchTerm(term);

    // 如果搜索词为空，显示所有数据
    if (!term) {
      setFilteredData(initData);
      return;
    }

    const lowercasedTerm = term.toLowerCase();

    // 过滤数据 - 修改类型引用
    const result = initData
      .map((group) => {
        // 过滤符合搜索条件的模型
        const filteredModels = group.models.filter((model) =>
          model.model_name.toLowerCase().includes(lowercasedTerm),
        );

        // 如果组内有匹配的模型或组标题匹配，返回过滤后的组
        if (
          filteredModels.length > 0 ||
          group.modelgroup_name.toLowerCase().includes(lowercasedTerm)
        ) {
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

  // 返回所需的状态和方法
  return {
    filteredData,
    initData,
    setFilteredData,
    loading,
    searchTerm,
    handleSearch,
    refreshData,
    fetchModels,
    groupOptions, // 导出分组选项
  };
};
