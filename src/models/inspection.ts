import { useState, useEffect } from 'react';
import {
  getSystemList,
  insertSystemHostCache,
  executeInspection,
  getItemHistoryData,
} from '@/services/inspection/api';

export default () => {
  // 系统列表状态
  const [systemList, setSystemList] = useState<Inspection.SystemItem[]>([]);
  // 加载状态
  const [loading, setLoading] = useState<boolean>(false);
  // 分页信息
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取系统列表数据
  const fetchSystemList = async (params?: Partial<Inspection.SystemListParams>) => {
    setLoading(true);
    try {
      const requestParams: Inspection.SystemListParams = {
        current: params?.current || pagination.current,
        page_size: params?.page_size || pagination.pageSize,
        system_id: params?.system_id,
      };

      const res = await getSystemList(requestParams);
      if (res && res.inside_code === 0 && Array.isArray(res.data)) {
        setSystemList(res.data);
        // 更新分页信息
        setPagination((prev) => ({
          ...prev,
          current: requestParams.current,
          pageSize: requestParams.page_size,
          total: res.data.data?.length || 0, // 修正：使用data.data数组的长度
        }));
      }
    } catch (error) {
      console.error('获取系统列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 巡检数据状态
  const [inspectionData, setInspectionData] = useState<Inspection.InspectionData[]>([]);
  const [isInspecting, setIsInspecting] = useState<boolean>(false);
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);
  // 主机总数状态
  const [hostTotal, setHostTotal] = useState<number>(0);

  // 插入系统主机缓存
  const insertHostCache = async (systemId?: number) => {
    try {
      const params: Inspection.SystemHostCacheParams = {
        system_id: systemId,
      };

      const res = await insertSystemHostCache(params);
      if (res && res.inside_code === 0) {
        // 保存主机总数
        setHostTotal(res.data.host_total || 0);
        return res.data;
      }
      throw new Error(res?.msg || '插入主机缓存失败');
    } catch (error) {
      console.error('插入系统主机缓存失败:', error);
      throw error;
    }
  };

  // 开始巡检轮询
  const startInspectionPolling = async (systemId?: number) => {
    setIsInspecting(true);
    setInspectionData([]);

    const pollInspection = async () => {
      try {
        const params: Inspection.InspectionParams = {
          system_id: systemId,
        };

        const res = await executeInspection(params);
        if (res && res.inside_code === 0) {
          const newData = res.data;

          // 将新数据添加到巡检数据中
          setInspectionData((prev) => {
            const updatedData = [...prev, newData];
            return updatedData;
          });

          // 如果状态为success，停止轮询
          if (newData.execute_status === 'success') {
            setIsInspecting(false);
            return true; // 表示巡检完成
          }
          return false; // 表示需要继续轮询
        }
        throw new Error(res?.msg || '巡检失败');
      } catch (error) {
        console.error('巡检轮询失败:', error);
        setIsInspecting(false);
        throw error;
      }
    };

    // 立即执行一次
    const isCompleted = await pollInspection();

    // 如果没有完成，开始轮询
    if (!isCompleted) {
      const interval = setInterval(async () => {
        try {
          const isCompleted = await pollInspection();
          if (isCompleted) {
            clearInterval(interval);
            setPollingInterval(null);
          }
        } catch (error) {
          clearInterval(interval);
          setPollingInterval(null);
        }
      }, 3000); // 每3秒轮询一次

      setPollingInterval(interval);
    }
  };

  // 监听巡检数据变化，当达到主机总数时停止轮询
  useEffect(() => {
    if (inspectionData.length >= hostTotal && hostTotal > 0 && isInspecting) {
      setIsInspecting(false);
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
    }
  }, [inspectionData.length, hostTotal, isInspecting, pollingInterval]);

  // 停止巡检轮询
  const stopInspectionPolling = () => {
    setIsInspecting(false);
    if (pollingInterval) {
      clearInterval(pollingInterval);
      setPollingInterval(null);
    }
  };

  // 清理轮询
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // 获取监控项历史数据
  const fetchItemHistoryData = async (
    itemId: string,
    params?: { stime?: string; etime?: string },
  ) => {
    try {
      const res = await getItemHistoryData(itemId, params);
      if (res && res.inside_code === 0) {
        return res.data;
      }
      throw new Error(res?.msg || '获取历史数据失败');
    } catch (error) {
      console.error('获取监控项历史数据失败:', error);
      throw error;
    }
  };

  return {
    systemList,
    loading,
    pagination,
    fetchSystemList, // 导出刷新方法，以便在需要时手动刷新
    insertHostCache, // 导出插入主机缓存方法
    inspectionData, // 巡检数据
    isInspecting, // 是否正在巡检
    startInspectionPolling, // 开始巡检轮询
    stopInspectionPolling, // 停止巡检轮询
    fetchItemHistoryData, // 获取监控项历史数据
    hostTotal, // 主机总数
  };
};
