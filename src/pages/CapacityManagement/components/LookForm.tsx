import { useEffect, useState, useMemo } from 'react';
import { Modal, Tabs, Descriptions } from 'antd';
import EditorTable from './EditorTable';
import { getCapacityApprovalDetail, getCapacityApprovalModelNames } from '@/services/capacity';
import WorkflowTable from '@/components/Workflow/WorkflowTable';
import FileDownload from '@/components/FileDownload';

interface LookFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  values?: Record<string, any>;
}

const LookForm = ({ open, setOpen, values }: LookFormProps) => {
  const [resourceType, setResourceType] = useState<MonitoringItem.ModelNameItem[]>([]);
  const [tableDataMap, setTableDataMap] = useState<Record<number, any[]>>({});
  const [detailData, setDetailData] = useState<Record<string, any>>();
  const [capacityModelOptions, setCapacityModelOptions] = useState<
    Array<{ label: string; value: number }>
  >([]);
  // 移除硬编码的映射，改为状态管理
  const [modelNameMap, setModelNameMap] = useState<Record<number, string>>({});

  console.log('capacityModelOptions', capacityModelOptions);

  // 加载模型选项
  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        // 并行请求 main 和 child 类型的模型，以及 resource_change 分组
        const [resMain, resChild, resChange] = await Promise.all([
          getCapacityApprovalModelNames({ model_type: 'capacity_main' }),
          getCapacityApprovalModelNames({ model_type: 'capacity_child' }),
          getCapacityApprovalModelNames({ custom_group: 'resource_change' }),
        ]);

        const list: { label: string; value: number }[] = [];
        const newMap: Record<number, string> = {};

        // 辅助函数：处理响应数据
        const processData = (data: any[]) => {
          (data || []).forEach((it: any) => {
            const value = Number(it.value);
            const label = String(it.label || value);
            // 避免重复添加
            if (!newMap[value]) {
              list.push({ label, value });
              newMap[value] = label;
            }
          });
        };

        processData(resMain?.data || []);
        processData(resChild?.data || []);
        processData(resChange?.data || []);

        setCapacityModelOptions(list);
        setModelNameMap(newMap);
      } catch (error) {
        console.error('加载模型选项失败:', error);
      }
    })();
  }, [open]);

  // 详情加载
  useEffect(() => {
    if (!open || !values?.id) return;

    (async () => {
      try {
        const res = await getCapacityApprovalDetail(Number(values.id));
        const detail: any = (res as any)?.data || (res as any);

        if (!detail) return;

        setDetailData(detail);

        const mids: number[] = Array.isArray(detail.model_id)
          ? detail.model_id.map((n: any) => Number(n))
          : [];

        // 构建类型数组
        const types: MonitoringItem.ModelNameItem[] = mids.map((mid: number) => {
          let opt = capacityModelOptions.find((o) => Number(o.value) === Number(mid));

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

          return {
            label: String(mid),
            value: Number(mid),
            model_key: String(mid),
          } as any;
        });

        // 补充缺失的选项
        const missingOptions = types.filter(
          (t) => !capacityModelOptions.some((opt) => opt.value === t.value),
        );
        if (missingOptions.length > 0) {
          setCapacityModelOptions((prev) => [
            ...prev,
            ...missingOptions.map((t) => ({ label: t.label, value: t.value })),
          ]);
        }

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
  }, [open, values?.id, capacityModelOptions]);

  console.log('resourceType', resourceType);

  const items = useMemo(
    () =>
      resourceType.map((item) => ({
        label: item.label,
        key: item.value,
        children: (
          <EditorTable
            key={item.value}
            modelId={item.value as number}
            approvalId={values?.id}
            cachedData={tableDataMap[item.value] || []}
            row={values}
            isShowUpdateButton={false}
            isShowRecordCreateButton={false} // 查看模式不显示新增按钮
            isShowRecordSubCreateButton={false} // 查看模式不显示子表新增按钮
            onDataChange={() => {}} // 只读模式，不处理数据变化
            modelNameMap={modelNameMap}
          />
        ),
      })),
    [resourceType, tableDataMap, values, modelNameMap],
  );

  return (
    <Modal
      // title={title}
      open={open}
      width="90%"
      onCancel={() => setOpen(false)}
      footer={null}
      destroyOnClose
    >
      <Tabs
        items={[
          {
            key: '1',
            label: '审批详情',
            children: (
              <>
                <Descriptions column={2}>
                  <Descriptions.Item label="系统名称">
                    {detailData?.system_name || values?.system_name || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="审批状态">
                    {detailData?.approval_status === 1
                      ? '可编辑'
                      : detailData?.approval_status === 2
                      ? '流转中'
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="申请类型">
                    {detailData?.create_type === 1
                      ? '新增资源'
                      : detailData?.create_type === 2
                      ? '现有资源'
                      : '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="项目编号">
                    {detailData?.project_no || values?.project_no || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="项目名称">
                    {detailData?.project_name || values?.project_name || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="申请人">
                    {detailData?.create_name || values?.create_name || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="申请时间">
                    {detailData?.create_time || values?.create_time || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="申请原因描述">
                    {detailData?.desc || values?.desc || '-'}
                  </Descriptions.Item>
                  <Descriptions.Item label="附件">
                    {detailData?.files &&
                    Array.isArray(detailData.files) &&
                    detailData.files.length > 0 ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {detailData.files.map((file) => (
                          <FileDownload
                            key={file.file_id || file.id}
                            fileId={file.file_id || file.id}
                            fileName={file.file_name || file.file_name}
                          />
                        ))}
                      </div>
                    ) : detailData?.file_id && Array.isArray(detailData.file_id) ? (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {detailData.file_id.map((fid: string | number, index: number) => (
                          <FileDownload key={fid} fileId={fid} fileName={`附件${index + 1}`} />
                        ))}
                      </div>
                    ) : (
                      '-'
                    )}
                  </Descriptions.Item>
                </Descriptions>

                {resourceType.length > 0 && (
                  <Tabs items={items.map((item) => ({ ...item, key: String(item.key) }))} />
                )}
              </>
            ),
          },
          {
            key: '2',
            label: '流程信息',
            children:
              values?.id && values?.workflow_info?.work_type ? (
                <WorkflowTable
                  workId={values?.id}
                  workType={values?.workflow_info?.work_type}
                  taskId={values?.workflow_info?.task_id}
                  processId={values?.workflow_info?.process_id}
                />
              ) : (
                <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>暂无流程信息</div>
              ),
          },
        ]}
      />
    </Modal>
  );
};

export default LookForm;
