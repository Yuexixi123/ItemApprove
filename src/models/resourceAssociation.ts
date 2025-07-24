import { useRequest } from '@umijs/max';
import {
  getModelRelationshipJoinNames,
  getModelRelatedResources,
} from '@/services/resources/association/api';

export default () => {
  /**
   * 获取模型关联关系拼接名列表
   */
  const {
    data: modelRelationships,
    run: fetchModelRelationships,
    refresh: refreshModelRelationships,
  } = useRequest(
    (modelId: number) => {
      if (!modelId) {
        return Promise.resolve({ inside_code: 0, data: [] });
      }
      return getModelRelationshipJoinNames(modelId);
    },
    {
      manual: true,
      formatResult: (response: API.ModelRelationshipJoinNameResponse) => {
        if (response.inside_code === 0 && response.data) {
          return response.data;
        }
        return [];
      },
      onError: (error) => {
        console.error('获取模型关联关系出错:', error);
      },
    },
  );

  /**
   * 获取完整的模型关联关系拼接名列表（用于下拉框选择）
   */
  const {
    data: allModelRelationships,
    run: fetchAllModelRelationships,
    refresh: refreshAllModelRelationships,
  } = useRequest(
    (modelId: number) => {
      if (!modelId) {
        return Promise.resolve({ inside_code: 0, data: [] });
      }
      return getModelRelationshipJoinNames(modelId, { is_select: true });
    },
    {
      manual: true,
      formatResult: (response: API.ModelRelationshipJoinNameResponse) => {
        if (response.inside_code === 0 && response.data) {
          return response.data;
        }
        return [];
      },
      onError: (error) => {
        console.error('获取完整模型关联关系出错:', error);
      },
    },
  );

  /**
   * 获取关联资源列表
   */
  const {
    data: relatedResources,
    loading: relatedResourcesLoading,
    run: fetchRelatedResources,
    refresh: refreshRelatedResources,
  } = useRequest(
    (
      modelId: number,
      resourceId: number,
      relationshipId: number,
      current: number = 1,
      pageSize: number = 10,
    ) => {
      if (!modelId || !resourceId || !relationshipId) {
        return Promise.resolve({ inside_code: 0, data: { data: [], pagination: null } });
      }
      return getModelRelatedResources(modelId, {
        rel_id: relationshipId,
        resource_id: resourceId,
        current,
        page_size: pageSize,
      });
    },
    {
      manual: true,
      formatResult: (response: API.ModelRelatedResourcesResponse) => {
        if (response.inside_code === 0 && response.data) {
          // 将 ModelRelatedResourceItem 转换为 RelatedResourceItem 格式
          return response.data.data;
        }
        return [];
      },
      onError: (error) => {
        console.error('获取关联资源出错:', error);
      },
    },
  );

  return {
    modelRelationships: modelRelationships || [],
    fetchModelRelationships,
    refreshModelRelationships,
    allModelRelationships: allModelRelationships || [],
    fetchAllModelRelationships,
    refreshAllModelRelationships,
    relatedResources: relatedResources || [],
    relatedResourcesLoading,
    fetchRelatedResources,
    refreshRelatedResources,
  };
};
