import { useState } from 'react';
import { message } from 'antd';
import { useRequest } from 'ahooks';
import {
  getModelRelationships,
  getAssociationTypeNames,
} from '@/services/model-api/model-manage/model-relationship';

export default () => {
  // 模型关系列表状态
  const [modelRelationships, setModelRelationships] = useState<API.RelationshipItem[]>([]);
  // 关联类型名称列表状态
  const [associationTypeNames, setAssociationTypeNames] = useState<API.AssociationTypeNameItem[]>(
    [],
  );

  // 使用 useRequest 钩子获取模型关联关系
  const { loading, run: fetchModelRelationships } = useRequest(
    async (model_id: number) => {
      try {
        const response = await getModelRelationships(model_id);
        if (response.inside_code === 0) {
          setModelRelationships(response.data.data);
          return response.data;
        } else {
          message.error(response.msg || '获取模型关联关系失败');
          return [];
        }
      } catch (error) {
        console.error('获取模型关联关系出错:', error);
        message.error('获取模型关联关系失败');
        return [];
      }
    },
    {
      manual: true, // 设置为手动触发
    },
  );

  // 使用 useRequest 钩子获取关联类型名称列表
  const { loading: associationTypeNamesLoading, run: fetchAssociationTypeNames } = useRequest(
    async () => {
      try {
        const response = await getAssociationTypeNames();
        if (response.inside_code === 0) {
          setAssociationTypeNames(response.data);
          return response.data;
        } else {
          message.error(response.msg || '获取关联类型名称列表失败');
          return [];
        }
      } catch (error) {
        console.error('获取关联类型名称列表出错:', error);
        message.error('获取关联类型名称列表失败');
        return [];
      }
    },
    {
      manual: true, // 设置为手动触发
    },
  );

  // 刷新数据的方法
  const refreshRelationships = (model_id: number) => {
    fetchModelRelationships(model_id);
  };

  return {
    modelRelationships,
    loading,
    fetchModelRelationships,
    refreshRelationships,
    associationTypeNames,
    associationTypeNamesLoading,
    fetchAssociationTypeNames,
  };
};
