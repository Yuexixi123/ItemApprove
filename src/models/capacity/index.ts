import { useState, useCallback } from 'react';
import type { ProColumns } from '@ant-design/pro-components';
import { getCapacityApprovalModelAttributes } from '@/services/capacity';
import { createCapacityApproval as createCapacityApprovalReq } from '@/services/capacity';
import { ColumnGenerator } from '@/models/monitoring';

/**
 * 容量管理模型
 * 提供字段列生成与加载状态，基于资源服务的 getModelAttributes
 */
export default () => {
  const [loading, setLoading] = useState<boolean>(false);
  const [columns, setColumns] = useState<ProColumns<any>[]>([]);
  // 为不同的 modelId 维护独立的列缓存，避免相互覆盖
  const [columnsCache, setColumnsCache] = useState<Record<number, ProColumns<any>[]>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);

  /**
   * 获取模型属性并生成表格列
   */
  const fetchModelAttributes = useCallback(async (modelId: number) => {
    if (!modelId) return [];

    setLoading(true);
    try {
      const response = await getCapacityApprovalModelAttributes(modelId);
      const attributes =
        response && (response as any).inside_code === 0 && (response as any).data
          ? (response as any).data
          : [];

      const generatedColumns = attributes.map((field: any) =>
        ColumnGenerator.generateColumn(field),
      );
      setColumns(generatedColumns);
      return attributes;
    } catch (error) {
      console.error('容量管理模型：获取模型属性失败', error);
      setColumns([]);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 获取指定模型的列（仅返回列并写入缓存，不覆盖全局 columns）
   */
  const fetchModelColumns = useCallback(async (modelId: number, approvalId?: number) => {
    if (!modelId) return [] as ProColumns<any>[];
    setLoading(true);
    try {
      const response = await getCapacityApprovalModelAttributes(modelId, {
        approval_id: approvalId,
      });
      const attributes =
        response && (response as any).inside_code === 0 && (response as any).data
          ? (response as any).data
          : [];
      const generatedColumns = attributes.map((field: any) =>
        ColumnGenerator.generateColumn(field),
      );
      setColumnsCache((prev) => ({ ...prev, [modelId]: generatedColumns }));
      return generatedColumns;
    } catch (error) {
      console.error('容量管理模型：获取指定模型列失败', error);
      return [] as ProColumns<any>[];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * 新建容量管理审批（仅封装请求层与成功判断）
   */
  const createCapacityApproval = useCallback(
    async (data: CapacityManagement.CreateApprovalParams) => {
      setSubmitting(true);
      try {
        const res = await createCapacityApprovalReq(data);
        return res;
      } catch (e) {
        return { success: false, error: e } as any;
      } finally {
        setSubmitting(false);
      }
    },
    [],
  );

  return {
    loading,
    columns,
    fetchModelAttributes,
    fetchModelColumns,
    columnsCache,
    submitting,
    createCapacityApproval,
  };
};
