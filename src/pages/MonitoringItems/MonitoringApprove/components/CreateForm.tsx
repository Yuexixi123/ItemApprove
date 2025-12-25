import { ProFormInstance, ProFormSelect, ModalForm, ActionType } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { App, Tabs } from 'antd';
import EditorTable from './EditorTable';
import { useModel } from '@umijs/max';

// 修改接口定义，使用正确的命名空间
interface UpdateFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  values?: MonitoringItem.ApprovalItem; // 修改为正确的类型
  setRow?: (row: MonitoringItem.ApprovalItem | undefined) => void;
  modelId?: number;
  setApproveOpen?: (open: boolean) => void;
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
  const [monitoringType, setMonitoringType] = useState<MonitoringItem.ModelNameItem[]>([]);
  const [selectedSysId, setSelectedSysId] = useState<number>(); // 修改为 number 类型
  const [showMonitoringType, setShowMonitoringType] = useState<boolean>(false); // 控制监控项类型显示
  const [cachedResourcesData, setCachedResourcesData] = useState<Record<string, any[]>>({}); // 缓存后端返回的原始数据

  const formRef = useRef<ProFormInstance>();

  // 使用监控审批模型
  // 当前代码已经在使用 monitoring 模型
  const {
    monitoringItemModelOptions,
    modelResourcesData,
    resourcesLoading,
    createApprovalLoading,
    fetchModelResources,
    fetchMonitoringItemModelNames,
    createMonitoringItemApproval,
  } = useModel('monitoring.index', (model) => ({
    hostOptions: model.hostOptions,
    monitoringItemModelOptions: model.monitoringItemModelOptions,
    modelResourcesData: model.modelResourcesData,
    resourcesLoading: model.resourcesLoading,
    createApprovalLoading: model.createApprovalLoading,
    fetchModelResources: model.fetchModelResources,
    fetchMonitoringItemModelNames: model.fetchMonitoringItemModelNames,
    createMonitoringItemApproval: model.createMonitoringItemApproval,
  }));

  const { modelResourceNames, fetchModelResourceNames } = useModel('selectOption', (model) => ({
    modelResourceNames: model.modelResourceNames,
    fetchModelResourceNames: model.fetchModelResourceNames,
  }));

  useEffect(() => {
    fetchModelResourceNames('system');
  }, []);

  // 2. 修改 CreateForm.tsx 中的逻辑
  // 移除默认的 useEffect 调用
  // useEffect(() => {
  //     fetchModelResources({ sys_resource_id: selectedSysId })
  // }, [models])

  // 修改 handleHostSearch 方法
  const handleHostSearch = (hostResourceId?: number) => {
    if (selectedSysId && monitoringType.length > 0) {
      monitoringType.forEach((item) => {
        // 确保 model_key 存在
        if (item.model_key) {
          const searchParams = {
            sys_resource_id: selectedSysId,
            model_key: item.model_key,
            ...(hostResourceId && { host_resource_id: hostResourceId }),
          };
          fetchModelResources(searchParams).then(() => {
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
  };

  // 监听modelResourcesData变化，自动缓存数据
  useEffect(() => {
    // 当modelResourcesData更新时，自动缓存数据
    Object.entries(modelResourcesData).forEach(([modelKey, resourceData]) => {
      if (resourceData && resourceData.length > 0) {
        setCachedResourcesData((prev) => ({
          ...prev,
          [modelKey]: [...resourceData],
        }));
      }
    });
  }, [modelResourcesData]);

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
      fetchMonitoringItemModelNames();
    }
  }, [open]);
  // 生成标签页项
  const items = monitoringType.map((item) => {
    const resourceData = modelResourcesData[item.model_key] || [];
    const isLoading = resourcesLoading[item.model_key] || false;

    return {
      label: item.label,
      key: item.value,
      children: (
        <EditorTable
          key={item.value}
          modelId={Number(item.value)}
          resourceData={resourceData}
          loading={isLoading}
          selectedSysId={selectedSysId}
          cachedData={cachedResourcesData[item.model_key] || []}
          onSearch={(hostResourceId) => handleHostSearch(hostResourceId)}
          onDataChange={(data) => {
            // 更新缓存数据
            console.log(`CreateForm - 接收到 ${item.model_key} 数据变化:`, data);
            setCachedResourcesData((prev) => ({
              ...prev,
              [item.model_key]: data,
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
      open={open}
      onFinish={async (values) => {
        console.log('=== onFinish 被调用 ===');
        console.log('表单值:', values);

        try {
          console.log('=== CreateForm 提交开始 ===');
          console.log('缓存数据:', cachedResourcesData);
          console.log('监控类型:', monitoringType);

          const resourcesData: Record<string, any[]> = {};

          // 建立model_key到model_id的映射
          const modelKeyToIdMap = monitoringType.reduce((map, item) => {
            map[item.model_key] = item.value.toString();
            return map;
          }, {} as Record<string, string>);

          console.log('模型映射:', modelKeyToIdMap);

          // 收集缓存的数据，按model_id分组
          Object.entries(cachedResourcesData).forEach(([modelKey, resourceData]) => {
            const modelId = modelKeyToIdMap[modelKey];
            console.log(`处理模型 ${modelKey} -> ${modelId}:`, resourceData);
            if (modelId && resourceData && resourceData.length > 0) {
              // 根据数据状态设置适当的action
              const formattedData = resourceData.map((item) => {
                // 保留原始id，只移除index字段
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { index, ...cleanItem } = item;

                // 处理触发器数据
                if (
                  cleanItem.trigger_resource_datas &&
                  Array.isArray(cleanItem.trigger_resource_datas)
                ) {
                  cleanItem.trigger_resource_datas = cleanItem.trigger_resource_datas.map(
                    (trigger: any) => {
                      // 保留原始触发器id，只移除index字段
                      // eslint-disable-next-line @typescript-eslint/no-unused-vars
                      const { index, ...cleanTrigger } = trigger;
                      // 只保留已有的action标记，不为原始触发器数据设置action
                      return {
                        ...cleanTrigger,
                        ...(cleanTrigger.trigger_resource_action && {
                          trigger_resource_action: cleanTrigger.trigger_resource_action,
                        }),
                      };
                    },
                  );
                }

                // 只有明确标记为需要创建的数据才设置action
                return {
                  ...cleanItem,
                  // 只保留已有的action标记，不为原始数据设置action
                  ...(cleanItem.item_resource_action && {
                    item_resource_action: cleanItem.item_resource_action,
                  }),
                };
              });

              resourcesData[modelId] = formattedData;
            }
          });

          const submitData: MonitoringItem.CreateApprovalParams = {
            system_id: values.system_id,
            model_id: values.model_id,
            resources: resourcesData,
            approval_status: values.approval_status,
          };

          console.log('最终提交数据:', submitData);
          console.log('=== CreateForm 提交结束 ===');

          // 调用model层方法创建审批
          const result = await createMonitoringItemApproval(submitData);

          // 检查创建结果
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
            // 创建失败，显示错误信息但不关闭弹窗
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
        name="system_id"
        label="系统名称"
        options={modelResourceNames}
        onChange={(value: number) => {
          // 修改类型为 number
          setSelectedSysId(value);
          setShowMonitoringType(!!value);

          // 清除监控项类型字段的值和相关状态
          formRef.current?.setFieldValue('model_id', undefined);
          setMonitoringType([]);
          setCachedResourcesData({});
        }}
        showSearch
        fieldProps={{
          optionFilterProp: 'label',
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
                console.log('获取资源数据，参数:', {
                  sys_resource_id: selectedSysId,
                  model_key: item.model_key,
                });

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

export default CreateForm;
