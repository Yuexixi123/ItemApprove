import { App } from 'antd';
import type { DrawerFormProps } from '@ant-design/pro-components';
import { DrawerForm } from '@ant-design/pro-components';
import type { ProFormInstance } from '@ant-design/pro-components';
import { useState, useEffect, useRef } from 'react';
import { isEqual } from 'lodash';

/**
 * ConfirmDrawer组件属性接口
 * 继承自DrawerFormProps，并添加自定义属性
 */
interface ConfirmDrawerProps extends DrawerFormProps {
  /** 表单实例引用，用于访问表单方法 */
  formRef?: React.MutableRefObject<ProFormInstance | undefined>;
  /** 自定义关闭前检查函数，返回true表示需要确认 */
  beforeCloseCheck?: () => boolean;
  /** 确认对话框配置 */
  confirmConfig?: {
    /** 确认对话框标题 */
    title?: string;
    /** 确认对话框内容 */
    content?: string;
    /** 确认按钮文本 */
    okText?: string;
    /** 取消按钮文本 */
    cancelText?: string;
  };
}

/**
 * 带确认功能的抽屉表单组件
 * 当表单有未保存的更改时，关闭抽屉会显示确认对话框
 */
const ConfirmDrawer: React.FC<ConfirmDrawerProps> = ({
  formRef,
  open,
  onOpenChange,
  beforeCloseCheck,
  confirmConfig = {
    title: '确认离开当前页？',
    content: '离开将会导致未保存信息丢失',
    okText: '离开',
    cancelText: '取消',
  },
  ...props
}) => {
  const { modal } = App.useApp();
  /** 跟踪表单是否正在提交的状态 */
  const [isSubmitting, setIsSubmitting] = useState(false);
  /** 存储表单的初始值，用于比较是否有实际变更 */
  const initialValuesRef = useRef<Record<string, any>>({});

  // 当表单打开时，保存初始值
  useEffect(() => {
    if (open && formRef?.current) {
      // 延迟获取初始值，确保表单已经完成初始化
      setTimeout(() => {
        initialValuesRef.current = formRef.current?.getFieldsValue() || {};
      }, 100);
    }
  }, [open, formRef]);

  /**
   * 检查表单是否有实际变更
   * @returns 是否有实际变更
   */
  const hasActualChanges = () => {
    if (!formRef?.current) return false;

    // 获取当前表单值
    const currentValues = formRef.current.getFieldsValue();

    // 比较当前值与初始值是否相等
    return !isEqual(currentValues, initialValuesRef.current);
  };

  /**
   * 处理抽屉开关状态变化
   * @param visible 抽屉是否可见
   */
  const handleOpenChange = (visible: boolean) => {
    if (!visible) {
      // 如果是提交操作导致的关闭，直接关闭抽屉不提示
      if (isSubmitting) {
        setIsSubmitting(false);
        onOpenChange?.(false);
        return;
      }

      // 检查表单是否有修改
      // 优先使用自定义检查函数，其次检查表单是否有实际变更
      const isTouched = beforeCloseCheck?.() ?? hasActualChanges();

      // 如果表单有实际修改，显示确认对话框
      if (isTouched) {
        modal.confirm({
          ...confirmConfig,
          // 点击确认按钮，关闭抽屉
          onOk: () => onOpenChange?.(false),
          // 点击取消按钮，保持抽屉打开
          onCancel: () => onOpenChange?.(true),
        });
        return;
      }
    }
    // 没有修改或打开抽屉时，直接调用原始的onOpenChange
    onOpenChange?.(visible);
  };

  /**
   * 处理表单提交
   * @param values 表单值
   * @returns 提交结果
   */
  const handleSubmit = async (values: Record<string, any>) => {
    // 设置提交状态为true，避免提交后关闭时显示确认对话框
    setIsSubmitting(true);

    // 调用原来的onFinish处理表单提交
    if (props.onFinish) {
      return props.onFinish(values);
    }
    return true;
  };

  return (
    <DrawerForm
      {...props}
      open={open}
      formRef={formRef}
      resize={{
        maxWidth: window.innerWidth * 0.8,
        minWidth: 500,
      }}
      onOpenChange={handleOpenChange}
      onFinish={handleSubmit}
    />
  );
};

export default ConfirmDrawer;
