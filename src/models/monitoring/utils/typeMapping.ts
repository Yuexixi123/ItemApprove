import { ProFieldValueType } from '@ant-design/pro-components';

/**
 * 将属性类型映射为 ProTable 的 valueType
 */
export const mapAttributeTypeToValueType = (attrType: string): ProFieldValueType => {
  switch (attrType) {
    case 'enum':
    case 'enum_multi':
      return 'select';
    case 'date':
      return 'date';
    case 'datetime':
      return 'dateTime';
    case 'long_text':
      return 'textarea';
    case 'timezone':
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
      return 'select';
    case 'api':
      return 'select';
    default:
      return 'text';
  }
};
