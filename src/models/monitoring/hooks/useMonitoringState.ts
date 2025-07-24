import { useState } from 'react';
import { ProColumns } from '@ant-design/pro-components';

/**
 * 监控状态管理 Hook
 */
export const useMonitoringState = () => {
  // 基础状态
  const [loading, setLoading] = useState<boolean>(false);
  const [modelAttributes, setModelAttributes] = useState<any[]>([]);
  const [columns, setColumns] = useState<ProColumns<any>[]>([]);
  const [triggerColumns, setTriggerColumns] = useState<ProColumns<any>[]>([]); // 新增触发器列状态

  // 选项状态
  const [systemOptions, setSystemOptions] = useState<{ label: string; value: string }[]>([]);
  const [hostOptions, setHostOptions] = useState<{ label: string; value: string }[]>([]);
  const [monitoringItemModelOptions, setMonitoringItemModelOptions] =
    useState<MonitoringItem.ModelNameItem[]>();

  // 资源数据状态
  const [modelResourcesData, setModelResourcesData] = useState<Record<string, any[]>>({});
  const [resourcesLoading, setResourcesLoading] = useState<Record<string, boolean>>({});

  return {
    // 基础状态
    loading,
    setLoading,
    modelAttributes,
    setModelAttributes,
    columns,
    setColumns,
    triggerColumns, // 新增
    setTriggerColumns, // 新增

    // 选项状态
    systemOptions,
    setSystemOptions,
    hostOptions,
    setHostOptions,
    monitoringItemModelOptions,
    setMonitoringItemModelOptions,

    // 资源数据状态
    modelResourcesData,
    setModelResourcesData,
    resourcesLoading,
    setResourcesLoading,
  };
};
