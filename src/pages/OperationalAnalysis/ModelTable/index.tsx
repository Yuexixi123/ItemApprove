import CustomProTable from '@/components/MyProTable/CustomProTable';
import TableColumns from './components/TableColumns';
import { getOperationAudit } from '@/services/operation-audit/api';
import dayjs from 'dayjs';
import { ProColumns } from '@ant-design/pro-table';

const columns = TableColumns();

const ResourceTable = () => {
  const startDate = dayjs().format('YYYY-MM-DD');
  const endDate = dayjs().format('YYYY-MM-DD');

  return (
    <CustomProTable
      columns={columns as ProColumns<Record<string, any>, 'text'>[]}
      api={getOperationAudit}
      apiParams={[
        'model',
        {
          start_time: startDate,
          end_time: endDate,
        },
      ]}
      pageName="model_audit"
      search={{
        labelWidth: 'auto',
        defaultCollapsed: false,
      }}
      pagination={{
        pageSize: 10,
      }}
      dateFormatter="string"
      rowKey="operation_time"
      createFormRender={false}
    />
  );
};

export default ResourceTable;
