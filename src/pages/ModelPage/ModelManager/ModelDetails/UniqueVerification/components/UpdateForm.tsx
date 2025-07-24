import { getAttributeNameList } from '@/services/model-api/attribute';
import { ProFormInstance, ProFormSelect } from '@ant-design/pro-components';
import ConfirmDrawer from '@/components/ConfirmDrawer';
import { createUniqueRule, updateUniqueRule } from '@/services/model-api/model-manage';
import { useEffect, useRef, useState } from 'react';
import { useTableCreate } from '@/hooks/useTableCreate';
import { useTableUpdate } from '@/hooks/useTableUpdate';
import type { ActionType } from '@ant-design/pro-components';

interface UpdateFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  values?: API.UniqueRuleItem;
  setRow?: (row: API.UniqueRuleItem | undefined) => void;
  modelId: number; // 添加模型ID参数
  actionRef?: React.MutableRefObject<ActionType | undefined>;
}

const UpdateForm = ({ open, setOpen, title, values, modelId, actionRef }: UpdateFormProps) => {
  const [attributeList, setAttributeList] = useState<API.AttributeNameItem[]>([]);

  useEffect(() => {
    getAttributeNameList(modelId).then((res) => {
      if (res.inside_code === 0) {
        setAttributeList(res.data);

        // 创建属性ID到属性名的映射
        const attrMap: Record<number, string> = {};
        res.data.forEach((item) => {
          attrMap[item.value] = item.label;
        });
      }
    });
  }, [modelId]);

  const formRef = useRef<ProFormInstance>();
  const handleCreate = useTableCreate();
  const handleUpdate = useTableUpdate();

  // 根据是否有values判断是新建还是编辑
  const isEdit = !!values?.rule_id;
  // 动态设置标题
  const formTitle = title || (isEdit ? '编辑唯一校验' : '新建唯一校验');

  useEffect(() => {
    if (values && formRef.current) {
      // 如果是编辑模式，需要将后端返回的数据格式转换为表单需要的格式
      // 假设后端返回的 values.attrs 是 [{attr_id: 1, attr_name: "名称"}] 格式
      // 需要转换为 [1, 2, 3] 格式给表单使用
      if (values.attrs && Array.isArray(values.attrs)) {
        const attrIds = values.attrs.map((attr) => attr.attr_id);
        formRef.current?.setFieldsValue({
          ...values,
          attrs: attrIds,
        });
      } else {
        formRef.current?.setFieldsValue(values);
      }
    } else {
      formRef.current?.resetFields();
    }
  }, [values, formRef.current]);

  return (
    <ConfirmDrawer
      onOpenChange={setOpen}
      title={formTitle}
      resize={{
        maxWidth: window.innerWidth * 0.8,
        minWidth: 500,
      }}
      formRef={formRef}
      open={open}
      onFinish={async (formValues) => {
        // 判断是新建还是编辑操作
        if (isEdit) {
          // 编辑操作
          const updateApiWrapper = (data: any) => {
            // 确保包含rule_id
            return updateUniqueRule(values.rule_id, {
              ...data,
            });
          };

          const success = await handleUpdate({
            api: updateApiWrapper,
            data: formValues,
            actionRef,
            successMsg: '更新唯一校验规则成功',
            errorMsg: '更新唯一校验规则失败',
            onSuccess: () => {
              setOpen(false);
            },
          });

          return success;
        } else {
          // 新建操作
          const createApiWrapper = (data: any) => {
            return createUniqueRule(modelId as number, data);
          };

          const success = await handleCreate({
            api: createApiWrapper,
            data: formValues,
            actionRef,
            // successMsg: '创建唯一校验规则成功',
            errorMsg: '创建唯一校验规则失败',
            onSuccess: () => {
              setOpen(false);
            },
            // onError: () => {
            //     return Promise.reject('创建唯一校验规则失败'); // 抛出错误，阻止关闭 Drawe;
            //     // 处理错误逻辑
            // },
          });

          return success;
        }
      }}
    >
      <ProFormSelect
        name="attrs"
        label="校验规则"
        mode="multiple"
        options={attributeList}
        rules={[
          { required: true, message: '请选择至少一个属性' },
          {
            validator: (_, value) => {
              if (value && value.length > 5) {
                return Promise.reject('最多只能选择5个属性');
              }
              return Promise.resolve();
            },
          },
        ]}
        fieldProps={{
          maxTagCount: 5,
          maxTagTextLength: 10,
          maxTagPlaceholder: (omittedValues) => `+${omittedValues.length}...`,
          onChange: (value) => {
            // 如果选择超过5个，只保留前5个
            if (Array.isArray(value) && value.length > 5) {
              formRef.current?.setFieldValue('attrs', value.slice(0, 5));
            }
          },
        }}
      />
    </ConfirmDrawer>
  );
};

export default UpdateForm;
