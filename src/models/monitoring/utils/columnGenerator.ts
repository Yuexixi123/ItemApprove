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
  static generateColumn(field: any, userOptions?: any[]): ProColumns<any> {
    const column: ProColumns<any> = {
      dataIndex: field.attr_key,
      title: field.attr_name,
      width: 'auto',
      valueType: mapAttributeTypeToValueType(field.attr_type),
      formItemProps: () => {
        const rules: any[] = [
          { required: field.is_required, message: `${field.attr_name}为必填项` },
        ];

        // 处理正则校验
        if (field.option && Array.isArray(field.option) && field.option.length > 0) {
          const firstOption = field.option[0];
          if (firstOption && firstOption.regxp) {
            rules.push({
              pattern: new RegExp(firstOption.regxp),
              message: `${field.attr_name}格式不正确`,
            });
          }
        }

        return {
          rules,
          // 为boolean类型字段设置默认值为true（对应'是'）
          ...(field.attr_type === 'boolean' && { initialValue: false }),
        };
      },
      hideInTable: !field.is_form_show,
      render: (text) => {
        if (field.attr_type === 'boolean') {
          // 当boolean类型字段没有数据时，默认渲染为'是'
          if (text === null || text === undefined) {
            return '-';
          }
          return text ? '是' : '否';
        }
        if (text === null || text === undefined) {
          return '-';
        }
        return text;
      },
    };

    // 处理枚举类型
    this.handleEnumType(column, field);

    // 处理多选枚举类型
    this.handleMultiEnumType(column, field);

    // 处理时区类型
    this.handleTimezoneType(column, field);

    // 处理用户类型
    this.handleUserType(column, field, userOptions);

    // 处理多选用户类型
    this.handleMultiUserType(column, field, userOptions);

    // 处理不可编辑字段（放在最后，避免覆盖其他fieldProps配置）
    if (!field.editable) {
      column.fieldProps = {
        ...column.fieldProps,
        disabled: true,
      };
    }

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

      // 为多选枚举添加专门的render函数
      column.render = (text: any) => {
        if (text === null || text === undefined) {
          return '-';
        }

        // 如果是数组，显示多个标签
        if (Array.isArray(text)) {
          if (text.length === 0) return '-';
          return text
            .map((value: any) => {
              const label = (column.valueEnum as Record<string | number, string>)?.[value] || value;
              return label;
            })
            .join(', ');
        }

        // 如果是单个值，直接显示对应的标签
        const label = (column.valueEnum as Record<string | number, string>)?.[text] || text;
        return label;
      };
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
   * 处理用户类型
   */
  private static handleUserType(column: ProColumns<any>, field: any, userOptions?: any[]) {
    // 优先使用传入的 userOptions，如果没有则尝试使用 field.option
    const options = userOptions && userOptions.length > 0 ? userOptions : field.option;

    if (field.attr_type === 'user' && options && Array.isArray(options)) {
      column.valueEnum = {};
      options.forEach((opt: any) => {
        if (opt && typeof opt.value !== 'undefined' && opt.label) {
          (column.valueEnum as Record<string | number, string>)[opt.value] = opt.label;
        }
      });
      column.fieldProps = {
        ...column.fieldProps,
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
        },
      };
    }
  }

  /**
   * 处理多选用户类型
   */
  private static handleMultiUserType(column: ProColumns<any>, field: any, userOptions?: any[]) {
    // 优先使用传入的 userOptions，如果没有则尝试使用 field.option
    const options = userOptions && userOptions.length > 0 ? userOptions : field.option;

    if (field.attr_type === 'user_multi' && options && Array.isArray(options)) {
      column.valueEnum = {};
      options.forEach((opt: any) => {
        if (opt && typeof opt.value !== 'undefined' && opt.label) {
          (column.valueEnum as Record<string | number, string>)[opt.value] = opt.label;
        }
      });
      column.fieldProps = {
        ...column.fieldProps,
        mode: 'multiple',
        showSearch: true,
        filterOption: (input: string, option: any) => {
          return (option?.label ?? '').toLowerCase().includes(input.toLowerCase());
        },
      };
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
