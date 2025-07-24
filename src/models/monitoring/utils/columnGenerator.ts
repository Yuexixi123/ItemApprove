import { ProColumns } from '@ant-design/pro-components';
import { timezoneList } from '@/pages/ModelPage/ModelManager/ModelDetails/ModelField/components/FieldTypeRender';
import { request } from '@umijs/max';
import { mapAttributeTypeToValueType } from './typeMapping';

/**
 * 列生成器
 */
export class ColumnGenerator {
  /**
   * 根据字段属性生成表格列
   */
  static generateColumn(field: any): ProColumns<any> {
    const column: ProColumns<any> = {
      dataIndex: field.attr_key,
      title: field.attr_name,
      width: 'auto',
      valueType: mapAttributeTypeToValueType(field.attr_type),
      formItemProps: () => ({
        rules: [{ required: field.is_required, message: `${field.attr_name}为必填项` }],
      }),
      hideInTable: !field.is_form_show,
      render: (text) => {
        if (field.attr_type === 'boolean') {
          return text ? '是' : '否';
        }
        if (text === null || text === undefined) {
          return '-';
        }
        return text;
      },
    };

    // 处理不可编辑字段
    if (!field.editable) {
      column.fieldProps = { disabled: true };
    }

    // 处理枚举类型
    this.handleEnumType(column, field);

    // 处理多选枚举类型
    this.handleMultiEnumType(column, field);

    // 处理时区类型
    this.handleTimezoneType(column, field);

    // 处理API类型
    this.handleApiType(column, field);

    return column;
  }

  /**
   * 处理枚举类型
   */
  private static handleEnumType(column: ProColumns<any>, field: any) {
    if (field.attr_type === 'enum' && field.option && Array.isArray(field.option)) {
      column.valueEnum = {};
      field.option.forEach((opt: any) => {
        if (opt && typeof opt.value !== 'undefined' && opt.label) {
          (column.valueEnum as Record<string, string>)[opt.value] = opt.label;
        }
      });
    }
  }

  /**
   * 处理多选枚举类型
   */
  private static handleMultiEnumType(column: ProColumns<any>, field: any) {
    if (field.attr_type === 'enum_multi' && field.option && Array.isArray(field.option)) {
      column.valueEnum = {};
      field.option.forEach((opt: any) => {
        if (opt && typeof opt.value !== 'undefined' && opt.label) {
          (column.valueEnum as Record<string | number, string>)[opt.value] = opt.label;
        }
      });
      column.fieldProps = { mode: 'multiple' };
    }
  }

  /**
   * 处理时区类型
   */
  private static handleTimezoneType(column: ProColumns<any>, field: any) {
    if (field.attr_type === 'timezone') {
      column.valueEnum = {};
      timezoneList.forEach((opt: any) => {
        if (opt && typeof opt.value !== 'undefined' && opt.label) {
          (column.valueEnum as Record<string, string>)[opt.value] = opt.label;
        }
      });
    }
  }

  /**
   * 处理API类型
   */
  private static handleApiType(column: ProColumns<any>, field: any) {
    if (field.attr_type === 'api' && field.api_url && typeof field.api_url === 'string') {
      column.request = async () => {
        try {
          const data = await request(field.api_url);
          return Array.isArray(data.data) ? data.data : [];
        } catch (error) {
          console.error('获取API数据失败:', error);
          return [];
        }
      };
    }
  }
}
