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
  setApproveOpen: (open: boolean) => void;
  actionRef?: React.MutableRefObject<ActionType | undefined>; // 添加actionRef属性
}

const CreateForm = ({
  open,
  setOpen,
  title = '新增申请',
  values,
  actionRef,
}: // setApproveOpen,
UpdateFormProps) => {
  const { message } = App.useApp();
  const [monitoringType, setMonitoringType] = useState<MonitoringItem.ModelNameItem[]>([]);
  const [selectedSysId, setSelectedSysId] = useState<number>(); // 修改为 number 类型
  const [showMonitoringType, setShowMonitoringType] = useState<boolean>(false); // 控制监控项类型显示
  const [cachedResourcesData, setCachedResourcesData] = useState<Record<string, any[]>>({}); // 缓存后端返回的原始数据
  const [changedResourcesData, setChangedResourcesData] = useState<
    Record<string, { created: any[]; updated: any[]; deleted: any[] }>
  >({}); // 存储变更的数据

  console.log('values', values);

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
    console.log('modelResourcesData变化，更新缓存:', modelResourcesData);
    // 当modelResourcesData更新时，自动缓存数据
    Object.entries(modelResourcesData).forEach(([modelKey, resourceData]) => {
      if (resourceData && resourceData.length > 0) {
        setCachedResourcesData((prev) => ({
          ...prev,
          [modelKey]: [...resourceData],
        }));
        console.log(`缓存模型 ${modelKey} 的数据:`, resourceData);
      }
    });
  }, [modelResourcesData]);

  // 组件挂载或打开时获取系统选项和监控项模型名称
  useEffect(() => {
    if (open) {
      // 重置表单字段
      formRef.current?.resetFields();
      console.log(33333);

      // 重置所有状态
      setMonitoringType([]);
      setSelectedSysId(undefined);
      setShowMonitoringType(false);
      setCachedResourcesData({});
      fetchMonitoringItemModelNames();
    }
  }, [open]);

  // 表单值初始化 - 移除 resetFields 调用，因为已经在上面的 useEffect 中处理
  useEffect(() => {
    if (values && formRef.current && open) {
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
  }, [values, open, monitoringItemModelOptions]);

  // 生成标签页项
  // 在生成标签页项的地方添加调试
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
          onDataChange={() => {
            // 数据变化时的处理逻辑（如果需要可以在这里添加）
          }}
          onChangeTracking={(changes) => {
            setChangedResourcesData((prev) => {
              const existingChanges = prev[item.model_key] || {
                created: [],
                updated: [],
                deleted: [],
              };

              // 合并变更数据，避免重复
              const mergeChanges = (existing: any[], incoming: any[]) => {
                const merged = [...existing];
                incoming.forEach((incomingItem) => {
                  const existingIndex = merged.findIndex(
                    (existingItem) =>
                      existingItem.id === incomingItem.id ||
                      (existingItem.host_resource_id === incomingItem.host_resource_id &&
                        existingItem.instance_name === incomingItem.instance_name),
                  );
                  if (existingIndex >= 0) {
                    // 如果已存在，更新记录（保留最新的trigger_resource_datas）
                    merged[existingIndex] = {
                      ...merged[existingIndex],
                      ...incomingItem,
                      trigger_resource_datas:
                        incomingItem.trigger_resource_datas ||
                        merged[existingIndex].trigger_resource_datas,
                    };
                  } else {
                    // 如果不存在，添加新记录
                    merged.push(incomingItem);
                  }
                });
                return merged;
              };

              const newData = {
                ...prev,
                [item.model_key]: {
                  created: mergeChanges(existingChanges.created, changes.created),
                  updated: mergeChanges(existingChanges.updated, changes.updated),
                  deleted: mergeChanges(existingChanges.deleted, changes.deleted),
                },
              };
              console.log('更新后的changedResourcesData:', newData);
              return newData;
            });
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
        try {
          const resourcesData: Record<string, any[]> = {};

          // 建立model_key到model_id的映射
          const modelKeyToIdMap = monitoringType.reduce((map, item) => {
            map[item.model_key] = item.value.toString();
            return map;
          }, {} as Record<string, string>);

          // 收集所有变更的数据，按model_id分组
          Object.entries(changedResourcesData).forEach(([modelKey, changes]) => {
            const modelId = modelKeyToIdMap[modelKey];
            if (!modelId) {
              console.log(`跳过模型 ${modelKey}：找不到对应的model_id`);
              return; // 如果找不到对应的model_id，跳过
            }

            // 检查是否真的有变更数据
            const hasChanges =
              (changes.created && changes.created.length > 0) ||
              (changes.updated && changes.updated.length > 0) ||
              (changes.deleted && changes.deleted.length > 0);

            console.log(`模型 ${modelKey} (${modelId}) 变更检查:`, {
              created: changes.created?.length || 0,
              updated: changes.updated?.length || 0,
              deleted: changes.deleted?.length || 0,
              hasChanges,
            });

            if (!hasChanges) {
              console.log(`跳过模型 ${modelKey}：没有变更数据`);
              return; // 如果没有变更，跳过这个模型
            }

            // 清理trigger_resource_datas中的id和index字段的辅助函数
            const cleanTriggerData = (triggerData: any[]) => {
              return triggerData.map((trigger) => {
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                const { id, index, ...cleanTrigger } = trigger;
                return cleanTrigger;
              });
            };

            const modelResources: any[] = [];

            // 添加新增的数据
            if (changes.created && changes.created.length > 0) {
              modelResources.push(
                ...changes.created.map((item) => {
                  // 新增操作：删除id和index字段
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { id, index, ...resourceItem } = item;

                  // 如果有trigger_resource_datas，也需要清理其中的id和index字段
                  if (
                    resourceItem.trigger_resource_datas &&
                    Array.isArray(resourceItem.trigger_resource_datas)
                  ) {
                    resourceItem.trigger_resource_datas = cleanTriggerData(
                      resourceItem.trigger_resource_datas,
                    );
                  }

                  return {
                    ...resourceItem,
                    item_resource_action: 'create',
                  };
                }),
              );
            }

            // 添加更新的数据
            if (changes.updated && changes.updated.length > 0) {
              modelResources.push(
                ...changes.updated.map((item) => {
                  // 编辑操作：保留id，删除index字段
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { index, ...resourceItem } = item;

                  // 如果有trigger_resource_datas，也需要清理其中的id和index字段
                  if (
                    resourceItem.trigger_resource_datas &&
                    Array.isArray(resourceItem.trigger_resource_datas)
                  ) {
                    resourceItem.trigger_resource_datas = cleanTriggerData(
                      resourceItem.trigger_resource_datas,
                    );
                  }

                  return {
                    ...resourceItem,
                    item_resource_action: 'update',
                  };
                }),
              );
            }

            // 添加删除的数据
            if (changes.deleted && changes.deleted.length > 0) {
              modelResources.push(
                ...changes.deleted.map((item) => {
                  // 删除操作：保留id，删除index字段
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                  const { index, ...resourceItem } = item;

                  // 如果有trigger_resource_datas，也需要清理其中的id和index字段
                  if (
                    resourceItem.trigger_resource_datas &&
                    Array.isArray(resourceItem.trigger_resource_datas)
                  ) {
                    resourceItem.trigger_resource_datas = cleanTriggerData(
                      resourceItem.trigger_resource_datas,
                    );
                  }

                  return {
                    ...resourceItem,
                    item_resource_action: 'delete',
                  };
                }),
              );
            }

            // 只有当有数据时才添加到resourcesData中
            if (modelResources.length > 0) {
              resourcesData[modelId] = modelResources;
            }
          });

          const submitData: MonitoringItem.CreateApprovalParams = {
            system_id: values.sys_name,
            model_id: values.model_id,
            resources: resourcesData,
            approval_status: values.approval_status,
          };

          console.log('提交监控项审批数据:', submitData);

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
        name="sys_name"
        label="系统名称"
        options={modelResourceNames}
        onChange={(value: number) => {
          // 修改类型为 number
          console.log('value', value);

          setSelectedSysId(value);
          setShowMonitoringType(!!value);
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
