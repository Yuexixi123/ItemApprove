import React, { useState, useEffect } from 'react';
import { Table, Button, App, Popconfirm } from 'antd';
import {
  deleteResourceRelationship,
  getModelRelatedResources,
} from '@/services/resources/association/api';
import '../index.less';

interface CollapseTableProps {
  relationshipId: number; // 从父组件传递的关联关系ID
  resourceId?: number; // 资源ID
  onSuccess?: () => void; // 成功操作后的回调
  modelId?: number;
  isExpanded?: boolean; // 新增：是否展开状态
  refreshTrigger?: number; // 新增：外部刷新触发器
}

const CollapseTable: React.FC<CollapseTableProps> = ({
  relationshipId,
  resourceId,
  onSuccess,
  modelId,
  isExpanded,
  refreshTrigger,
}) => {
  const { message } = App.useApp();

  // 使用本地状态而不是全局状态
  const [relatedResources, setRelatedResources] = useState<API.RelatedResourceItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

  // 获取关联资源数据的方法
  const fetchData = async (current = pagination.current, pageSize = pagination.pageSize) => {
    if (!modelId || !resourceId || !relationshipId) {
      return;
    }

    setLoading(true);
    try {
      const response = await getModelRelatedResources(modelId, {
        rel_id: relationshipId,
        resource_id: resourceId,
        current,
        page_size: pageSize,
      });

      if (response.inside_code === 0 && response.data) {
        setRelatedResources(response.data.data || []);
        setPagination((prev) => ({
          ...prev,
          current,
          pageSize,
          total: response.data.pagination?.total || 0,
        }));
      }
    } catch (error) {
      console.error('获取关联资源出错:', error);
    } finally {
      setLoading(false);
    }
  };

  // 每次展开时都请求数据
  useEffect(() => {
    if (isExpanded) {
      fetchData();
    }
  }, [isExpanded, modelId, resourceId, relationshipId]);

  // 新增：监听外部刷新触发器
  useEffect(() => {
    if (refreshTrigger && refreshTrigger > 0 && isExpanded) {
      fetchData();
    }
  }, [refreshTrigger]);

  // 处理取消关联操作
  const handleCancelAssociation = async (record: API.RelatedResourceItem) => {
    console.log('取消关联操作', record);

    const targetResourceId = record.resource_rel_id;

    const loadingMessage = message.loading('正在取消关联', 0);

    try {
      if (!targetResourceId) {
        loadingMessage();
        message.error('无法找到关联关系ID');
        return;
      }
      const result = await deleteResourceRelationship(targetResourceId.toString());
      loadingMessage();
      if (result.inside_code === 0) {
        message.success('取消关联成功');
        // 重新获取数据
        await fetchData();
        onSuccess?.(); // 调用成功回调
      } else {
        message.error('取消关联失败');
      }
    } catch (error) {
      loadingMessage();
      console.error('取消关联失败:', error);
      message.error('取消关联失败');
    }
  };

  const renderColumns = () => {
    return [
      {
        title: '实例名',
        dataIndex: 'instance_name',
        key: 'instance_name',
      },
      {
        title: '创建人',
        dataIndex: 'create_name',
        key: 'create_name',
      },
      {
        title: '创建时间',
        dataIndex: 'create_time',
        key: 'create_time',
      },
      {
        title: '更新人',
        dataIndex: 'update_user',
        key: 'update_user',
      },
      {
        title: '更新时间',
        dataIndex: 'update_time',
        key: 'update_time',
      },
      {
        title: '操作',
        key: 'action',
        render: (record: API.RelatedResourceItem) => (
          <Popconfirm
            title="确认取消关联"
            description="确定要取消此关联关系吗？"
            onConfirm={() => handleCancelAssociation(record)}
            okText="确定"
            cancelText="取消"
          >
            <Button type="link">取消关联</Button>
          </Popconfirm>
        ),
      },
    ];
  };

  // 处理分页变化
  const handleTableChange = (page: number, pageSize?: number) => {
    const newPageSize = pageSize || pagination.pageSize;
    fetchData(page, newPageSize);
  };

  // 为表格数据添加 key
  const dataSource = relatedResources.map((item) => ({
    ...item,
    key: item.id,
  }));

  return (
    <div className="table-container">
      <Table
        size="small"
        columns={renderColumns()}
        dataSource={dataSource}
        loading={loading}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          onChange: handleTableChange,
          onShowSizeChange: handleTableChange,
        }}
      />
    </div>
  );
};

export default CollapseTable;
