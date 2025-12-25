import { useCallback } from 'react';
import { MonitoringService } from '../services/monitoringService';
import { useMonitoringState } from './useMonitoringState';

/**
 * 监控数据获取 Hook
 */
export const useMonitoringData = () => {
  const {
    setMonitoringItemModelOptions,
    setModelResourcesData,
    setResourcesLoading,
    setModelAttributes,
    setLoading,
    setCreateApprovalLoading,
    ...state
  } = useMonitoringState();

  /**
   * 获取监控项模型名称
   */
  const fetchMonitoringItemModelNames = useCallback(async () => {
    const data = await MonitoringService.fetchMonitoringItemModelNames();
    setMonitoringItemModelOptions(data);
    return data;
  }, []); // 移除setState依赖，因为React保证setState函数引用稳定

  /**
   * 获取模型资源数据
   */
  const fetchModelResources = useCallback(
    async (params: Record<string, any>) => {
      // 设置对应模型的加载状态
      const modelKey = params.model_key || 'default';
      setResourcesLoading((prev) => ({ ...prev, [modelKey]: true }));

      try {
        const data = await MonitoringService.fetchModelResources(params);
        // 更新对应模型的资源数据
        setModelResourcesData((prev) => ({ ...prev, [modelKey]: data }));
        return data;
      } catch (error) {
        console.error('获取模型资源数据失败:', error);
        return [];
      } finally {
        // 清除加载状态
        setResourcesLoading((prev) => ({ ...prev, [modelKey]: false }));
      }
    },
    [], // 移除setState依赖，因为React保证setState函数引用稳定
  );

  /**
   * 获取模型属性
   */
  const fetchModelAttributes = useCallback(
    async (modelId: number) => {
      if (!modelId) return;

      setLoading(true);
      try {
        const data = await MonitoringService.fetchModelAttributes(modelId);
        setModelAttributes(data);
        return data;
      } finally {
        setLoading(false);
      }
    },
    [], // 移除setState依赖
  );

  /**
   * 获取触发器模型属性
   */
  const fetchTriggerModelAttributes = useCallback(async () => {
    setLoading(true);
    try {
      const data = await MonitoringService.fetchTriggerModelAttributes();
      setModelAttributes(data);
      return data;
    } finally {
      setLoading(false);
    }
  }, []); // 移除setState依赖

  /**
   * 获取监控项审批详情
   */
  const fetchMonitoringItemApprovalDetail = useCallback(async (itemApprovalId: number) => {
    setLoading(true);
    try {
      const result = await MonitoringService.fetchMonitoringItemApprovalDetail(itemApprovalId);
      return result;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 创建监控项审批
   */
  const createMonitoringItemApproval = useCallback(
    async (data: MonitoringItem.CreateApprovalParams) => {
      setCreateApprovalLoading(true);
      try {
        const result = await MonitoringService.createMonitoringItemApproval(data);
        return result;
      } finally {
        setCreateApprovalLoading(false);
      }
    },
    [], // 移除setState依赖
  );

  /**
   * 更新监控项审批
   */
  const updateMonitoringItemApproval = useCallback(
    async (approvalId: number, data: MonitoringItem.UpdateApprovalParams) => {
      setCreateApprovalLoading(true);
      try {
        const result = await MonitoringService.updateMonitoringItemApproval(approvalId, data);
        return result;
      } finally {
        setCreateApprovalLoading(false);
      }
    },
    [], // 移除setState依赖
  );

  return {
    ...state,
    fetchMonitoringItemModelNames,
    fetchModelResources,
    fetchModelAttributes,
    fetchTriggerModelAttributes,
    fetchMonitoringItemApprovalDetail,
    createMonitoringItemApproval,
    updateMonitoringItemApproval,
  };
};
