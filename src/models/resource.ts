import { useState, useCallback } from 'react';
import { getModelAttributes, getResourceDetail } from '@/services/resources/api';
import { App } from 'antd';

// 创建一个缓存对象，用于存储已获取的模型属性
const attributesCache = new Map<number, API.ModelAttributeItem[]>();

export default () => {
  const { message } = App.useApp();
  const [attributesLoading, setAttributesLoading] = useState<boolean>(false);
  const [modelAttributes, setModelAttributes] = useState<API.ModelAttributeItem[]>([]);
  const [resourceRecord, setResourceRecord] = useState<API.ResourceItem | null>(null);
  const [resourceDetailLoading, setResourceDetailLoading] = useState<boolean>(false);

  // 自定义 setResourceRecord 函数，同时更新本地存储
  const updateResourceRecord = useCallback((record: API.ResourceItem | null) => {
    setResourceRecord(record);
  }, []);

  /**
   * 获取模型属性
   * @param modelId 模型ID
   * @param forceRefresh 是否强制刷新缓存
   * @returns 模型属性数组
   */
  const fetchModelAttributes = useCallback(
    async (modelId: number, forceRefresh = false): Promise<API.ModelAttributeItem[]> => {
      if (!modelId) {
        return [];
      }

      // 如果缓存中有数据且不需要强制刷新，则直接返回缓存数据
      if (!forceRefresh && attributesCache.has(modelId)) {
        const cachedData = attributesCache.get(modelId);
        setModelAttributes(cachedData || []);
        return cachedData || [];
      }

      setAttributesLoading(true);
      try {
        const response = await getModelAttributes(modelId);
        if (response.inside_code === 0 && response.data) {
          const attributes = response.data;
          // 更新缓存
          attributesCache.set(modelId, attributes);
          setModelAttributes(attributes);
          // 保存到本地存储
          return attributes;
        } else {
          message.error(`获取模型属性失败: ${response.msg || '未知错误'}`);
          return [];
        }
      } catch (error) {
        console.error('获取模型属性出错:', error);
        message.error('获取模型属性失败，请稍后重试');
        return [];
      } finally {
        setAttributesLoading(false);
      }
    },
    [],
  );

  /**
   * 获取资源详情
   * @param resourceId 资源ID
   * @param modelId 模型ID
   * @returns 资源详情
   */
  const fetchResourceDetail = useCallback(async (resourceId: number, modelId: number) => {
    if (!resourceId || !modelId) {
      return null;
    }

    setResourceDetailLoading(true);
    try {
      const response = await getResourceDetail({ resource_id: resourceId, model_id: modelId });
      if (response.inside_code === 0 && response.data) {
        setResourceRecord(response.data);
        return response.data;
      } else {
        message.error(`获取资源详情失败: ${response.msg || '未知错误'}`);
        return null;
      }
    } catch (error) {
      console.error('获取资源详情出错:', error);
      message.error('获取资源详情失败，请稍后重试');
      return null;
    } finally {
      setResourceDetailLoading(false);
    }
  }, []);

  /**
   * 清除指定模型的缓存
   * @param modelId 模型ID，如果不提供则清除所有缓存
   */
  const clearAttributesCache = useCallback((modelId?: number) => {
    if (modelId !== undefined) {
      attributesCache.delete(modelId);
    } else {
      attributesCache.clear();
    }
  }, []);

  return {
    modelAttributes,
    attributesLoading,
    fetchModelAttributes,
    clearAttributesCache,
    setResourceRecord: updateResourceRecord,
    resourceRecord,
    fetchResourceDetail,
    resourceDetailLoading,
  };
};
