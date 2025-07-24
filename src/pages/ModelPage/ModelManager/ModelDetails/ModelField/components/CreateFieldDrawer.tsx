// 导入ProComponents组件
import {
  ProFormCheckbox,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-components';
import type { ProFormInstance, ActionType } from '@ant-design/pro-components';
// 导入antd组件
import { App } from 'antd';
// 导入React Hooks
import { useEffect, useRef, useState } from 'react';
import '../index.less';
import FieldTypeRender from './FieldTypeRender';
import ConfirmDrawer from '@/components/ConfirmDrawer';
// 导入API函数
import { createModelAttribute, updateModelAttribute } from '@/services/model-api/attribute';
// 导入自定义hooks
import { useTableCreate } from '@/hooks/useTableCreate';
import { useTableUpdate } from '@/hooks/useTableUpdate';
import { useModel } from '@umijs/max';
import { getModelIdFromUrl } from '@/utils';
import dayjs from 'dayjs';

/**
 * 创建字段抽屉组件的Props接口定义
 */
interface CreateFieldDrawerProps {
  title?: string; // 抽屉标题
  drawerVisit: boolean; // 抽屉显示状态
  values?: ModelField.ModelAttribute; // 字段值(编辑时使用)
  setDrawerVisit: (value: boolean) => void; // 设置抽屉显示状态的函数
  modelId?: number; // 模型ID
  attrGroupId?: number; // 属性组ID
  actionRef?: React.MutableRefObject<ActionType | undefined>; // 表格ActionRef
  onSuccess?: () => void; // 成功回调函数
}

/**
 * 创建字段抽屉组件
 * @param title - 抽屉标题，默认为"新建字段"
 * @param drawerVisit - 抽屉显示状态
 * @param setDrawerVisit - 设置抽屉显示状态的函数
 * @param values - 字段值(编辑时使用)
 * @param modelId - 模型ID
 * @param attrGroupId - 属性组ID
 * @param actionRef - 表格ActionRef
 * @param onSuccess - 成功回调函数
 */
const CreateFieldDrawer: React.FC<CreateFieldDrawerProps> = ({
  title = '新建字段',
  drawerVisit,
  setDrawerVisit,
  values,
  attrGroupId,
  actionRef,
  onSuccess,
}) => {
  // 创建表单实例
  const formRef = useRef<ProFormInstance>();

  const [fieldType, setFieldType] = useState<ModelField.FieldType>('text');
  // 新增一个状态用于存储字段选项
  const [fieldOptions, setFieldOptions] = useState<Record<string, any>>([]);

  const { message } = App.useApp();

  const { fetchModelAttributes, modelGroupSelectValue } = useModel(
    'modelDetails',
    (modelDetails) => {
      return {
        fetchModelAttributes: modelDetails.fetchModelAttributes,
        modelGroupSelectValue: modelDetails.modelGroupSelectValue,
      };
    },
  );

  const modelId = getModelIdFromUrl();
  // 使用hooks处理创建和更新操作
  const handleCreate = useTableCreate();
  const handleUpdate = useTableUpdate();

  // 当values变化时，设置表单字段值
  useEffect(() => {
    // 每次打开抽屉时重置表单
    if (drawerVisit) {
      formRef.current?.resetFields();
      // 如果是编辑模式且有值，则设置表单值
      if (values) {
        formRef.current?.setFieldsValue(values);
        setFieldType(values.attr_type); // 同步更新字段类型状态
        // 如果有选项数据，设置字段选项
        if (values.option) {
          try {
            setFieldOptions(values.option);
          } catch (e) {
            console.error('解析字段选项失败', e);
          }
        }
      }
    } else {
      setFieldType('text');
    }
  }, [drawerVisit, values]); // 增加drawerVisit作为依赖

  // 处理字段选项变更的函数
  const handleFieldOptionsChange = (newOptions: Record<string, any> | any[]) => {
    // 检查 newOptions 是否为数组
    if (Array.isArray(newOptions)) {
      // 如果是数组，直接设置为 fieldOptions
      setFieldOptions(newOptions);
    } else {
      // 如果是对象，保持原来的处理方式
      setFieldOptions((prev) => [
        {
          ...prev,
          ...newOptions,
        },
      ]);
    }
  };

  // 处理字段类型变更的函数
  const handleAttrTypeChange = (value: ModelField.FieldType) => {
    // 根据不同字段类型设置合适的默认值
    if (value === 'datetime') {
      formRef.current?.setFieldsValue({ attr_default: dayjs().format('YYYY-MM-DD') });
    } else if (value === 'date') {
      formRef.current?.setFieldsValue({ attr_default: dayjs().format('YYYY-MM-DD HH:mm:ss') });
    } else if (value === 'number' || value === 'float') {
      formRef.current?.setFieldsValue({ attr_default: 0 });
    } else if (value === 'boolean') {
      formRef.current?.setFieldsValue({ attr_default: false });
    } else if (value === 'timezone') {
      formRef.current?.setFieldsValue({ attr_default: 'Shanghai' });
    } else if (value === 'enum_multi') {
      formRef.current?.setFieldsValue({ attr_default: '' });
    } else if (value === 'enum') {
      formRef.current?.setFieldsValue({ attr_default: '' });
    } else {
      formRef.current?.setFieldsValue({ attr_default: '' });
    }

    // 更新字段类型状态
    setFieldType(value);
  };

  return (
    <ConfirmDrawer
      onOpenChange={setDrawerVisit}
      title={title}
      formRef={formRef}
      initialValues={attrGroupId ? { attrgroup_id: attrGroupId } : { attrgroup_id: 0 }}
      open={drawerVisit}
      onFinish={async (value) => {
        console.log(value);

        // 在提交时合并表单值和字段选项
        const formData = {
          ...value,
          model_id: modelId,
          // 将除defaultValue外的选项作为option传给后端
          option: fieldOptions,
        };

        // 删除表单中其他已经放入option的字段
        Object.keys(fieldOptions).forEach((key) => {
          if (key in formData && formData[key as keyof typeof formData] !== undefined) {
            delete (formData as any)[key];
          }
        });

        console.log('提交的数据', formData);

        // 创建动态加载消息
        const loadingMessage = message.loading({
          content: values?.attr_id ? '正在更新' : '正在创建',
          duration: 0, // 设置为0表示不自动关闭
        });

        try {
          if (values?.attr_id) {
            // 编辑模式
            const updateResult = await handleUpdate({
              api: (data: API.UpdateAttributeRequest) => updateModelAttribute(values.attr_id, data),
              data: formData as API.UpdateAttributeRequest,
              actionRef,
              onSuccess: () => {
                loadingMessage(); // 关闭加载消息
                setDrawerVisit(false);
                onSuccess?.();
              },
              onError: () => {
                // 处理错误，确保表单不再处于加载状态
                loadingMessage(); // 关闭加载消息
                return false;
              },
            });
            if (updateResult) {
              fetchModelAttributes();
              return updateResult;
            } else {
              // 这里不需要再次显示错误消息，因为handleUpdate中已经处理了
              loadingMessage(); // 确保加载消息被关闭
              return false;
            }
          } else {
            // 创建模式
            if (!modelId || !attrGroupId) {
              loadingMessage(); // 关闭加载消息
              message.error('缺少必要参数：模型ID或属性组ID');
              return false;
            }

            const createResult = await handleCreate({
              api: (data: API.CreateAttributeRequest) => createModelAttribute(attrGroupId, data),
              data: formData as API.CreateAttributeRequest,
              actionRef,
              onSuccess: () => {
                loadingMessage(); // 关闭加载消息
                message.success('字段创建成功');
                setDrawerVisit(false);
                onSuccess?.();
              },
              // onError: (error) => {
              //     // 处理错误，确保表单不再处于加载状态
              //     // message.error(error?.message || "创建失败");
              //     return false;
              // }
            });
            if (createResult) {
              fetchModelAttributes();
              return createResult;
            } else {
              // 这里不需要再次显示错误消息，因为handleCreate中已经处理了
              loadingMessage(); // 确保加载消息被关闭
              return false;
            }
          }
        } catch (error) {
          console.error('操作失败:', error);
          // 确保在捕获到未处理的异常时，表单不再处于加载状态
          loadingMessage(); // 关闭加载消息
          message.error('操作失败，请稍后重试');
          return false;
        }
      }}
    >
      {/* 唯一标识输入框 */}
      <ProFormText
        name="attr_key"
        label="唯一标识"
        rules={[
          { required: true, message: '该字段是必填项！' },
          {
            pattern: /^[a-zA-Z][a-zA-Z0-9_]*$/,
            message: '唯一标识必须以英文字母开头，只能包含英文、数字和下划线',
          },
        ]}
        tooltip="请填写英文开头，下划线，数字，英文的组合"
        placeholder="请输入唯一标识"
        disabled={!!values?.attr_id} // 如果是编辑模式，禁用该字段
      />
      {/* 名称输入框 */}
      <ProFormText
        name="attr_name"
        label="名称"
        rules={[{ required: true, message: '该字段是必填项！' }]}
        placeholder="请输入名称"
        disabled={!!values?.attr_id} // 如果是编辑模式，禁用该字段
      />
      {/* 字段类型选择器 */}
      <ProFormSelect
        options={modelGroupSelectValue}
        rules={[{ required: true, message: '该字段是必填项！' }]}
        name="attrgroup_id"
        showSearch={true}
        label="字段分组"
      />
      <ProFormSelect
        options={[
          { value: 'text', label: '短字符' },
          { value: 'number', label: '数字' },
          { value: 'float', label: '浮点' },
          { value: 'enum', label: '枚举' },
          { value: 'enum_multi', label: '枚举(多选)' },
          { value: 'date', label: '日期' },
          { value: 'dateTime', label: '日期时间' },
          { value: 'long_text', label: '长字符' },
          { value: 'timezone', label: '时区' },
          { value: 'boolean', label: '布尔值' },
          { value: 'user', label: '用户' },
          { value: 'api', label: '接口' }, // 新增
        ]}
        rules={[{ required: true, message: '该字段是必填项！' }]}
        name="attr_type"
        showSearch={true}
        label="字段类型"
        initialValue={'text'}
        onChange={handleAttrTypeChange}
        fieldProps={{
          disabled: !!values?.attr_id,
        }}
        // disabled={!!values?.attr_id} // 如果是编辑模式，禁用该字段
      />
      <FieldTypeRender
        key={fieldType}
        values={values}
        fieldType={fieldType}
        onOptionsChange={handleFieldOptionsChange}
      />
      <ProFormCheckbox
        name="editable"
        initialValue={true}
        disabled={!!values?.attr_id && values?.is_builtin} // 如果是编辑模式，禁用该字段
      >
        在实例中可编辑
      </ProFormCheckbox>
      <ProFormCheckbox
        name="is_form_show"
        initialValue={true}
        // disabled={!!values?.attr_id && values?.is_builtin} // 如果是编辑模式，禁用该字段
      >
        在表单中显示
      </ProFormCheckbox>
      <ProFormCheckbox
        name="is_required"
        disabled={!!values?.attr_id && values?.is_builtin} // 如果是编辑模式，禁用该字段
      >
        设置为必填项
      </ProFormCheckbox>
      {/* 用户提示文本域 */}
      <ProFormTextArea name="description" label="用户提示" />
    </ConfirmDrawer>
  );
};

export default CreateFieldDrawer;
