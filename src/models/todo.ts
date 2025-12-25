import { useState, useCallback } from 'react';
import { getWorkflowTodo } from '@/services/todo';
import { App } from 'antd';

export default () => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState<boolean>(false);
  const [approveOpen, setApproveOpen] = useState(false);
  const [approvalId, setApprovalId] = useState<number | undefined>(undefined);
  const [row, setRow] = useState<any>(undefined);

  const fetchTodoList = useCallback(async (params: any) => {
    setLoading(true);
    try {
      const userName = localStorage.getItem('userName') || '';
      const res = await getWorkflowTodo({
        ...params,
        status: params.status,
        keyword: params.title,
        user_name: userName,
        current: params.current,
        page_size: params.pageSize,
      });

      // 接口返回结构为 { data: { data: [...] } }，需要处理嵌套结构
      const listData = res?.data?.data || res?.data || [];

      return {
        data: Array.isArray(listData) ? listData : [],
        total: res?.data?.pagination?.total || res?.total || 0,
        success: true,
      };
    } catch (error) {
      console.error('获取待办列表失败:', error);
      return {
        data: [],
        total: 0,
        success: false,
      };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleProcess = useCallback(async (record: any) => {
    try {
      if (record.big_class_no === 'RLGLSP') {
        // 直接使用 record 中的数据，不再调用详情接口
        // 补充工作流信息到 row 中，以便 ApproveForm 使用
        const rowData = {
          workflow_info: {
            is_approve: true,
            process_id: record.process_id,
            task_id: record.task_id,
            work_type: record.big_class_no,
          },
          // 确保有 id 字段
          id: record.id,
        };
        setRow(rowData);
        setApprovalId(Number(record.id));
        setApproveOpen(true);
      } else {
        message.info('该流程类型的处理暂未实现');
      }
    } catch (error) {
      console.error('处理失败:', error);
      message.error('处理失败');
    }
  }, []);

  return {
    loading,
    fetchTodoList,
    handleProcess,
    approveOpen,
    setApproveOpen,
    approvalId,
    row,
  };
};
