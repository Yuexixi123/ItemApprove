import { useMonitoringData } from './hooks/useMonitoringData';
import { useMonitoringColumns } from './hooks/useMonitoringColumns';
import { useCallback } from 'react';

/**
 * 监控审批模型 - 重构版本
 * 整合数据获取、状态管理、UI配置功能
 */
export default () => {
  const dataHook = useMonitoringData();
  const columnHook = useMonitoringColumns();

  /**
   * 获取模型属性并生成表格列
   */
  const fetchModelAttributes = useCallback(
    async (modelId: number) => {
      const attributes = await dataHook.fetchModelAttributes(modelId);
      if (attributes && attributes.length > 0) {
        columnHook.generateColumns(attributes); // 使用监控项列生成方法
      }
    },
    [dataHook.fetchModelAttributes, columnHook.generateColumns],
  );

  /**
   * 获取触发器模型属性并生成表格列
   */
  const fetchTriggerModelAttributes = useCallback(async () => {
    const attributes = await dataHook.fetchTriggerModelAttributes();
    if (attributes && attributes.length > 0) {
      columnHook.generateTriggerColumns(attributes); // 使用触发器列生成方法
    }
  }, [dataHook.fetchTriggerModelAttributes, columnHook.generateTriggerColumns]);

  return {
    // 状态
    modelAttributes: dataHook.modelAttributes,
    columns: columnHook.columns,
    triggerColumns: columnHook.triggerColumns, // 新增触发器列
    loading: dataHook.loading,
    hostOptions: dataHook.hostOptions,
    monitoringItemModelOptions: dataHook.monitoringItemModelOptions,
    modelResourcesData: dataHook.modelResourcesData,
    resourcesLoading: dataHook.resourcesLoading,
    createApprovalLoading: dataHook.createApprovalLoading, // 新增创建审批loading状态

    // 方法
    fetchModelAttributes,
    fetchTriggerModelAttributes,
    fetchModelResources: dataHook.fetchModelResources,
    createMonitoringItemApproval: dataHook.createMonitoringItemApproval, // 新增创建审批方法
    updateMonitoringItemApproval: dataHook.updateMonitoringItemApproval, // 新增更新审批方法
    fetchMonitoringItemModelNames: dataHook.fetchMonitoringItemModelNames,
    fetchMonitoringItemApprovalDetail: dataHook.fetchMonitoringItemApprovalDetail, // 新增获取审批详情方法
  };
};

// 导出工具函数
export { mapAttributeTypeToValueType } from './utils/typeMapping';
export { ColumnGenerator } from './utils/columnGenerator';
export { MonitoringService } from './services/monitoringService';
export { MockDataProvider } from './services/mockDataProvider';
