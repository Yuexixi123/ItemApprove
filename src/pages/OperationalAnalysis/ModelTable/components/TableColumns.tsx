import dayjs from 'dayjs';

const TableColumns = () => {
  return [
    //model：模型
    //odel_group: 模型分组
    //attribute：属性
    //attribute_group：属性分组
    //model_relationship：模型关联关系
    //model_rule：模型校验规则
    {
      title: '操作对象',
      dataIndex: 'operate_object',
      key: 'operate_object',
      valueType: 'select',
      valueEnum: {
        model: '模型',
        model_group: '模型分组',
        attribute: '属性',
        attribute_group: '属性分组',
        model_relationship: '模型关联关系',
        model_rule: '模型校验规则',
      },
    },

    {
      title: '动作',
      dataIndex: 'action',
      key: 'action',
      valueType: 'select',
      request: async () => {
        return [
          {
            value: 'query',
            label: '查询',
          },
          {
            value: 'update',
            label: '修改',
          },
          {
            value: 'create',
            label: '创建',
          },
          {
            value: 'delete',
            label: '删除',
          },
        ];
      },
    },
    {
      title: '操作时间',
      dataIndex: 'operation_time',
      valueType: 'dateRange',
      key: 'operation_time',
      initialValue: [dayjs().startOf('day'), dayjs().endOf('day')],
      search: {
        transform: (value: [number, number]) => {
          if (Array.isArray(value) && value.length === 2) {
            return {
              start_time: dayjs(value[0]).format('YYYY-MM-DD'),
              end_time: dayjs(value[1]).format('YYYY-MM-DD'),
            };
          }
          return {};
        },
      },
      hideInTable: true,
    },
    {
      title: '实例',
      dataIndex: 'instance',
      key: 'instance',
    },
    {
      title: '操作描述',
      dataIndex: 'operation_desc',
      key: 'operation_desc',
      hideInSearch: true,
    },
    {
      title: '操作时间',
      dataIndex: 'operation_time',
      valueType: 'date',
      key: 'operation_time',
      hideInSearch: true,
    },
    {
      title: '操作账号',
      dataIndex: 'operation_user',
      key: 'operation_user',
    },
  ];
};

export default TableColumns;
