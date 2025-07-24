import { useState, useCallback } from 'react';
import { getModelResourceNames, getResourceNameRelationship } from '@/services/resources/api';
import { message } from 'antd';

export default function useSelectOption() {
  // 模型资源名称列表状态
  const [modelResourceNames, setModelResourceNames] = useState<API.ResourceNameItem[]>([]);
  // 关联资源名称列表状态
  const [resourceNameRelationship, setResourceNameRelationship] = useState<API.ResourceNameItem[]>(
    [],
  );

  /**
   * 获取模型资源名称列表
   * @param model_key - 模型KEY（必填）
   * @description 应用场景：监控项审批功能"获取系统资源名称列表"API
   */
  const fetchModelResourceNames = useCallback(async (model_key: string) => {
    if (!model_key) {
      message.error('模型KEY不能为空');
      return;
    }

    try {
      const response = await getModelResourceNames(model_key);
      if (response.inside_code === 0) {
        setModelResourceNames(response.data || []);
        return response.data;
      } else {
        message.error(response.msg || '获取模型资源名称列表失败');
        setModelResourceNames([]);
      }
    } catch (error) {
      message.error('获取模型资源名称列表失败');
      setModelResourceNames([]);
    }
  }, []);

  /**
   * 获取指定资源关联的资源名列表
   * @param resource_id - 资源ID
   * @description 应用场景：监控项审批功能"获取系统资源关联的主机资源名称列表"API
   */
  const fetchResourceNameRelationship = useCallback(
    async (
      resource_id: number,
      params: {
        model_key: string;
      },
    ) => {
      if (!resource_id) {
        message.error('资源ID不能为空');
        return;
      }

      try {
        const response = await getResourceNameRelationship(resource_id, params);
        if (response.inside_code === 0) {
          setResourceNameRelationship(response.data || []);
          return response.data;
        } else {
          message.error(response.msg || '获取关联资源名称列表失败');
          setResourceNameRelationship([]);
        }
      } catch (error) {
        console.error('获取关联资源名称列表失败:', error);
        message.error('获取关联资源名称列表失败');
        setResourceNameRelationship([]);
      }
    },
    [],
  );

  /**
   * 清空关联资源名称列表
   */
  const clearResourceNameRelationship = useCallback(() => {
    setResourceNameRelationship([]);
  }, []);

  return {
    // 状态数据
    modelResourceNames,
    resourceNameRelationship,
    // 方法
    fetchModelResourceNames,
    fetchResourceNameRelationship,
    clearResourceNameRelationship,
  };
}
