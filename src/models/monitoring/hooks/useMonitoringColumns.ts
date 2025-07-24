import { useCallback } from 'react';
import { ColumnGenerator } from '../utils/columnGenerator';
import { useMonitoringState } from './useMonitoringState';

/**
 * 监控列配置 Hook
 */
export const useMonitoringColumns = () => {
  const { setColumns, setTriggerColumns, ...state } = useMonitoringState();

  /**
   * 根据模型属性生成监控项表格列
   */
  const generateColumns = useCallback(
    (attributes: any[]) => {
      const generatedColumns = attributes.map((field) => ColumnGenerator.generateColumn(field));
      setColumns(generatedColumns);
      return generatedColumns;
    },
    [setColumns],
  );

  /**
   * 根据模型属性生成触发器表格列
   */
  const generateTriggerColumns = useCallback(
    (attributes: any[]) => {
      const generatedColumns = attributes.map((field) => ColumnGenerator.generateColumn(field));
      setTriggerColumns(generatedColumns);
      return generatedColumns;
    },
    [setTriggerColumns],
  );

  return {
    ...state,
    generateColumns,
    generateTriggerColumns, // 新增
  };
};
