import {
  ProFormInstance,
  ProFormSelect,
  ModalForm,
  ActionType,
  ProForm,
  ProFormText,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { useEffect, useRef, useState, useMemo } from 'react';
import { App, Tabs } from 'antd';
import EditorTable from './EditorTable';
import { useModel } from '@umijs/max';
import { getCapacityApprovalModelNames } from '@/services/capacity';
import { uploadFile } from '@/services/file/api';

// 修改接口定义，使用正确的命名空间
interface UpdateFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  values?: MonitoringItem.ApprovalItem; // 修改为正确的类型
  setRow?: (row: MonitoringItem.ApprovalItem | undefined) => void;
  modelId?: number;
  setApproveOpen: (open: boolean) => void;
  actionRef?: React.MutableRefObject<ActionType | undefined>; // 添加actionRef属性
}

const CreateForm = ({
  open,
  setOpen,
  title = '新增申请',
  actionRef,
}: // setApproveOpen,
UpdateFormProps) => {
  const { message } = App.useApp();

  const [resourceType, setResourceType] = useState<MonitoringItem.ModelNameItem[]>([]);
  const [selectedSysId, setSelectedSysId] = useState<number>(); // 修改为 number 类型
  // 新增：为每个模型的表格数据维护状态
  const [tableDataMap, setTableDataMap] = useState<Record<number, any[]>>({});

  // 提前声明表单引用，避免“使用前未定义”的校验错误
  const formRef = useRef<ProFormInstance>();

  // 当对话框关闭时，清空所有数据
  useEffect(() => {
    if (!open) {
      // 对话框关闭时清空数据
      setTableDataMap({});
      setResourceType([]);
      setSelectedSysId(undefined);
      formRef.current?.resetFields();
    }
  }, [open]);

  const { modelResourceNames, fetchModelResourceNames } = useModel('selectOption', (model) => ({
    modelResourceNames: model.modelResourceNames,
    fetchModelResourceNames: model.fetchModelResourceNames,
  }));

  // 使用容量管理模型，获取模型属性并生成列
  const { createCapacityApproval } = useModel('capacity.index', (model) => ({
    createCapacityApproval: model.createCapacityApproval,
  }));

  useEffect(() => {
    fetchModelResourceNames('system');
  }, []);

  // 生成标签页项
  const items = useMemo(
    () =>
      resourceType.map((item) => {
        return {
          label: item.label,
          key: item.value,
          children: (
            <EditorTable
              key={item.value}
              modelId={item.value as number}
              cachedData={tableDataMap[item.value] || []} // 传入缓存的表格数据
              onDataChange={(data) => {
                // 监听表格数据变化，保存到状态中
                setTableDataMap((prev) => ({
                  ...prev,
                  [item.value]: data,
                }));
              }}
            />
          ),
        };
      }),
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
        // 构建提交数据：去除所有资源的 id 字段（包含子资源），与 GetResourceCreateForm.tsx 格式一致
        const sanitizedMap: Record<number, any[]> = {};
        Object.entries(tableDataMap).forEach(([mid, rows]) => {
          const sanitizedRows = (rows || []).map((item: any) => {
            const cleanItem = { ...item };
            delete (cleanItem as any).id;
            const rel = cleanItem.rel_resource_datas;
            if (Array.isArray(rel)) {
              const grouped: Record<number, any[]> = {};
              rel.forEach((r: any) => {
                const mid = Number(r.model_id);
                const clean = { ...r };
                delete (clean as any).id;
                if (!grouped[mid]) grouped[mid] = [];
                grouped[mid].push(clean);
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
          sanitizedMap[Number(mid)] = sanitizedRows;
        });

        const payload: CapacityManagement.CreateApprovalParams = {
          system_id: values.system_id,
          approval_status: values.approval_status,
          project_no: values.project_no,
          project_name: values.project_name,
          create_type: 1,
          resources: sanitizedMap,
          file_ids: values.files?.map((f: any) => f.response?.id),
        };

        const result = await createCapacityApproval(payload);
        if (result.success) {
          // 成功后关闭对话框并清空数据
          message.success(result.msg || '创建成功');
          setOpen(false);
          setTableDataMap({});
          // 刷新外层列表
          if (actionRef?.current) {
            actionRef.current.reload();
          }
          return true;
        } else {
          message.error(result.msg || '创建失败');
        }
        return false;
      }}
    >
      <ProForm.Group>
        <ProFormSelect
          name="system_id"
          label="系统名称"
          width="md"
          options={modelResourceNames}
          rules={[{ required: true, message: '请选择系统名称' }]}
          onChange={(value: number) => {
            // 修改类型为 number
            setSelectedSysId(value);
            // 清除监控项类型字段的值和相关状态
            formRef.current?.setFieldValue('model_id', undefined);
            setResourceType([]);
            setTableDataMap({}); // 清空表格数据
          }}
          showSearch={true}
          fieldProps={{
            optionFilterProp: 'label',
            filterOption: (input, option) =>
              (option?.label ?? '').toLowerCase().includes(input.toLowerCase()),
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
          onChange={async (value, option) => {
            if (!Array.isArray(option)) {
              return;
            }
            const newOptions = option?.map(
              (option: { label: string; value: number; model_key: string }) => {
                return {
                  label: option.label,
                  value: option.value,
                  model_key: option.model_key,
                };
              },
            );
            setResourceType(newOptions || []);
          }}
          mode="multiple"
          showSearch={false}
          fieldProps={{
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
        <ProFormText width="md" name="project_no" label="项目编号" />
        <ProFormText
          width="md"
          name="project_name"
          label="项目名称"
          rules={[{ required: true, message: '请输入项目名称' }]}
        />
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

      {/* 只有当监控项类型不为空时才显示监控项列表 */}
      {resourceType.length > 0 && selectedSysId && (
        <Tabs items={items.map((item) => ({ ...item, key: String(item.key) }))} />
      )}
    </ModalForm>
  );
};

export default CreateForm;
