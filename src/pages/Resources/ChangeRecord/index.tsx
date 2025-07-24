import { ProTable } from '@ant-design/pro-components';
import type { ProColumns } from '@ant-design/pro-components';

const mockData = [
  {
    id: '1',
    description: '修改了用户权限设置',
    account: 'admin@example.com',
    operationTime: '2023-08-01 14:30:00',
  },
  {
    id: '2',
    description: '更新了系统配置参数',
    account: 'operator@test.com',
    operationTime: '2023-08-02 09:15:00',
  },
];

export type TableListItem = {
  id: string;
  description: string;
  account: string;
  operationTime: string;
};

const columnsRender = (): ProColumns<TableListItem>[] => {
  return [
    {
      title: '操作描述',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '操作账号',
      dataIndex: 'account',
      key: 'account',
      hideInSearch: true,
    },
    {
      title: '操作时间',
      dataIndex: 'operationTime',
      key: 'operationTime',
      valueType: 'dateRange',
      render: (_, record) => {
        return <>{record.operationTime}</>;
      },
    },
  ];
};

const ChangeRecord = () => {
  const columns = columnsRender();

  return (
    <>
      <ProTable
        columns={columns}
        rowKey="id"
        request={async () => {
          return {
            data: mockData,
            // 不然 table 会停止解析数据，即使有数据
            success: true,
            // 不传会使用 data 的长度，如果是分页一定要传
            total: 1,
          };
        }}
      />
    </>
  );
};

export default ChangeRecord;
