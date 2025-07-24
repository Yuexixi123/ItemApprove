import React, { useState } from 'react';
import { Collapse, Space } from 'antd';
import CollapseContent from './CollapseContent';
import { useModel } from '@umijs/max';
import AddGroup from './AddGroup';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import useHover from '@/hooks/useHover';
import { deleteAttributeGroup } from '@/services/model-api/attribute';
import { useTableDelete } from '@/hooks/useTableDelete';

/**
 * 详情折叠面板组件
 * 用于展示模型字段分组及其内容
 */

const DetailsCollapse: React.FC = () => {
  const [editOpen, setEditOpen] = useState(false);
  // 添加当前编辑的分组ID状态
  const [currentEditGroup, setCurrentEditGroup] = useState<ModelField.ModelAttributeGroup>();
  // 修改本地activeKey状态类型为number[]，与collapseDefaultActiveKey保持一致
  const [activeKeys, setActiveKeys] = useState<number[]>([]);

  const { handleMouseEnter, handleMouseLeave, isItemHovered } = useHover<string | number>();

  // 使用删除Hook
  const handleTableDelete = useTableDelete();

  // 从modelDetails模型中获取过滤后的数据和加载状态
  const {
    filteredData,
    loading,
    fetchModelAttributes,
    collapseDefaultActiveKey,
    setCollapseActiveKey,
  } = useModel('modelDetails', (model) => {
    return {
      filteredData: model.filteredData,
      loading: model.loading,
      fetchModelAttributes: model.fetchModelAttributes,
      collapseDefaultActiveKey: model.collapseDefaultActiveKey,
      setCollapseActiveKey: model.setCollapseActiveKey,
    };
  });

  // 当collapseDefaultActiveKey变化时更新本地状态
  React.useEffect(() => {
    if (collapseDefaultActiveKey && collapseDefaultActiveKey.length > 0) {
      setActiveKeys(collapseDefaultActiveKey);
    }
  }, [collapseDefaultActiveKey]);

  // 处理折叠面板展开/收起事件，修改参数类型
  const handleCollapseChange = (keys: string | string[]) => {
    // 将string类型转换为number类型
    const numericKeys = Array.isArray(keys)
      ? keys.map((key) => Number(key))
      : keys
      ? [Number(keys)]
      : [];

    setActiveKeys(numericKeys);
    // 同步更新全局状态
    if (setCollapseActiveKey) {
      setCollapseActiveKey(numericKeys);
    }
  };

  // 修改编辑处理函数，添加分组ID参数
  const handleEdit = (e: React.MouseEvent, item: ModelField.ModelAttributeGroup) => {
    e.stopPropagation();
    // 防止重复点击同一个分组
    if (currentEditGroup?.attrgroup_id !== item.attrgroup_id) {
      setCurrentEditGroup(item);
      setEditOpen(true);
    }
  };

  // 处理删除分组
  const handleDelete = (e: React.MouseEvent, item: ModelField.ModelAttributeGroup) => {
    e.stopPropagation();
    handleTableDelete({
      api: (params) => deleteAttributeGroup(params),
      params: item.attrgroup_id,
      confirmTitle: '确认删除分组',
      confirmContent: `确定要删除分组"${item.attrgroup_name}"吗？此操作不可恢复。`,
      successMsg: '删除分组成功',
      errorMsg: '删除分组失败',
      onSuccess: () => {
        // 删除成功后刷新属性列表
        fetchModelAttributes();
      },
      record: item,
    });
  };

  // 构建折叠面板项配置
  const items = filteredData?.map((item) => {
    return {
      key: item.attrgroup_id,
      label: (
        <div
          onMouseEnter={() => handleMouseEnter(item.attrgroup_id)}
          onMouseLeave={handleMouseLeave}
        >
          <Space>
            {item.attrgroup_name}
            {`(${item.attrs.length})`}
            {/* 使用 isItemHovered 检查当前项是否被悬停 */}
            {isItemHovered(item.attrgroup_id) && (
              <span onClick={(e) => handleEdit(e, item)}>
                <EditOutlined />
              </span>
            )}
            {isItemHovered(item.attrgroup_id) && item.attrs.length === 0 && (
              <span onClick={(e) => handleDelete(e, item)}>
                <DeleteOutlined />
              </span>
            )}
          </Space>
        </div>
      ),
      children: (
        <CollapseContent
          key={item.attrgroup_id}
          list={item.attrs}
          attrGroupId={item.attrgroup_id}
        />
      ),
    };
  });

  return (
    <>
      <Collapse activeKey={activeKeys} onChange={handleCollapseChange} ghost items={items} />
      {/* 非加载状态时显示添加分组组件 */}
      {!loading && (
        <AddGroup
          editOpen={editOpen}
          setEditOpen={(open) => {
            setEditOpen(open);
            // 关闭抽屉时重置当前编辑分组
            if (!open) {
              setCurrentEditGroup(undefined);
            }
          }}
          currentGroupId={currentEditGroup?.attrgroup_id}
          values={currentEditGroup}
        />
      )}
    </>
  );
};

export default DetailsCollapse;
