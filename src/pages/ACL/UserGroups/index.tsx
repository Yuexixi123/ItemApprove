import { PageContainer } from '@ant-design/pro-components';
import { ProTable } from '@ant-design/pro-components';
import TableColumns from './components/TableColumns';

const columns = TableColumns();

const UserGroups = () => {
  return (
    <PageContainer title={false}>
      <ProTable
        columns={columns}
        rowKey="id"
        search={{
          labelWidth: 'auto',
        }}
        pagination={{
          pageSize: 10,
        }}
        dateFormatter="string"
      />
    </PageContainer>
  );
};

export default UserGroups;
