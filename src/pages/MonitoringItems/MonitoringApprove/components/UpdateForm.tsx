import { ProFormInstance, ProFormSelect, ModalForm, ActionType } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { App, Tabs } from 'antd';
import EditModeTable from './EditModeTable';
import { useModel } from '@umijs/max';

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
  approvalId?: number; // 添加审批ID属性
}

const UpdateForm = ({
  open,
  setOpen,
  title = '编辑申请',
  values,
  actionRef,
  approvalId,
}: // setApproveOpen,
UpdateFormProps) => {
  const { message } = App.useApp();
  const [monitoringType, setMonitoringType] = useState<MonitoringItem.ModelNameItem[]>([]);
  const [selectedSysId, setSelectedSysId] = useState<number>(); // 修改为 number 类型
  const [showMonitoringType, setShowMonitoringType] = useState<boolean>(false); // 控制监控项类型显示
  const [cachedResourcesData, setCachedResourcesData] = useState<Record<string, any[]>>({});
  const [approvalDetailData, setApprovalDetailData] = useState<any>(null); // 存储审批详情数据 // 缓存后端返回的原始数据
  const [detailLoading, setDetailLoading] = useState<boolean>(false); // 审批详情加载状态

  const formRef = useRef<ProFormInstance>();

  // 使用监控审批模型
  // 当前代码已经在使用 monitoring 模型
  const {
    monitoringItemModelOptions,
    modelResourcesData,
    createApprovalLoading,
    fetchModelResources,
    fetchMonitoringItemModelNames,
    createMonitoringItemApproval,
    updateMonitoringItemApproval,
    fetchMonitoringItemApprovalDetail,
  } = useModel('monitoring.index', (model) => ({
    hostOptions: model.hostOptions,
    monitoringItemModelOptions: model.monitoringItemModelOptions,
    modelResourcesData: model.modelResourcesData,
    createApprovalLoading: model.createApprovalLoading,
    fetchModelResources: model.fetchModelResources,
    fetchMonitoringItemModelNames: model.fetchMonitoringItemModelNames,
    createMonitoringItemApproval: model.createMonitoringItemApproval,
    updateMonitoringItemApproval: model.updateMonitoringItemApproval,
    fetchMonitoringItemApprovalDetail: model.fetchMonitoringItemApprovalDetail,
  }));

  const { modelResourceNames, fetchModelResourceNames } = useModel('selectOption', (model) => ({
    modelResourceNames: model.modelResourceNames,
    fetchModelResourceNames: model.fetchModelResourceNames,
  }));

  useEffect(() => {
    fetchModelResourceNames('system');
  }, []);

  // 获取审批详情的函数
  const fetchApprovalDetail = async () => {
    if (!approvalId) return;

    setDetailLoading(true);
    try {
      const detailData = await fetchMonitoringItemApprovalDetail(approvalId);
      if (detailData) {
        console.log('获取到审批详情数据:', detailData);

        // 存储审批详情数据
        setApprovalDetailData(detailData);

        // 设置表单字段值
        formRef.current?.setFieldsValue({
          sys_name: detailData.system_id,
          approval_status: detailData.approval_status,
          model_id: detailData.model_id,
        });

        // 设置选中的系统ID状态
        setSelectedSysId(detailData.system_id);
        setShowMonitoringType(!!detailData.system_id);

        // 直接设置缓存的资源数据
        if (detailData.resources) {
          console.log('设置缓存资源数据:', detailData.resources);
          setCachedResourcesData(detailData.resources);
        }
      }
    } catch (error) {
      console.error('获取审批详情失败:', error);
      message.error('获取审批详情失败');
    } finally {
      setDetailLoading(false);
    }
  };

  // 组件挂载或打开时获取系统选项和监控项模型名称
  useEffect(() => {
    if (open) {
      // 重置表单字段
      formRef.current?.resetFields();

      // 重置所有状态
      setMonitoringType([]);
      setSelectedSysId(undefined);
      setShowMonitoringType(false);
      setCachedResourcesData({});
      setApprovalDetailData(null);
      fetchMonitoringItemModelNames();

      // 如果有approvalId，获取审批详情
      if (approvalId) {
        fetchApprovalDetail();
      }
    }
  }, [open, approvalId]);

  // 监听审批详情数据和监控项模型选项，当两者都准备好时设置监控项类型
  useEffect(() => {
    if (approvalDetailData && monitoringItemModelOptions && monitoringItemModelOptions.length > 0) {
      // 如果有model_id，设置监控项类型
      if (approvalDetailData.model_id && approvalDetailData.model_id.length > 0) {
        const filterOption = monitoringItemModelOptions.filter((item) =>
          approvalDetailData.model_id.includes(item.value),
        ) as MonitoringItem.ModelNameItem[];
        console.log('设置监控项类型:', filterOption);
        setMonitoringType(filterOption);
      }
    }
  }, [approvalDetailData, monitoringItemModelOptions]);

  // 表单值初始化 - 移除 resetFields 调用，因为已经在上面的 useEffect 中处理
  useEffect(() => {
    if (values && formRef.current && open && !approvalId) {
      // 只有在没有approvalId时才使用values进行初始化
      // 设置表单字段值
      formRef.current?.setFieldsValue({
        sys_name: values.system_id, // 系统名称字段设置为system_id
        approval_status: values.approval_status,
        model_id: values.model_id,
      });

      // 设置选中的系统ID状态，用于回显
      setSelectedSysId(values.system_id);
      setShowMonitoringType(!!values.system_id);

      // 如果有model_id，设置监控项类型
      if (values.model_id && values.model_id.length > 0) {
        const filterOption = monitoringItemModelOptions?.filter((item) =>
          values.model_id.includes(item.value),
        ) as MonitoringItem.ModelNameItem[];
        setMonitoringType(filterOption);

        // 获取对应的资源数据
        if (values.system_id && filterOption.length > 0) {
          filterOption.forEach((item) => {
            if (item.model_key) {
              fetchModelResources({
                sys_resource_id: values.system_id,
                model_key: item.model_key,
              }).then(() => {
                // 缓存获取到的数据
                const resourceData = modelResourcesData[item.model_key] || [];
                setCachedResourcesData((prev) => ({
                  ...prev,
                  [item.model_key]: [...resourceData],
                }));
              });
            }
          });
        }
      }
    }
  }, [values, open, monitoringItemModelOptions, approvalId]);

  // 生成标签页项
  const items = monitoringType.map((item) => {
    // 尝试通过model_key或model_id获取资源数据
    const resourceData =
      cachedResourcesData[item.model_key] || cachedResourcesData[item.value] || [];
    console.log(`UpdateForm - 为${item.label}(${item.value})获取资源数据:`, resourceData);
    console.log('UpdateForm - 当前缓存数据:', cachedResourcesData);

    return {
      label: item.label,
      key: item.value,
      children: (
        <EditModeTable
          key={item.value}
          modelId={Number(item.value)}
          initialData={resourceData}
          selectedSysId={selectedSysId}
          onDataChange={(data) => {
            setCachedResourcesData((prev) => ({
              ...prev,
              [item.model_key]: data,
              [item.value]: data, // 同时更新model_id键值
            }));
          }}
        />
      ),
    };
  });

  return (
    <ModalForm
      onOpenChange={setOpen}
      title={title}
      width={'90%'}
      formRef={formRef}
      modalProps={{
        maskClosable: false,
        confirmLoading: createApprovalLoading,
      }}
      loading={detailLoading}
      open={open}
      onFinish={async (values) => {
        try {
          const resourcesData: Record<string, any[]> = {};

          // 建立model_key到model_id的映射
          const modelKeyToIdMap = monitoringType.reduce((map, item) => {
            map[item.model_key] = item.value.toString();
            return map;
          }, {} as Record<string, string>);

          // 收集缓存的数据，按model_id分组
          Object.entries(cachedResourcesData).forEach(([modelKey, resourceData]) => {
            const modelId = modelKeyToIdMap[modelKey];
            if (modelId && resourceData && resourceData.length > 0) {
              // 为更新的数据设置适当的action，保留原始id
              const formattedData = resourceData.map((item) => {
                // 只移除index字段，保留原始id
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { index, ...cleanItem } = item;

                // 处理触发器数据
                if (
                  cleanItem.trigger_resource_datas &&
                  Array.isArray(cleanItem.trigger_resource_datas)
                ) {
                  cleanItem.trigger_resource_datas = cleanItem.trigger_resource_datas.map(
                    (trigger: any) => {
                      // 只移除index字段，保留原始触发器id
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { index, ...cleanTrigger } = trigger;

                      // 如果已经有trigger_resource_action字段，保持不变；如果没有且是新建数据，设置为create
                      if (!cleanTrigger.trigger_resource_action && !cleanTrigger.id) {
                        cleanTrigger.trigger_resource_action = 'create';
                      }

                      return cleanTrigger;
                    },
                  );
                }

                // 如果已经有item_resource_action字段，保持不变；如果没有且是新建数据，设置为create
                if (!cleanItem.item_resource_action && !cleanItem.id) {
                  cleanItem.item_resource_action = 'create';
                }

                return cleanItem;
              });

              resourcesData[modelId] = formattedData;
            }
          });

          // 如果是编辑模式且没有缓存数据，使用原始数据
          if (approvalId && approvalDetailData && approvalDetailData.resources) {
            // 检查是否有未处理的model_id，使用原始数据填充
            monitoringType.forEach((item) => {
              const modelId = item.value.toString();
              if (!resourcesData[modelId] && approvalDetailData.resources[modelId]) {
                resourcesData[modelId] = approvalDetailData.resources[modelId];
              }
            });
          }

          const submitData: MonitoringItem.CreateApprovalParams = {
            system_id: values.sys_name,
            model_id: values.model_id,
            resources: resourcesData,
            approval_status: values.approval_status,
          };

          // 根据是否有approvalId决定调用创建还是更新接口
          let result;
          if (approvalId) {
            // 编辑模式：调用更新接口
            result = await updateMonitoringItemApproval(approvalId, submitData);
          } else {
            // 新建模式：调用创建接口
            result = await createMonitoringItemApproval(submitData);
          }

          // 检查结果
          if (result.success) {
            // 成功后关闭弹窗并调用成功回调
            setOpen(false);
            message.success(result.message || '成功');
            // 刷新列表
            if (actionRef?.current) {
              actionRef.current.reload();
            }
            return true;
          } else {
            // 失败，显示错误信息但不关闭弹窗
            message.error(result.message || '失败');
            return false;
          }
        } catch (error) {
          console.error('创建监控项审批失败:', error);
          return false;
        }
      }}
    >
      <ProFormSelect
        name="sys_name"
        label="系统名称"
        options={modelResourceNames}
        onChange={(value: number) => {
          setSelectedSysId(value);
          setShowMonitoringType(!!value);
        }}
        showSearch
        fieldProps={{
          optionFilterProp: 'label',
          disabled: true,
        }}
      />
      {/* <ProFormSelect
                name='host_name'
                label='主机名称'
                options={hostOptions}
                onChange={(value: string) => {
                    setSelectedHostId(value); // 保存选中的主机ID
                    setShowMonitoringType(!!value); // 有选择主机时显示监控项类型
                }}
                showSearch
                fieldProps={{
                    optionFilterProp: 'label',
                }}
            /> */}
      <ProFormSelect
        name="approval_status"
        rules={[{ required: true, message: '请选择状态' }]}
        label="审批状态"
        options={[
          { label: '可编辑', value: 1 },
          { label: '流转中', value: 2 },
        ]}
      />
      {showMonitoringType && (
        <ProFormSelect
          name="model_id"
          rules={[{ required: true, message: '请选择监控项类型' }]}
          label="监控项类型"
          allowClear={false}
          mode="multiple"
          options={monitoringItemModelOptions}
          // 在 onChange 中添加日志
          onChange={(value: number[]) => {
            const filterOption = monitoringItemModelOptions?.filter((item) =>
              value.includes(item.value),
            ) as MonitoringItem.ModelNameItem[];
            setMonitoringType(filterOption);

            if (selectedSysId && filterOption.length > 0) {
              filterOption.forEach((item) => {
                fetchModelResources({
                  sys_resource_id: selectedSysId,
                  model_key: item.model_key,
                }).then(() => {
                  // 缓存获取到的数据
                  const resourceData = modelResourcesData[item.model_key] || [];
                  setCachedResourcesData((prev) => ({
                    ...prev,
                    [item.model_key]: [...resourceData],
                  }));
                });
              });
            }
          }}
          showSearch
          fieldProps={{
            optionFilterProp: 'label',
            disabled: true,
          }}
        />
      )}
      {/* 只有当监控项类型不为空时才显示监控项列表 */}
      {monitoringType.length > 0 && selectedSysId && (
        <Tabs items={items.map((item) => ({ ...item, key: String(item.key) }))} />
      )}
    </ModalForm>
  );
};

export default UpdateForm;
