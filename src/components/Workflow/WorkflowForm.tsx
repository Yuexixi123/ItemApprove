import React, { useState, useEffect } from 'react';
import { App } from 'antd';
import { ModalForm, ProFormCascader, ProFormTextArea } from '@ant-design/pro-components';
import { request } from '@umijs/max';

interface WorkflowFormProps {
  onFinish?: (values: any) => Promise<void> | void;
  initialValues?: Record<string, any>;
  readonly?: boolean;
  workType?: string;
  workId?: string | number;
  processCode?: string;
  processId?: string | number;
  title?: string;
  trigger?: React.ReactNode;
  visible?: boolean;
  onVisibleChange?: (visible: boolean) => void;
  width?: number;
}

interface WorkflowNode {
  value: string;
  label: string;
  children?: WorkflowNode[];
}

const workflowUrl = '/ant_workflow.json';

const WorkflowForm: React.FC<WorkflowFormProps> = ({
  // onFinish,
  initialValues = {},
  readonly = false,
  workType,
  workId,
  processCode,
  // processId,
  title = '工作流审批',
  // trigger,
  visible,
  onVisibleChange,
  width = 600,
}) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState<boolean>(true);
  const [options, setOptions] = useState<WorkflowNode[]>([]);

  // 获取工作流节点数据
  const fetchWorkflowData = async () => {
    try {
      setLoading(true);
      const response = await request(workflowUrl, {
        params: {
          tag: 'WorkflowNextNodeInfo',
          workType,
          workId,
          processCode,
          userId: localStorage.getItem('userName'),
          // processId
        },
      });
      if (response && response.success) {
        setOptions(response.data || []);
      } else {
        message.error(response?.message || '获取工作流数据失败');
      }
    } catch (error) {
      console.error('获取工作流数据出错:', error);
      message.error('获取工作流数据出错');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (visible) {
      fetchWorkflowData();
    }
  }, [visible]);

  return (
    <ModalForm
      title={title}
      initialValues={initialValues}
      // trigger={trigger}
      open={visible}
      loading={loading}
      onOpenChange={onVisibleChange}
      width={width}
      modalProps={{
        destroyOnClose: true,
        maskClosable: false,
      }}
      onFinish={async (values) => {
        console.log(values);

        return true;
      }}
    >
      <ProFormCascader
        name="approve"
        label="下一节点分支/处理人"
        fieldProps={{
          options,
          multiple: true,
          expandTrigger: 'hover',
          showSearch: true,
        }}
        rules={[{ required: true, message: '请选择下一节点分支/处理人' }]}
        disabled={readonly}
        placeholder="请选择下一节点分支/处理人"
      />
      <ProFormTextArea
        name="approveInfo"
        label="审批意见"
        placeholder="请输入审批意见"
        rules={[{ required: true, message: '请输入审批意见' }]}
        disabled={readonly}
        fieldProps={{
          rows: 4,
        }}
      />
    </ModalForm>
  );
};

export default WorkflowForm;
