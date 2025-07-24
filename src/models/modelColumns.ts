import { useState } from 'react';
import { ProColumns } from '@ant-design/pro-components';

export default () => {
  const [columns, setColumns] = useState<ProColumns<any>[]>([]);

  return {
    columns,
    setColumnsAction: (newColumns: ProColumns<any>[]) => setColumns(newColumns),
  };
};
