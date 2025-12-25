import {
  ProFormInstance,
  ProFormSelect,
  ModalForm,
  ActionType,
  ProForm,
  ProFormTextArea,
  ProFormUploadButton,
} from '@ant-design/pro-components';
import { useEffect, useRef, useState, useMemo } from 'react';
import { App, Tabs } from 'antd';
import { getCapacityApprovalModelNames } from '@/services/capacity';
import GetResourceEditorTable from './GetResourceEditorTable';
import { useModel } from '@umijs/max';
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
  title = '现有资源申请',
  actionRef,
}: // setApproveOpen,
UpdateFormProps) => {
  const { message } = App.useApp();
  const [resourceType, setResourceType] = useState<MonitoringItem.ModelNameItem[]>([]);
  const [selectedSysId, setSelectedSysId] = useState<number>(); // 修改为 number 类型
  // 新增：为每个模型的表格数据维护状态
  const [tableDataMap, setTableDataMap] = useState<Record<number, any[]>>({});
  const [activeTabKey, setActiveTabKey] = useState<number | undefined>(undefined);
  // 记录已访问过的 Tab，避免重复渲染导致重新请求
  const [visitedTabKeys, setVisitedTabKeys] = useState<Set<number>>(new Set());

  // 提前声明表单引用，避免“使用前未定义”的校验错误
  const formRef = useRef<ProFormInstance>();

  // 当对话框关闭时，清空所有数据
  useEffect(() => {
    if (!open) {
      // 对话框关闭时清空数据
      setTableDataMap({});
      setResourceType([]);
      setSelectedSysId(undefined);
      setVisitedTabKeys(new Set());
      formRef.current?.resetFields();
    }
  }, [open]);

  // 监听 activeTabKey 变化，更新 visitedTabKeys
  useEffect(() => {
    if (activeTabKey !== undefined) {
      setVisitedTabKeys((prev) => {
        const next = new Set(prev);
        next.add(activeTabKey);
        return next;
      });
    }
  }, [activeTabKey]);

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
        const shouldRender = visitedTabKeys.has(Number(item.value)) || item.value === activeTabKey;
        return {
          label: item.label,
          key: item.value,
          children: shouldRender ? (
            <GetResourceEditorTable
              key={item.value}
              modelId={item.value as number}
              cachedData={tableDataMap[item.value] || []}
              sysResourceId={selectedSysId}
              onDataChange={(data) => {
                setTableDataMap((prev) => ({
                  ...prev,
                  [item.value]: data,
                }));
              }}
            />
          ) : (
            <div style={{ minHeight: 400 }} />
          ), // 占位符，避免未渲染时高度塌陷
        };
      }),
    [resourceType, tableDataMap, activeTabKey, selectedSysId, visitedTabKeys],
  );

  return (
    <ModalForm
      onOpenChange={setOpen}
      title={title}
      width={'90%'}
      formRef={formRef}
      modalProps={{
        maskClosable: false,
        destroyOnClose: true, // 确保关闭时销毁 Modal 内容
      }}
      open={open}
      onFinish={async (values) => {
        const sanitizedMap: Record<number, any[]> = {};
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
          sanitizedMap[Number(mid)] = sanitizedRows;
        });

        const payload = {
          system_id: selectedSysId,
          approval_status: values?.approval_status,
          desc: values?.desc,
          create_type: 2,
          resources: sanitizedMap,
          file_ids: values.files?.map((f: any) => f.response?.id),
        } as CapacityManagement.CreateApprovalParams;

        const result = await createCapacityApproval(payload);
        if (result?.inside_code === 0) {
          setOpen(false);
          setTableDataMap({});
          if (actionRef?.current) {
            actionRef.current.reload();
          }
          message.success(result.msg || '容量管理审批创建成功');
          return true;
        } else {
          message.error(result?.msg || '容量管理审批创建失败');
        }
        return false;
      }}
    >
      <ProForm.Group>
        <ProFormSelect
          name="sys_name"
          width="md"
          label="系统名称"
          options={modelResourceNames}
          rules={[{ required: true, message: '请选择系统名称' }]}
          onChange={async (value: number) => {
            setSelectedSysId(value);
            // 选择系统后，动态获取资源类型
            try {
              const { data } = await getCapacityApprovalModelNames({ model_type: 'capacity_main' });
              if (data && Array.isArray(data) && data.length > 0) {
                const dynamicTypes = data.map((item: any) => ({
                  label: item.label,
                  value: item.value,
                  model_key: item.model_key,
                }));
                setResourceType(dynamicTypes);
                setActiveTabKey(dynamicTypes[0].value);
              } else {
                setResourceType([]);
                setActiveTabKey(undefined);
              }
            } catch (e) {
              setResourceType([]);
              setActiveTabKey(undefined);
            }
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
        />
        <ProFormUploadButton
          name="files"
          label="附件上传"
          width="md"
          fieldProps={{
            name: 'files',
            multiple: true,
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
        <ProFormTextArea
          name="desc"
          label="申请原因描述"
          rules={[{ required: true, message: '请输入申请原因描述' }]}
          width="md"
          fieldProps={{
            onKeyDown: (e: any) => e.stopPropagation(),
          }}
        />
      </ProForm.Group>
      {/* 只有当监控项类型不为空时才显示监控项列表 */}
      {selectedSysId && (
        <Tabs
          activeKey={String(activeTabKey)}
          onChange={(key) => setActiveTabKey(Number(key))}
          items={items.map((item) => ({ ...item, key: String(item.key) }))}
        />
      )}
    </ModalForm>
  );
};

export default CreateForm;
