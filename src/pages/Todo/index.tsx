import React, { useRef, useState } from 'react';
import { PageContainer, ProTable } from '@ant-design/pro-components';
import type { ProColumns, ActionType } from '@ant-design/pro-components';
import { Button, App } from 'antd';
import {
  ModalForm,
  ProFormText,
  ProFormSelect,
  ProFormTextArea,
  ProFormDatePicker,
} from '@ant-design/pro-components';
import { PlusOutlined } from '@ant-design/icons';
import { addTodo, updateTodo } from '@/services/todo';
import { useModel } from '@umijs/max';
import ApproveForm from '@/pages/CapacityManagement/components/ApproveForm';

const TodoPage: React.FC = () => {
  const { message } = App.useApp();
  const actionRef = useRef<ActionType>();
  const [createOpen, setCreateOpen] = useState(false);
  const [currentRow, setCurrentRow] = useState<Todo.Item | undefined>(undefined);

  const { fetchTodoList, loading, handleProcess, approveOpen, setApproveOpen, approvalId, row } =
    useModel('todo', (model) => ({
      fetchTodoList: model.fetchTodoList,
      loading: model.loading,
      handleProcess: model.handleProcess,
      approveOpen: model.approveOpen,
      setApproveOpen: model.setApproveOpen,
      approvalId: model.approvalId,
      row: model.row,
    }));

  /*
  const handleEdit = (record: Todo.Item) => {
    setCurrentRow(record);
    setCreateOpen(true);
  };
  */

  /*
  const handleProcess = async (record: any) => {
    try {
      if (record.big_class_no === 'RLGLSP') {
        const res = await getCapacityApprovalDetail(record.id);
        if (res.success || res.code === 200 || res.inside_code === 0) {
          const detail = res.data;
          // 补充工作流信息到 row 中，以便 ApproveForm 使用
          const rowData = {
            ...detail,
            workflow_info: {
              is_approve: true,
              process_id: record.process_id,
              task_id: record.task_id,
              work_type: record.work_type,
            },
            // 确保有 id 字段
            id: record.id,
          };
          setRow(rowData);
          setApprovalId(Number(record.id));
          setApproveOpen(true);
        } else {
          message.error(res.msg || '获取详情失败');
        }
      } else {
        message.info('该流程类型的处理暂未实现');
      }
    } catch (error) {
      console.error('获取详情失败:', error);
      message.error('获取详情失败');
    }
  };
  */

  /*
  const handleDelete = async (id: string) => {
    try {
      await deleteTodo(id);
      message.success('删除成功');
      actionRef.current?.reload();
    } catch (error) {
      message.error('删除失败');
    }
  };
  */

  const columns: ProColumns<Todo.Item>[] = [
    {
      title: '流程名称',
      dataIndex: 'process_name',
      key: 'process_name',
    },
    {
      title: '任务名称',
      dataIndex: 'task_name',
      key: 'task_name',
    },
    {
      title: '创建时间',
      dataIndex: 'create_date',
      key: 'create_date',
      valueType: 'dateTime',
      sorter: true,
      hideInSearch: true,
    },
    {
      title: '操作',
      valueType: 'option',
      key: 'option',
      render: (_, record) => [
        <a key="process" onClick={() => handleProcess(record)}>
          处理
        </a>,
      ],
    },
  ];

  return (
    <PageContainer title="我的待办">
      <ProTable<Todo.Item>
        actionRef={actionRef}
        columns={columns}
        rowKey="process_id"
        loading={loading}
        request={fetchTodoList}
        search={{
          labelWidth: 'auto',
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => {
              setCurrentRow(undefined);
              setCreateOpen(true);
            }}
            icon={<PlusOutlined />}
          >
            新建
          </Button>,
        ]}
      />

      <ModalForm
        title={currentRow ? '编辑待办' : '新建待办'}
        open={createOpen}
        onOpenChange={setCreateOpen}
        modalProps={{
          destroyOnClose: true,
        }}
        initialValues={currentRow || { status: 'pending', priority: 'medium' }}
        onFinish={async (values) => {
          try {
            if (currentRow) {
              await updateTodo(currentRow.id, values);
              message.success('更新成功');
            } else {
              await addTodo(values);
              message.success('创建成功');
            }
            setCreateOpen(false);
            actionRef.current?.reload();
            return true;
          } catch (error) {
            message.error('操作失败');
            return false;
          }
        }}
      >
        <ProFormText
          name="title"
          label="标题"
          placeholder="请输入标题"
          rules={[{ required: true, message: '请输入标题' }]}
        />
        <ProFormTextArea name="description" label="描述" placeholder="请输入描述" />
        <ProFormSelect
          name="status"
          label="状态"
          rules={[{ required: true, message: '请选择状态' }]}
          options={[
            { label: '待处理', value: 'pending' },
            { label: '进行中', value: 'in_progress' },
            { label: '已完成', value: 'done' },
          ]}
        />
        <ProFormSelect
          name="priority"
          label="优先级"
          rules={[{ required: true, message: '请选择优先级' }]}
          options={[
            { label: '低', value: 'low' },
            { label: '中', value: 'medium' },
            { label: '高', value: 'high' },
          ]}
        />
        <ProFormDatePicker name="deadline" label="截止日期" />
      </ModalForm>

      {/* 审批弹窗 */}
      <ApproveForm
        open={approveOpen}
        setOpen={setApproveOpen}
        approvalId={approvalId}
        row={row}
        actionRef={actionRef}
      />
    </PageContainer>
  );
};

export default TodoPage;
