import { ProFormInstance, ProFormSelect, ModalForm } from '@ant-design/pro-components';
import { useEffect, useRef, useState } from 'react';
import { Tabs } from 'antd';
import EditorTable from './EditorTable';
import { useModel } from '@umijs/max';

// 修改接口定义，使用正确的命名空间
interface UpdateFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  values?: MonitoringItem.ApprovalItem; // 修改为正确的类型
  setRow?: (row: MonitoringItem.ApprovalItem | undefined) => void;
  onSuccess?: () => void;
  modelId?: number;
  setApproveOpen: (open: boolean) => void;
}

const CreateForm = ({
  open,
  setOpen,
  title = '新增申请',
  values,
  setApproveOpen,
}: UpdateFormProps) => {
  // const { message } = App.useApp();
  const [monitoringType, setMonitoringType] = useState<MonitoringItem.ModelNameItem[]>([]);
  const [selectedSysId, setSelectedSysId] = useState<number>(); // 修改为 number 类型
  const [showMonitoringType, setShowMonitoringType] = useState<boolean>(false); // 控制监控项类型显示

  console.log('values', values);

  const formRef = useRef<ProFormInstance>();

  // 使用监控审批模型
  // 当前代码已经在使用 monitoring 模型
  const {
    monitoringItemModelOptions,
    modelResourcesData,
    resourcesLoading,
    fetchModelResources,
    fetchMonitoringItemModelNames,
  } = useModel('monitoring.index', (model) => ({
    hostOptions: model.hostOptions,
    monitoringItemModelOptions: model.monitoringItemModelOptions,
    modelResourcesData: model.modelResourcesData,
    resourcesLoading: model.resourcesLoading,
    fetchModelResources: model.fetchModelResources,
    fetchMonitoringItemModelNames: model.fetchMonitoringItemModelNames,
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
          fetchModelResources(searchParams);
        }
      });
    }
  };

  // 移除或修改系统选择变化时的 useEffect
  // 如果需要在系统变化时重新获取数据，确保只在有监控项类型时调用
  useEffect(() => {
    if (selectedSysId && monitoringType.length > 0) {
      monitoringType.forEach((item) => {
        if (item.model_key) {
          fetchModelResources({
            sys_resource_id: selectedSysId,
            model_key: item.model_key,
          });
        }
      });
    }
  }, [selectedSysId]); // 只依赖 selectedSysId

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
      fetchMonitoringItemModelNames();
    }
  }, [open, fetchMonitoringItemModelNames]);

  // 表单值初始化 - 移除 resetFields 调用，因为已经在上面的 useEffect 中处理
  useEffect(() => {
    if (values && formRef.current && open) {
      formRef.current?.setFieldsValue(values);
      console.log('11111', formRef.current);
      console.log('2222', values);
    }
  }, [values, open]);

  // 生成标签页项
  // 在生成标签页项的地方添加调试
  const items = monitoringType.map((item) => {
    const resourceData = modelResourcesData[item.model_key] || [];
    const isLoading = resourcesLoading[item.model_key] || false;

    // 添加调试日志
    console.log('标签页数据调试:', {
      modelKey: item.model_key,
      resourceData,
      modelResourcesData,
      isLoading,
    });

    return {
      label: item.label,
      key: item.value,
      children: (
        <EditorTable
          key={item.value}
          value={item.value}
          modelId={Number(item.value)}
          resourceData={resourceData}
          loading={isLoading}
          selectedSysId={selectedSysId}
          onSearch={(hostResourceId) => handleHostSearch(hostResourceId)}
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
      }}
      open={open}
      onFinish={async (value) => {
        console.log('value', value);
        setOpen(false);
        setApproveOpen(true);
        return true;
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
