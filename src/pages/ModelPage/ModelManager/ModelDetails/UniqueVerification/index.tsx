import { ActionType } from '@ant-design/pro-components';
import CustomProTable from '@/components/MyProTable/CustomProTable';
import CreateForm from './components/UpdateForm';
import UpdateForm from './components/UpdateForm';
import LookForm from '@/components/LookForm';
import { Space } from 'antd';
import React, { useRef, useState, useEffect } from 'react';
import { useTableDelete } from '@/hooks/useTableDelete';
import { getUniqueRules, deleteUniqueRule } from '@/services/model-api/model-manage';
import { useParams } from '@umijs/max';

// 在 columnsRender 中使用新的 ActionButtons 组件
const columnsRender = (
  handleUpdate: (record: API.UniqueRuleItem) => void,
  handleDelete: (record: API.UniqueRuleItem) => void,
) => {
  return [
    {
      title: '校验规则',
      dataIndex: 'rule',
      key: 'rule',
    },
    {
      title: '操作',
      dataIndex: 'action',
      width: '20%',
      key: 'action',
      render: (_text: any, record: API.UniqueRuleItem) => (
        <Space>
          {/* <a
                        style={{ pointerEvents: record.is_optional !== '1' ? 'none' : 'auto', color: record.is_optional !== '1' ? '#ccc' : '#1890ff' }}
                        onClick={() => handleUpdate(record)}
                    >
                        编辑
                    </a>
                    <a
                        style={{ pointerEvents: record.is_optional !== '1' ? 'none' : 'auto', color: record.is_optional !== '1' ? '#ccc' : '#f5222d' }}
                        onClick={() => handleDelete(record)}
                    >
                        删除
                    </a> */}
          <a style={{ color: '#1890ff' }} onClick={() => handleUpdate(record)}>
            编辑
          </a>
          <a style={{ color: '#f5222d' }} onClick={() => handleDelete(record)}>
            删除
          </a>
        </Space>
      ),
    },
  ];
};

/**
 * 唯一校验组件
 */
interface UniqueVerificationProps {
  active?: boolean;
}

const UniqueVerification: React.FC<UniqueVerificationProps> = ({ active = false }) => {
  // 控制创建表单显示状态
  const [createOpen, setCreateOpen] = useState(false);

  // 控制更新表单显示状态
  const [updateOpen, setUpdateOpen] = useState(false);

  // 控制查看表单显示状态
  const [lookOpen, setLookOpen] = useState(false);

  // 当前选中的行数据
  const [row, setRow] = useState<API.UniqueRuleItem>();

  const handleTableDelete = useTableDelete();

  const actionRef = useRef<ActionType>();

  const params = useParams<{ id: string }>(); // 从URL路径获取modelId
  const model_id = Number(params.id);

  // 添加 useEffect 监听 active 属性变化
  useEffect(() => {
    if (active && actionRef.current) {
      actionRef.current.reload();
    }
  }, [active, model_id]);

  /**
   * 处理更新操作
   * @param record 当前行数据
   */
  const handleUpdate = (record: API.UniqueRuleItem) => {
    setRow(record);
    setUpdateOpen(true);
  };

  /**
   * 处理删除操作
   * @param record 当前行数据
   */
  const handleDelete = (record: API.UniqueRuleItem) => {
    setRow(record);
    handleTableDelete({
      api: deleteUniqueRule,
      params: record.rule_id,
      actionRef,
    });
  };

  const columns = columnsRender(handleUpdate, handleDelete);

  return (
    <>
      <CustomProTable
        api={getUniqueRules}
        apiParams={model_id}
        pageName="uniqueRules"
        columns={columns}
        search={false}
        rowKey="rule_id"
        actionRef={actionRef}
        setCreateOpen={setCreateOpen}
        key={`unique-rules-${model_id}`}
      />
      <CreateForm
        open={createOpen}
        setOpen={setCreateOpen}
        modelId={model_id}
        actionRef={actionRef}
      />
      <LookForm
        title="唯一校验详情"
        open={lookOpen}
        setOpen={setLookOpen}
        values={row}
        columns={columns}
      />
      {row && (
        <UpdateForm
          title="编辑唯一校验"
          open={updateOpen}
          modelId={model_id}
          setOpen={setUpdateOpen}
          actionRef={actionRef}
          values={row}
          setRow={setRow}
        />
      )}
    </>
  );
};

export default UniqueVerification;
