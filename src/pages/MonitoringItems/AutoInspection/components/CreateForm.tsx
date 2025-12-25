import { ProForm, ProFormSelect, ProFormText } from '@ant-design/pro-components';
import { Button, Divider, Modal, Table } from 'antd';
import React, { useEffect } from 'react';
import { useModel } from '@umijs/max';
import { getMonitoringItemModelNames } from '@/services/monitoring-item/api';

interface CreateFormProps {
  open: boolean;
  setOpen: (open: boolean) => void;
  actionRef: any;
}

const columns = [
  {
    title: '监控项类型',
    dataIndex: 'model_name',
    key: 'model_name',
  },
  {
    title: '主机名称',
    dataIndex: 'host_name',
    key: 'host_name',
  },
];

const CreateForm = ({ open, setOpen }: CreateFormProps) => {
  const { modelResourceNames, fetchModelResourceNames } = useModel('selectOption', (model) => ({
    modelResourceNames: model.modelResourceNames,
    fetchModelResourceNames: model.fetchModelResourceNames,
  }));

  const { resourceNameRelationship, fetchResourceNameRelationship } = useModel(
    'selectOption',
    (model) => ({
      resourceNameRelationship: model.resourceNameRelationship,
      fetchResourceNameRelationship: model.fetchResourceNameRelationship,
    }),
  );

  useEffect(() => {
    fetchModelResourceNames('system');
  }, []);

  return (
    <Modal
      title="配置一键巡检"
      width="80%"
      open={open}
      onCancel={() => setOpen(false)}
      footer={null}
    >
      <ProForm
        grid={true}
        submitter={{
          render: () => (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
              <Button key="reset">重置</Button>
              <Button key="submit" type="primary" htmlType="submit">
                搜索
              </Button>
            </div>
          ),
        }}
        onFinish={async (values) => {
          console.log(values);
        }}
      >
        <ProForm.Group>
          <ProFormSelect
            name="sys_name"
            colProps={{ xl: 12 }}
            label="系统名称"
            options={modelResourceNames}
            onChange={(value: number) => {
              console.log(value);
              fetchResourceNameRelationship(value, { model_key: 'host' });
            }}
            showSearch
          />
          <ProFormSelect
            name="host_name"
            colProps={{ xl: 12 }}
            label="主机名称"
            options={resourceNameRelationship}
            showSearch
            fieldProps={{
              optionFilterProp: 'label',
              labelInValue: true,
              mode: 'multiple',
            }}
          />
          <ProFormSelect
            name="model_id"
            colProps={{ xl: 12 }}
            // rules={[{ required: true, message: '请选择监控项类型' }]}
            label="监控项类型"
            allowClear={false}
            mode="multiple"
            request={async () => {
              const data = await getMonitoringItemModelNames();
              return data.data;
            }}
            showSearch
            fieldProps={{
              optionFilterProp: 'label',
            }}
          />
          <ProFormText
            name="item_instance"
            colProps={{ xl: 12 }}
            // rules={[{ required: true, message: '请输入监控项实例名称' }]}
            label="监控项实例名称"
            allowClear={false}
          />
        </ProForm.Group>
      </ProForm>
      <Divider />
      <Table columns={columns} rowKey="id" pagination={false} />
    </Modal>
  );
};
export default CreateForm;
