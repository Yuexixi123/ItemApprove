import type { ProFieldValueType } from '@ant-design/pro-components';

/**
 * 将属性类型映射为 ProTable 的 valueType
 * 注意：user、user_multi、timezone 等自定义类型会映射为标准类型，
 * 但在 columnGenerator 中会有特殊处理逻辑来保留原有功能
 */
export const mapAttributeTypeToValueType = (attrType: string): ProFieldValueType => {
  switch (attrType) {
    case 'enum':
      return 'select';
    case 'enum_multi':
      return 'select';
    case 'date':
      return 'date';
    case 'datetime':
      return 'dateTime';
    case 'long_text':
      return 'textarea';
    case 'timezone':
      // 映射为 select 类型，但在 columnGenerator 中会特殊处理
      return 'select';
    case 'float':
    case 'number':
      return 'digit';
    case 'boolean':
      return 'switch';
    case 'radio':
      return 'radio';
    case 'checkbox':
      return 'checkbox';
    case 'user':
    case 'user_multi':
      // 映射为 select 类型，但在 columnGenerator 中会特殊处理
      return 'select';
    case 'api':
      return 'select';
    default:
      return 'text';
  }
};
