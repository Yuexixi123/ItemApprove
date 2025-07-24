// import { addRule, removeRule,  updateRule } from '@/services/ant-design-pro/api';
// import type { ActionType} from '@ant-design/pro-components';
import { PageContainer } from '@ant-design/pro-components';
import '@umijs/max';
// import {  message } from 'antd';
// import React, { useRef, useState } from 'react';
// import type { FormValueType } from './components/UpdateForm';
// import UpdateForm from './components/UpdateForm';
import TopologyGraph from './components/a';

const data = {
  id: 'root',
  name: '业务',
  type: 'business',
  level: 0,
  icon: '🏢', // 可以使用 Unicode 表情符号
  children: [
    {
      id: 'cluster-1',
      name: '集群',
      type: 'cluster',
      level: 1,
      icon: '⚙️',
      children: [
        {
          id: 'host-1',
          name: '主机',
          type: 'host',
          level: 2,
          icon: '💻',
        },
      ],
    },
  ],
};

// /**
//  * @en-US Add node
//  * @zh-CN 添加节点
//  * @param fields
//  */
// const handleAdd = async (fields: API.RuleListItem) => {
//   const hide = message.loading('正在添加');
//   try {
//     await addRule({
//       ...fields,
//     });
//     hide();
//     message.success('Added successfully');
//     return true;
//   } catch (error) {
//     hide();
//     message.error('Adding failed, please try again!');
//     return false;
//   }
// };

/**
 * @en-US Update node
 * @zh-CN 更新节点
 *
//  * @param fields
//  */
// const handleUpdate = async (fields: FormValueType) => {
//   const hide = message.loading('Configuring');
//   try {
//     await updateRule({
//       name: fields.name,
//       desc: fields.desc,
//       key: fields.key,
//     });
//     hide();
//     message.success('Configuration is successful');
//     return true;
//   } catch (error) {
//     hide();
//     message.error('Configuration failed, please try again!');
//     return false;
//   }
// };

// /**
//  *  Delete node
//  * @zh-CN 删除节点
//  *
//  * @param selectedRows
//  */
// const handleRemove = async (selectedRows: API.RuleListItem[]) => {
//   const hide = message.loading('正在删除');
//   if (!selectedRows) return true;
//   try {
//     await removeRule({
//       key: selectedRows.map((row) => row.key),
//     });
//     hide();
//     message.success('Deleted successfully and will refresh soon');
//     return true;
//   } catch (error) {
//     hide();
//     message.error('Delete failed, please try again');
//     return false;
//   }
// };
const TableList: React.FC = () => {
  /**
   * @en-US Pop-up window of new window
   * @zh-CN 新建窗口的弹窗
   *  */
  // const [createModalOpen, handleModalOpen] = useState<boolean>(false);

  /**
   * @en-US The pop-up window of the distribution update window
   * @zh-CN 分布更新窗口的弹窗
   * */
  // const [updateModalOpen, handleUpdateModalOpen] = useState<boolean>(false);
  // const [showDetail, setShowDetail] = useState<boolean>(false);
  // const actionRef = useRef<ActionType>();
  // const [currentRow, setCurrentRow] = useState<API.RuleListItem>();
  // const [selectedRowsState, setSelectedRows] = useState<API.RuleListItem[]>([]);

  /**
   * @en-US International configuration
   * @zh-CN 国际化配置
   * */

  // const columns: ProColumns<API.RuleListItem>[] = [
  //   {
  //     title: '规则名称',
  //     dataIndex: 'name',
  //     render: (dom, entity) => {
  //       return (
  //         <a
  //           onClick={() => {
  //             setCurrentRow(entity);
  //             setShowDetail(true);
  //           }}
  //         >
  //           {dom}
  //         </a>
  //       );
  //     },
  //   },
  //   {
  //     title: '描述',
  //     dataIndex: 'desc',
  //     valueType: 'textarea',
  //   },
  //   {
  //     title: '服务调用次数',
  //     dataIndex: 'callNo',
  //     sorter: true,
  //     hideInForm: true,
  //     renderText: (val: string) => `${val}${'万'}`,
  //   },
  //   {
  //     title: '状态',
  //     dataIndex: 'status',
  //     hideInForm: true,
  //     valueEnum: {
  //       0: {
  //         text: '关闭',
  //         status: 'Default',
  //       },
  //       1: {
  //         text: '运行中',
  //         status: 'Processing',
  //       },
  //       2: {
  //         text: '已上线',
  //         status: 'Success',
  //       },
  //       3: {
  //         text: '异常',
  //         status: 'Error',
  //       },
  //     },
  //   },
  //   {
  //     title: '上次调度时间',
  //     sorter: true,
  //     dataIndex: 'updatedAt',
  //     valueType: 'dateTime',
  //     renderFormItem: (item, { defaultRender, ...rest }, form) => {
  //       const status = form.getFieldValue('status');
  //       if (`${status}` === '0') {
  //         return false;
  //       }
  //       if (`${status}` === '3') {
  //         return <Input {...rest} placeholder={'请输入异常原因！'} />;
  //       }
  //       return defaultRender(item);
  //     },
  //   },
  //   {
  //     title: '操作',
  //     dataIndex: 'option',
  //     valueType: 'option',
  //     render: (_, record) => [
  //       <a
  //         key="config"
  //         onClick={() => {
  //           handleUpdateModalOpen(true);
  //           setCurrentRow(record);
  //         }}
  //       >
  //         配置
  //       </a>,
  //       <a key="subscribeAlert" href="https://procomponents.ant.design/">
  //         订阅警报
  //       </a>,
  //     ],
  //   },
  // ];
  return (
    <PageContainer breadcrumbRender={false}>
      {/* <ProTable<API.RuleListItem, API.PageParams>
        headerTitle={'查询表格'}
        actionRef={actionRef}
        rowKey="key"
        search={{
          labelWidth: 120,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            key="primary"
            onClick={() => {
              handleModalOpen(true);
            }}
          >
            <PlusOutlined /> 新建
          </Button>,
        ]}
        request={rule}
        columns={columns}
        rowSelection={{
          onChange: (_, selectedRows) => {
            setSelectedRows(selectedRows);
          },
        }}
      />
      {selectedRowsState?.length > 0 && (
        <FooterToolbar
          extra={
            <div>
              已选择{' '}
              <a
                style={{
                  fontWeight: 600,
                }}
              >
                {selectedRowsState.length}
              </a>{' '}
              项 &nbsp;&nbsp;
              <span>
                服务调用次数总计 {selectedRowsState.reduce((pre, item) => pre + item.callNo!, 0)} 万
              </span>
            </div>
          }
        >
          <Button
            onClick={async () => {
              await handleRemove(selectedRowsState);
              setSelectedRows([]);
              actionRef.current?.reloadAndRest?.();
            }}
          >
            批量删除
          </Button>
          <Button type="primary">批量审批</Button>
        </FooterToolbar>
      )}
      <ModalForm
        title={'新建规则'}
        width="400px"
        open={createModalOpen}
        onOpenChange={handleModalOpen}
        onFinish={async (value) => {
          const success = await handleAdd(value as API.RuleListItem);
          if (success) {
            handleModalOpen(false);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
      >
        <ProFormText
          rules={[
            {
              required: true,
              message: '规则名称为必填项',
            },
          ]}
          width="md"
          name="name"
        />
        <ProFormTextArea width="md" name="desc" />
      </ModalForm>
      <UpdateForm
        onSubmit={async (value: any) => {
          const success = await handleUpdate(value);
          if (success) {
            handleUpdateModalOpen(false);
            setCurrentRow(undefined);
            if (actionRef.current) {
              actionRef.current.reload();
            }
          }
        }}
        onCancel={() => {
          handleUpdateModalOpen(false);
          if (!showDetail) {
            setCurrentRow(undefined);
          }
        }}
        updateModalOpen={updateModalOpen}
        values={currentRow || {}}
      />

      <Drawer
        width={600}
        open={showDetail}
        onClose={() => {
          setCurrentRow(undefined);
          setShowDetail(false);
        }}
        closable={false}
      >
        {currentRow?.name && (
          <ProDescriptions<API.RuleListItem>
            column={2}
            title={currentRow?.name}
            request={async () => ({
              data: currentRow || {},
            })}
            params={{
              id: currentRow?.name,
            }}
            columns={columns as ProDescriptionsItemProps<API.RuleListItem>[]}
          />
        )}
      </Drawer> */}
      <TopologyGraph data={data} />
    </PageContainer>
  );
};
export default TableList;
