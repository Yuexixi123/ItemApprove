import {
  ProFormInstance,
  ProFormSelect,
  ModalForm,
  ActionType,
  ProForm,
  ProFormText,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { useEffect, useRef, useState, useMemo } from 'react';
import { App, Tabs, Spin } from 'antd';
import EditorTable from './EditorTable';
import { useModel } from '@umijs/max';
import {
  getCapacityApprovalDetail,
  getCapacityApprovalModelNames,
  updateCapacityApproval,
} from '@/services/capacity';
import { uploadFile } from '@/services/file/api';

interface UpdateFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  actionRef?: React.MutableRefObject<ActionType | undefined>;
  approvalId?: number;
  row?: Record<string, any>;
}

const UpdateForm = ({
  open,
  setOpen,
  title = '编辑申请',
  actionRef,
  approvalId,
  row,
}: UpdateFormProps) => {
  const { message } = App.useApp();

  const [loading, setLoading] = useState<boolean>(false);
  const [resourceType, setResourceType] = useState<MonitoringItem.ModelNameItem[]>([]);
  const [selectedSysId, setSelectedSysId] = useState<number>();
  const [tableDataMap, setTableDataMap] = useState<Record<number, any[]>>({});
  const [capacityModelOptions, setCapacityModelOptions] = useState<
    Array<{ label: string; value: number }>
  >([]);
  const [isFlowing, setIsFlowing] = useState<boolean>(false);
  const [modelNameMap, setModelNameMap] = useState<Record<number, string>>({});
  const [rowData, setRowData] = useState<any>([]);

  const formRef = useRef<ProFormInstance>();

  const { modelResourceNames, fetchModelResourceNames } = useModel('selectOption', (model) => ({
    modelResourceNames: model.modelResourceNames,
    fetchModelResourceNames: model.fetchModelResourceNames,
  }));

  useEffect(() => {
    fetchModelResourceNames('system');
  }, []);

  // 加载模型选项
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        // 并行请求 main 和 child 类型的模型
        const [resMain, resChild, resChange] = await Promise.all([
          getCapacityApprovalModelNames({ model_type: 'capacity_main' }),
          getCapacityApprovalModelNames({ model_type: 'capacity_child' }),
          getCapacityApprovalModelNames({ custom_group: 'resource_change' }),
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

        // 处理 resource_change 分组
        (resChange?.data || []).forEach((it: any) => {
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

  // 详情加载（不再依赖选项长度，仅在 open 和有 approvalId 时触发）
  useEffect(() => {
    if (!open || !approvalId) return;

    setLoading(true);
    (async () => {
      try {
        const res = await getCapacityApprovalDetail(Number(approvalId));
        setRowData(res?.data || {});

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

          // 如果都找不到，则尝试通过接口获取
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

        // 补充缺失的选项到 capacityModelOptions
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
          project_no: detail.project_no,
          files: detail.files?.map((file: any) => ({
            uid: file.file_id || file.id,
            name: file.file_name || file.name,
            status: 'done',
            response: { id: file.file_id || file.id },
          })),
          project_name: detail.project_name,
          desc: detail.desc,
          model_id: types.map((t) => ({ label: t.label, value: t.value })),
        });

        setIsFlowing(Number(detail.approval_status) === 2);

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
      } finally {
        setLoading(false);
      }
    })();
  }, [open, approvalId]);

  useEffect(() => {
    if (open && row) {
      setIsFlowing(Number(row.approval_status) === 2);
    }
  }, [open, row?.approval_status]);

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
            isShowRecordCreateButton={!isFlowing}
            isShowRecordSubCreateButton={!isFlowing}
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
      onOpenChange={setOpen}
      title={title}
      width={'90%'}
      formRef={formRef}
      modalProps={{
        maskClosable: false,
      }}
      open={open}
      onFinish={async (values) => {
        const resources: Record<string, any[]> = {};
        Object.entries(tableDataMap).forEach(([mid, rows]) => {
          const sanitizedRows = (rows || []).map((item: any) => {
            const cleanItem = { ...item };
            delete (cleanItem as any).id;
            const rel = cleanItem.rel_resource_datas;
            if (Array.isArray(rel)) {
              const grouped: Record<number, any[]> = {};
              rel.forEach((r: any) => {
                const cmid = Number(r.model_id);
                const clean = { ...r };
                delete (clean as any).id;
                if (!grouped[cmid]) grouped[cmid] = [];
                grouped[cmid].push(clean);
              });
              cleanItem.rel_resource_datas = grouped;
            } else if (rel && typeof rel === 'object') {
              const obj = rel as Record<number, any[]>;
              const nextObj: Record<number, any[]> = {};
              Object.keys(obj).forEach((k) => {
                const arr = Array.isArray(obj[Number(k)]) ? obj[Number(k)] : [];
                nextObj[Number(k)] = arr.map((r: any) => {
                  const clean = { ...r };
                  delete (clean as any).id;
                  return clean;
                });
              });
              cleanItem.rel_resource_datas = nextObj;
            }
            return cleanItem;
          });
          resources[String(mid)] = sanitizedRows;
        });

        const payload: CapacityManagement.UpdateApprovalParams = {
          system_id: values.system_id,
          approval_status: values.approval_status,
          resources,
          project_no: values.project_no,
          project_name: values.project_name,
          model_id: Array.isArray(values.model_id)
            ? (values.model_id as any[]).map((v: any) => Number(v?.value ?? v))
            : undefined,
          file_ids: values.files?.map((f: any) => f.response?.id),
        };

        const result = await updateCapacityApproval(String(approvalId ?? ''), payload);
        if ((result as any)?.success) {
          message.success(result?.msg || '成功');
          setOpen(false);
          if (actionRef?.current) actionRef.current.reload();
          return true;
        } else {
          message.error(result?.msg || '失败');
          return false;
        }
      }}
    >
      <Spin spinning={loading}>
        <ProForm.Group>
          <ProFormSelect
            name="system_id"
            label="系统名称"
            width="md"
            options={modelResourceNames}
            rules={[{ required: true, message: '请选择系统名称' }]}
            disabled={isFlowing}
            onChange={(value: number) => {
              setSelectedSysId(value);
              formRef.current?.setFieldValue('model_id', undefined);
              setResourceType([]);
              setTableDataMap({});
            }}
            showSearch={false}
            fieldProps={{
              optionFilterProp: 'label',
              filterOption: false,
              onFocus: (e: any) => e.stopPropagation(),
              onBlur: (e: any) => e.stopPropagation(),
              onKeyDown: (e: any) => e.stopPropagation(),
            }}
          />
          <ProFormSelect
            name="approval_status"
            rules={[{ required: true, message: '请选择状态' }]}
            label="审批状态"
            width="md"
            options={[
              { label: '可编辑', value: 1 },
              { label: '流转中', value: 2 },
            ]}
            disabled={isFlowing}
            fieldProps={{
              onFocus: (e: any) => e.stopPropagation(),
              onBlur: (e: any) => e.stopPropagation(),
              onKeyDown: (e: any) => e.stopPropagation(),
            }}
          />
          <ProFormSelect
            name="model_id"
            rules={[{ required: true, message: '请选择监控项类型' }]}
            width="md"
            label="资源类型"
            allowClear={false}
            disabled={isFlowing}
            onChange={async (value, option) => {
              const optsArr = Array.isArray(option) ? option : [];
              const newOptions = optsArr.map((opt: any) => ({
                label: String(opt?.label ?? opt?.value),
                value: Number(opt?.value),
                model_key: String(opt?.model_key ?? opt?.value),
              }));
              setResourceType(newOptions || []);
            }}
            mode="multiple"
            showSearch={false}
            fieldProps={{
              labelInValue: true,
              optionLabelProp: 'label',
              filterOption: false,
              onFocus: (e: any) => e.stopPropagation(),
              onBlur: (e: any) => e.stopPropagation(),
              onKeyDown: (e: any) => e.stopPropagation(),
            }}
            params={{ open }}
            request={async (params) => {
              if (!params.open) return [];
              const { data } = await getCapacityApprovalModelNames({ model_type: 'capacity_main' });
              return data || [];
            }}
          />
          {rowData?.create_type === 1 && (
            <>
              <ProFormText name="project_no" label="项目编号" width="md" />
              <ProFormText name="project_name" label="项目名称" width="md" />
            </>
          )}
          {rowData?.create_type === 2 && (
            <ProFormTextArea name="desc" label="项目描述" width="md" />
          )}
          <ProFormUploadButton
            name="files"
            label="附件上传"
            fieldProps={{
              name: 'files',
              multiple: true,
              listType: 'text',
              customRequest: async (options) => {
                const { onSuccess, onError, file } = options;
                try {
                  const res = await uploadFile(file as File, 'capacity_approval');
                  if (res && res.success && res.data && res.data.length > 0) {
                    const fileInfo = res.data[0];
                    onSuccess?.({ id: fileInfo.file_id });
                    message.success('上传成功');
                  } else {
                    throw new Error(res?.msg || '上传失败');
                  }
                } catch (err) {
                  onError?.(err as any);
                  message.error('上传失败');
                }
              },
            }}
          />
        </ProForm.Group>

        {resourceType.length > 0 && selectedSysId && (
          <Tabs items={items.map((item) => ({ ...item, key: String(item.key) }))} />
        )}
      </Spin>
    </ModalForm>
  );
};

export default UpdateForm;
