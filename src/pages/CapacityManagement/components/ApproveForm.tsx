import {
  ProFormInstance,
  ProFormSelect,
  ProForm,
  ActionType,
  ModalForm,
  ProFormCascader,
  ProFormTextArea,
  ProFormText,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { useEffect, useRef, useState, useMemo } from 'react';
import { App, Tabs, Cascader, Divider, Card } from 'antd';
import { request } from '@umijs/max';
import EditorTable from './EditorTable';
import { useModel } from '@umijs/max';
import { getCapacityApprovalDetail, getCapacityApprovalModelNames } from '@/services/capacity';
import { approveWorkflow } from '@/services/workflow/api';
import WorkflowTable from '@/components/Workflow/WorkflowTable';

interface UpdateFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  actionRef?: React.MutableRefObject<ActionType | undefined>;
  approvalId?: number;
  row?: Record<string, any>;
}

interface WorkflowNode {
  value: string;
  label: string;
  children?: WorkflowNode[];
}

const workflowUrl = '/workflow/next-node';

const ApproveForm = ({
  open,
  setOpen,
  title = '编辑申请',
  actionRef,
  approvalId,
  row,
}: UpdateFormProps) => {
  const { message } = App.useApp();

  const [resourceType, setResourceType] = useState<MonitoringItem.ModelNameItem[]>([]);
  const [selectedSysId, setSelectedSysId] = useState<number>();
  const [tableDataMap, setTableDataMap] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [submitLoading, setSubmitLoading] = useState<boolean>(false);
  const [options, setOptions] = useState<WorkflowNode[]>([]);
  const [activeKey, setActiveKey] = useState<string>('1');
  const [workflowLoaded, setWorkflowLoaded] = useState<boolean>(false);
  const [capacityModelOptions, setCapacityModelOptions] = useState<
    Array<{ label: string; value: number }>
  >([]);
  // 移除硬编码的映射，改为状态管理
  const [modelNameMap, setModelNameMap] = useState<Record<number, string>>({});
  const { work_type, work_id, task_id } = row?.workflow_info || {};

  const formRef = useRef<ProFormInstance>();

  const approveFormRef = useRef<ProFormInstance>();

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
      message.error('获取工作流数据出错');
    } finally {
      setLoading(false);
    }
  };

  const { modelResourceNames, fetchModelResourceNames } = useModel('selectOption', (model) => ({
    modelResourceNames: model.modelResourceNames,
    fetchModelResourceNames: model.fetchModelResourceNames,
  }));

  // 详情加载
  useEffect(() => {
    if (!open || !approvalId) return;

    // 重置状态
    setActiveKey('1');
    setWorkflowLoaded(false);
    setOptions([]);
    setTableDataMap({});
    setResourceType([]);
    setSelectedSysId(undefined);
    formRef.current?.resetFields();
    approveFormRef.current?.resetFields();

    // 发起请求
    fetchWorkflowData();

    // 加载审批详情
    (async () => {
      try {
        const res = await getCapacityApprovalDetail(Number(approvalId));
        const detail: any = (res as any)?.data || (res as any);

        if (!detail) return;

        const mids: number[] = Array.isArray(detail.model_id)
          ? detail.model_id.map((n: any) => Number(n))
          : [];

        // 构建类型数组，优先从 capacityModelOptions 中查找，找不到则使用 modelNameMap
        const types: MonitoringItem.ModelNameItem[] = mids.map((mid: number) => {
          // 先在 capacityModelOptions 中查找
          let opt = capacityModelOptions.find((o) => Number(o.value) === Number(mid));

          // 如果找不到，使用 modelNameMap 创建选项
          if (!opt && modelNameMap[mid]) {
            opt = { label: modelNameMap[mid], value: mid };
          }

          if (opt) {
            return {
              label: opt.label,
              value: Number(opt.value),
              model_key: String(opt.value),
            } as any;
          }

          // 如果找不到，则尝试通过接口获取
          return {
            label: String(mid),
            value: Number(mid),
            model_key: String(mid),
            needFetch: true, // 标记需要获取
          } as any;
        });

        // 收集需要获取名称的 modelId
        const missingIds = types.filter((t: any) => t.needFetch).map((t) => t.value);
        if (missingIds.length > 0) {
          try {
            // 并行请求 main 和 child 类型的模型
            const [resMain, resChild] = await Promise.all([
              getCapacityApprovalModelNames({ model_type: 'capacity_main' }),
              getCapacityApprovalModelNames({ model_type: 'capacity_child' }),
            ]);

            const allModelNames = [...(resMain?.data || []), ...(resChild?.data || [])];

            if (allModelNames && Array.isArray(allModelNames)) {
              types.forEach((t: any) => {
                if (t.needFetch) {
                  const found = allModelNames.find((m: any) => Number(m.value) === t.value);
                  if (found) {
                    t.label = found.label;
                    t.needFetch = false;
                  }
                }
              });
            }
          } catch (e) {
            console.error('获取所有模型名称失败', e);
          }
        }

        // 同时需要确保 capacityModelOptions 包含这些选项（用于下拉框显示）
        const missingOptions = types.filter(
          (t) => !capacityModelOptions.some((opt) => opt.value === t.value),
        );
        if (missingOptions.length > 0) {
          setCapacityModelOptions((prev) => [
            ...prev,
            ...missingOptions.map((t) => ({ label: t.label, value: t.value })),
          ]);
        }

        // 设置表单值
        formRef.current?.setFieldsValue({
          system_id: detail.system_id,
          approval_status: detail.approval_status,
          project_name: detail.project_name,
          project_no: detail.project_no,
          files: detail.files?.map((file: any) => ({
            uid: file.file_id || file.id,
            name: file.file_name || file.name,
            status: 'done',
            response: { id: file.file_id || file.id },
            url: `/api/v1/file/${file.file_id || file.id}`,
          })),
          model_id: types.map((t) => ({ label: t.label, value: t.value })),
        });

        setSelectedSysId(Number(detail.system_id));
        setResourceType(types);

        const resMap = (detail.resource_data || detail.resources || {}) as Record<string, any[]>;
        const nextMap: Record<number, any[]> = {};
        Object.keys(resMap).forEach((k) => {
          nextMap[Number(k)] = Array.isArray(resMap[k]) ? resMap[k] : [];
        });
        setTableDataMap(nextMap);
      } catch (error) {
        console.error('加载详情失败:', error);
      }
    })();
  }, [open, approvalId]);

  useEffect(() => {
    fetchModelResourceNames('system');
  }, []);

  // 加载模型选项
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        // 并行请求 main 和 child 类型的模型
        const [resMain, resChild] = await Promise.all([
          getCapacityApprovalModelNames({ model_type: 'capacity_main' }),
          getCapacityApprovalModelNames({ model_type: 'capacity_child' }),
        ]);

        const list: { label: string; value: number }[] = [];
        const newMap: Record<number, string> = {};

        // 处理 main 类型
        (resMain?.data || []).forEach((it: any) => {
          const value = Number(it.value);
          const label = String(it.label || value);
          list.push({ label, value });
          newMap[value] = label;
        });

        // 处理 child 类型
        (resChild?.data || []).forEach((it: any) => {
          const value = Number(it.value);
          const label = String(it.label || value);
          list.push({ label, value });
          newMap[value] = label;
        });

        setCapacityModelOptions(list);
        setModelNameMap(newMap);
      } catch (error) {
        console.error('加载模型选项失败:', error);
      }
    })();
  }, [open]);

  const items = useMemo(
    () =>
      resourceType.map((item) => ({
        label: item.label,
        key: item.value,
        children: (
          <EditorTable
            key={item.value}
            modelId={item.value as number}
            approvalId={approvalId}
            cachedData={tableDataMap[item.value] || []}
            isShowRecordCreateButton={false}
            isShowRecordSubCreateButton={false}
            isShowUpdateButton={false}
            row={row}
            onDataChange={(data) => {
              setTableDataMap((prev) => ({
                ...prev,
                [item.value]: data,
              }));
            }}
          />
        ),
      })),
    [resourceType, tableDataMap],
  );

  return (
    <ModalForm
      open={open}
      onOpenChange={setOpen}
      width={'90%'}
      grid
      formRef={approveFormRef}
      loading={loading}
      onFinish={async (values) => {
        setSubmitLoading(true);
        try {
          const {
            work_type,
            task_id: rowTaskId,
            process_id: rowProcessId,
          } = row?.workflow_info || {};
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
            user_name: user,
            process_id: String(rowProcessId || ''),
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
        } catch (error) {
          message.error('审批提交出错');
          return false;
        } finally {
          setSubmitLoading(false);
        }
      }}
      submitter={{
        submitButtonProps: {
          loading: submitLoading,
        },
      }}
    >
      <Tabs
        items={[
          {
            key: '1',
            label: '审批',
            children: (
              <>
                <ProForm
                  title={title}
                  formRef={formRef}
                  submitter={false}
                  disabled={true}
                  component={false}
                >
                  <ProForm.Group>
                    <ProFormSelect
                      name="system_id"
                      width="md"
                      label="系统名称"
                      options={modelResourceNames}
                      showSearch={false}
                      fieldProps={{
                        optionFilterProp: 'label',
                        filterOption: false,
                      }}
                    />
                    <ProFormSelect
                      name="approval_status"
                      width="md"
                      label="审批状态"
                      options={[
                        { label: '可编辑', value: 1 },
                        { label: '流转中', value: 2 },
                      ]}
                    />
                    <ProFormSelect
                      name="model_id"
                      label="资源类型"
                      width="md"
                      mode="multiple"
                      showSearch={false}
                      fieldProps={{
                        labelInValue: true,
                        optionLabelProp: 'label',
                        filterOption: false,
                      }}
                      params={{ open }}
                      request={async (params) => {
                        if (!params.open) return [];
                        const { data } = await getCapacityApprovalModelNames({
                          model_type: 'capacity_main',
                        });
                        return data || [];
                      }}
                    />
                    <ProFormText width="sm" name="project_no" label="项目编号" />
                    <ProFormText width="sm" name="project_name" label="项目名称" />
                    <ProFormUploadButton
                      name="files"
                      label="附件"
                      disabled={true}
                      fieldProps={{
                        name: 'files',
                        listType: 'text',
                        multiple: true,
                      }}
                    />
                  </ProForm.Group>
                  {resourceType.length > 0 && selectedSysId && (
                    <Tabs items={items.map((item) => ({ ...item, key: String(item.key) }))} />
                  )}
                </ProForm>
                <Divider></Divider>
                <ProForm.Group style={{ display: 'flex', justifyContent: 'center' }}>
                  <Card style={{ width: '100%', maxWidth: 800 }}>
                    <ProFormCascader
                      name="approve"
                      label="下一节点分支/处理人"
                      width="lg"
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
                      placeholder="请选择下一节点分支/处理人"
                    />
                    <ProFormTextArea
                      name="approveInfo"
                      width="lg"
                      label="审批意见"
                      placeholder="请输入审批意见"
                      rules={[{ required: true, message: '请输入审批意见' }]}
                      fieldProps={{
                        rows: 4,
                        autoComplete: 'off',
                      }}
                    />
                  </Card>
                </ProForm.Group>
              </>
            ),
          },
          {
            key: '2',
            label: '流程信息',
            children: (workflowLoaded || activeKey === '2') && (
              <WorkflowTable
                workId={row?.id}
                taskId={row?.workflow_info?.task_id}
                workType={row?.workflow_info?.work_type}
                processId={row?.workflow_info?.process_id}
              />
            ),
          },
        ]}
        activeKey={activeKey}
        style={{ width: '100%' }}
        onChange={(key) => {
          setActiveKey(key);
          if (key === '2') {
            setWorkflowLoaded(true);
          }
        }}
      />
    </ModalForm>
  );
};

export default ApproveForm;
