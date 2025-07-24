import { ProFormInstance, ProFormSelect, ProFormTextArea } from '@ant-design/pro-components';
import type { ActionType } from '@ant-design/pro-components'; // 添加ActionType导入
import ConfirmDrawer from '@/components/ConfirmDrawer';
import { useEffect, useRef, useState, useMemo } from 'react';
import { Form, message } from 'antd';
import '../index.less';
import { useModel } from '@umijs/max';
import { getModelNames } from '@/services/model-api/model-manage';
import {
  createModelRelationship,
  updateModelRelationship,
} from '@/services/model-api/model-manage/model-relationship';
import { useRequest } from 'ahooks';

interface UpdateFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  values?: API.RelationshipItem;
  setRow?: (row: API.RelationshipItem | undefined) => void;
  onSuccess?: () => void;
  modelId?: number; // 当前模型ID
  actionRef?: React.MutableRefObject<ActionType | undefined>; // 添加actionRef参数
}

const UpdateForm = ({
  open,
  setOpen,
  title = '新建关联类型',
  values,
  onSuccess,
  modelId,
  actionRef,
}: UpdateFormProps) => {
  const { allIcons } = useModel('global');
  const { associationTypeNames, fetchAssociationTypeNames } = useModel('modelRelationshipModel');

  const [modelTargetOption, setModelTargetOption] = useState({ label: '', value: 0, icon: '' });

  const [modelSourceOption, setModelSourceOption] = useState({ label: '', value: 0, icon: '' });

  const [associationTypeOption, setAssociationTypeOption] = useState<
    { label: string; value: number } | undefined
  >(undefined);

  const TargetComponentsIcon = allIcons[modelTargetOption?.icon ?? 'VerticalAlignBottomOutlined'];

  const SourceComponentsIcon = allIcons[modelSourceOption?.icon ?? 'VerticalAlignBottomOutlined'];

  const formRef = useRef<ProFormInstance>();

  // 使用 useRequest 获取模型名称列表，并缓存结果
  const { data: modelNameOptions } = useRequest(
    async () => {
      const result = await getModelNames();
      return result.data || [];
    },
    {
      cacheKey: 'model-names-list', // 使用缓存键
      staleTime: 60 * 1000, // 数据保鲜时间，1分钟内不会重新请求
      // 移除 ready: open 条件，让数据提前加载
    },
  );

  // 使用 useMemo 缓存处理后的选项数据
  const memoizedModelOptions = useMemo(() => {
    return modelNameOptions || [];
  }, [modelNameOptions]);

  // 获取当前模型信息
  const currentModelInfo = useMemo(() => {
    if (!modelId || !memoizedModelOptions.length) return null;
    return memoizedModelOptions.find((option) => option.value === modelId);
  }, [modelId, memoizedModelOptions]);

  // 处理源模型变化
  const handleSourceModelChange = (value: number, option: any) => {
    setModelSourceOption(option as { label: string; value: number; icon: string });

    // 如果选择的源模型不是当前模型，则目标模型自动设置为当前模型
    if (value !== modelId && currentModelInfo && !values?.rel_id) {
      formRef.current?.setFieldValue('dest_model_id', modelId);
      setModelTargetOption(currentModelInfo);
    }
  };

  // 处理目标模型变化
  const handleTargetModelChange = (value: number, option: any) => {
    setModelTargetOption(option as { label: string; value: number; icon: string });

    // 如果选择的目标模型不是当前模型，则源模型自动设置为当前模型
    if (value !== modelId && currentModelInfo && !values?.rel_id) {
      formRef.current?.setFieldValue('src_model_id', modelId);
      setModelSourceOption(currentModelInfo);
    }
  };

  useEffect(() => {
    if (open) {
      // 打开抽屉时获取关联类型名称列表
      fetchAssociationTypeNames();
    }
    formRef.current?.resetFields();

    if (values && formRef.current) {
      // 编辑模式：设置现有值
      formRef.current?.setFieldsValue(values);
    } else if (!values && currentModelInfo && formRef.current) {
      // 新建模式：设置默认值（源模型默认为当前模型）
      formRef.current?.setFieldValue('src_model_id', modelId);
      setModelSourceOption(currentModelInfo);
    }
  }, [open, values, formRef.current, currentModelInfo, modelId]);

  return (
    <ConfirmDrawer
      onOpenChange={setOpen}
      title={title}
      formRef={formRef}
      open={open}
      // 在onFinish函数中的成功处理部分添加刷新逻辑
      onFinish={async (value) => {
        try {
          // 验证必须有一个模型是当前模型
          if (
            !values?.rel_id &&
            value.src_model_id !== modelId &&
            value.dest_model_id !== modelId
          ) {
            message.error('源模型或目标模型中必须有一个是当前模型');
            return false;
          }

          if (values?.rel_id) {
            // 编辑模式
            const response = await updateModelRelationship(String(values.rel_id), {
              rel_desc: value.rel_desc || '',
            });

            if (response.inside_code === 0) {
              message.success('关联关系更新成功');
              actionRef?.current?.reload(); // 刷新表格数据
              onSuccess?.();
              return true;
            } else {
              message.error(`更新失败: ${response.msg || '未知错误'}`);
              return false;
            }
          } else {
            // 新建模式
            if (!modelId) {
              message.error('缺少模型ID');
              return false;
            }

            const response = await createModelRelationship(modelId, {
              src_model_id: value.src_model_id,
              dest_model_id: value.dest_model_id,
              asst_type_id: value.asst_type_id,
              constraint: value.constraint,
              rel_desc: value.rel_desc || null,
            });

            if (response.inside_code === 0) {
              message.success('关联关系创建成功');
              actionRef?.current?.reload(); // 刷新表格数据
              onSuccess?.();
              return true;
            } else {
              message.error(`创建失败: ${response.msg || '未知错误'}`);
              return false;
            }
          }
        } catch (error) {
          console.error('操作关联关系时出错:', error);
          message.error('操作失败，请稍后重试');
          return false;
        }
      }}
    >
      <ProFormSelect
        name="src_model_id"
        rules={[{ required: true, message: '请选择源模型' }]}
        label="源模型"
        onChange={handleSourceModelChange}
        options={memoizedModelOptions}
        showSearch
        fieldProps={{
          optionFilterProp: 'label',
        }}
        disabled={!!values?.rel_id} // 编辑模式下禁用
      />
      <ProFormSelect
        name="dest_model_id"
        rules={[{ required: true, message: '请选择目标模型' }]}
        label="目标模型"
        onChange={handleTargetModelChange}
        options={modelNameOptions}
        disabled={!!values?.rel_id} // 编辑模式下禁用
      />
      <ProFormSelect
        name="asst_type_id"
        rules={[{ required: true, message: '请选择关联类型' }]}
        label="关联类型"
        allowClear={false}
        onChange={(_value, option) => {
          setAssociationTypeOption(option as { label: string; value: number });
        }}
        options={associationTypeNames}
        disabled={!!values?.rel_id} // 编辑模式下禁用
      />
      <ProFormSelect
        name="constraint"
        rules={[{ required: true, message: '请选择源-目标约束' }]}
        label="源-目标约束"
        valueEnum={{
          '1-1': '1-1',
          '1-N': '1-N',
          'N-N': 'N-N',
        }}
        disabled={!!values?.rel_id} // 编辑模式下禁用
      />

      <ProFormTextArea name="rel_desc" label="关联描述" />
      {modelTargetOption?.value !== 0 &&
        modelSourceOption?.value !== 0 &&
        associationTypeOption?.label && (
          <Form.Item label="效果示意">
            <div className="association-images">
              <div className="model-item">
                <div className="model-icon">
                  <SourceComponentsIcon />
                </div>
                <span className="model-name">{modelSourceOption?.label}</span>
              </div>
              <div className="model-edge">
                <div className="connection">
                  <div className="name">{associationTypeOption?.label}</div>
                </div>
              </div>
              <div className="model-item ispre">
                <div className="model-icon">
                  <TargetComponentsIcon />
                </div>
                <span className="model-name">{modelTargetOption?.label}</span>
              </div>
            </div>
            <div className="topo-text">
              {modelSourceOption?.label} {associationTypeOption?.label} {modelTargetOption?.label}
            </div>
          </Form.Item>
        )}
    </ConfirmDrawer>
  );
};

export default UpdateForm;
