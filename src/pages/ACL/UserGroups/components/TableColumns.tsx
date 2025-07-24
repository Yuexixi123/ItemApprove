const request = async () => [{ label: '1', value: '1' }];

const TableColumns = () => {
  return [
    {
      title: '用户分组名',
      dataIndex: 'usergroup_name',
      key: 'usergroup_name',
      valueType: 'text',
      request,
    },
    {
      title: '创建时间',
      dataIndex: 'create_time',
      key: 'create_time',
      valueType: 'date',
      hideInSearch: true,
    },
    {
      title: '创建人',
      dataIndex: 'Creator',
      key: 'Creator',
    },
    {
      title: '说明',
      dataIndex: 'description',
      key: 'description',
      hideInSearch: true,
    },
  ];
};

export default TableColumns;
