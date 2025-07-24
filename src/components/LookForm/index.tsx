import { ProDescriptions } from '@ant-design/pro-components';
import { Drawer } from 'antd';

interface LookFormProps<T> {
  open: boolean;
  setOpen: (open: boolean) => void;
  title?: string;
  values?: T;
  setRow?: (row: T | undefined) => void;
  columns: any[];
}

const LookForm = <T extends Record<string, any>>({
  open,
  setOpen,
  title,
  values,
  columns,
}: LookFormProps<T>) => {
  // 移除columns中的key属性，避免React警告
  const processedColumns = columns.map((column) => {
    // 使用下划线前缀表示有意忽略的变量
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { key: _key, ...rest } = column;
    return rest;
  });

  return (
    <Drawer title={title} open={open} width={600} onClose={() => setOpen(false)}>
      <ProDescriptions
        key={values?.id}
        column={2}
        layout="vertical"
        columns={processedColumns}
        // 使用新的 styles 属性替代可能存在的 contentStyle
        styles={{ content: {} }}
        request={async () => {
          return Promise.resolve({
            success: true,
            data: values,
          });
        }}
      />
    </Drawer>
  );
};

export default LookForm;
