import React, { useState, useEffect } from 'react';
import { App, Cascader } from 'antd';
import { ProForm, ProFormCascader, ProFormTextArea } from '@ant-design/pro-components';
import { request } from '@umijs/max';
import { approveWorkflow } from '@/services/workflow';

interface WorkflowFormProps {
  onFinish?: (values: any) => Promise<void> | void;
  initialValues?: Record<string, any>;
  readonly?: boolean;
  userName?: string;
  actionRef?: React.RefObject<any>;
  processCode?: string;
  row?: Record<string, any>;
  title?: string;
  trigger?: React.ReactNode;
  visible?: boolean;
  width?: number;
}

interface WorkflowNode {
  value: string;
  label: string;
  children?: WorkflowNode[];
}

const workflowUrl = '/workflow/next-node';

const WorkflowForm: React.FC<WorkflowFormProps> = ({
  // onFinish,
  initialValues = {},
  readonly = false,
  row,
  // processId,
  title = '工作流审批',
  actionRef,
}) => {
  const { message } = App.useApp();
  const [loading, setLoading] = useState<boolean>(true);
  const [options, setOptions] = useState<WorkflowNode[]>([]);

  const { work_type, work_id, task_id } = row?.workflow_info || {};
  // 获取工作流节点数据
  const fetchWorkflowData = async () => {
    try {
      setLoading(true);
      const response = await request(workflowUrl, {
        method: 'GET',
        params: {
          work_id: work_id,
          work_type: work_type,
          user_name: localStorage.getItem('userName') || 'liuchenchen',
          task_id: task_id,
        },
      });
      const ok = !!(
        response &&
        (response.success === true || response.code === 200 || response.inside_code === 0)
      );
      if (ok) {
        const normalize = (nodes: any[]): WorkflowNode[] => {
          if (!Array.isArray(nodes)) return [];
          return nodes.map((n: any) => {
            const childrenSrc = n.children || n.nodes || n.child || [];
            return {
              value: String(n.value ?? n.id ?? n.key ?? ''),
              label: String(n.label ?? n.name ?? n.text ?? n.title ?? ''),
              children: normalize(childrenSrc),
            } as WorkflowNode;
          });
        };
        const next = normalize((response?.data as any) || []);
        setOptions(next);
      } else {
        message.error(response?.data?.RetMsg || '获取工作流数据失败');
      }
    } catch (error) {
      console.error('获取工作流数据出错:', error);
      message.error('获取工作流数据出错');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (row?.id) {
      fetchWorkflowData();
    }
  }, [row?.id]);

  return (
    <ProForm
      title={title}
      initialValues={initialValues}
      // trigger={trigger}
      loading={loading}
      onFinish={async (values) => {
        const { work_type, task_id: rowTaskId } = row?.workflow_info || {};
        const taskIdFromRowOrProps = rowTaskId ?? (values?.task_id as any);
        const user =
          (typeof values?.user_name === 'string' && values?.user_name) ||
          localStorage.getItem('userName') ||
          'liuchenchen';

        // 从级联选择中提取选中路径的最后一级标签，拼接为逗号分隔
        const extractAllLevelLabels = (opts: any[], selected: any): string[] => {
          if (!Array.isArray(selected)) return [];
          const labels: string[] = [];
          selected.forEach((path: any[]) => {
            let nodes = opts;
            path.forEach((val) => {
              const node = Array.isArray(nodes)
                ? nodes.find((n: any) => String(n.value) === String(val))
                : undefined;
              if (node) {
                labels.push(String(node.value || ''));
                nodes = node.children || [];
              }
            });
          });
          return labels.filter(Boolean);
        };

        const approvePaths = values?.approve as any[] | undefined;
        const labels = extractAllLevelLabels(options as any[], approvePaths || []);
        const dataText = labels.length > 0 ? labels.join(',') : String(values?.approveInfo || '');
        const approveInfo = String(values?.approveInfo || '');

        const payload: Workflow.ApproveParams = {
          task_id: String(taskIdFromRowOrProps || ''),
          approve_info: approveInfo,
          data: dataText,
          process_id: String(row?.workflow_info?.process_id || ''),
          user_name: user,
          work_type: String(work_type || ''),
          work_id: String(row?.id || ''),
        };

        const res = await approveWorkflow(payload);
        const ok = !!(res && (res.success === true || res.code === 200 || res.inside_code === 0));
        if (ok) {
          message.success(res?.data.RetMsg || '审批提交成功');
          actionRef?.current?.reload();
          return true;
        }
        message.error(res?.data.RetMsg || '审批提交失败');
        return false;
      }}
    >
      <ProFormCascader
        name="approve"
        label="下一节点分支/处理人"
        fieldProps={{
          options: Array.isArray(options) ? options : [],
          multiple: true,
          showSearch: true,
          showCheckedStrategy: Cascader.SHOW_CHILD,
          getPopupContainer: (node) => node?.parentElement || document.body,
          onFocus: (e: any) => {
            e.stopPropagation?.();
          },
          onBlur: (e: any) => {
            e.stopPropagation?.();
          },
          onKeyDown: (e: any) => {
            e.stopPropagation?.();
          },
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
          autoComplete: 'off',
        }}
      />
    </ProForm>
  );
};

export default WorkflowForm;
