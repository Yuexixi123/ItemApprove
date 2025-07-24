// 导入所需的图标组件
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
// 导入React相关依赖
import React from 'react';
// 导入路由历史记录
import { useModel } from '@umijs/max';
import useHover from '@/hooks/useHover';
import { useTableDelete } from '@/hooks/useTableDelete';
import { deleteModelAttribute } from '@/services/model-api/attribute';

/**
 * 折叠面板项组件
 * @param item - 字段项数据
 * @param setUpdateDrawerVisit - 设置更新抽屉显示状态的函数
 * @param setLookDrawerVisit - 设置查看抽屉显示状态的函数
 * @param setRow - 设置当前选中行数据的函数
 */
const CollapseItem: React.FC<ModelField.CollapseItemProps> = ({
  item,
  setUpdateDrawerVisit,
  setLookDrawerVisit,
  setRow,
}) => {
  // 使用更新后的 useHover hook
  const { handleMouseEnter, handleMouseLeave, isItemHovered } = useHover<string | number>();
  const handleDelete = useTableDelete();

  // 从modelDetails模型中获取模型详情
  const { fetchModelAttributes } = useModel('modelDetails', (modelDetails) => {
    return {
      fetchModelAttributes: modelDetails.fetchModelAttributes,
    };
  });

  // 添加类型断言来确保modelData具有model_name属性
  const model_name = sessionStorage.getItem('MODELNAME');

  // 处理查看字段点击事件
  const handleLookClick = (item: ModelField.ModelAttribute) => {
    if (setRow) {
      setRow(item);
    }
    if (setLookDrawerVisit) {
      setLookDrawerVisit(true);
    }
  };

  // 处理删除字段点击事件
  const handleDeleteClick = (e: React.MouseEvent, item: ModelField.ModelAttribute) => {
    e.stopPropagation();

    handleDelete({
      api: () => deleteModelAttribute(item.attr_id),
      params: {},
      confirmTitle: '确定删除字段',
      confirmContent: `确定删除 "${model_name}" 的 "${item.attr_name}" 字段，同时会清除实例中对应属性数据，现存实例数量会影响此操作的耗时，是否继续？`,
      // successMsg: '删除字段成功',
      // errorMsg: '删除字段失败',
      onSuccess: () => {
        // 删除成功后刷新模型属性列表
        fetchModelAttributes();
      },
      record: item,
    });
  };

  // 处理更新字段点击事件
  const handleUpdateClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (setRow) {
      setRow(item);
    }
    if (setUpdateDrawerVisit) {
      setUpdateDrawerVisit(true);
    }
  };

  return (
    // <li key={item.attr_id} className={`property-item ${item?.is_required ? 'only-ready' : ''}`} onClick={() => handleLookClick(item)} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
    <li
      key={item.attr_id}
      className={`property-item ${item.is_builtin ? 'only-ready' : ''}`}
      onClick={() => handleLookClick(item)}
      onMouseEnter={() => handleMouseEnter(item.attr_id)}
      onMouseLeave={handleMouseLeave}
    >
      <div className="drag-content">
        <div className="field-name">
          <span>{item.attr_name}</span>
          {item.is_builtin && <i>*</i>}
        </div>
        <p style={{ marginBottom: '0' }}>
          {item.attr_type_name}
          <span className="field-id">{item.attr_key}</span>
        </p>
      </div>
      <div className="auth-box mr10" onClick={handleUpdateClick}>
        {isItemHovered(item.attr_id) && (
          <>
            <span>
              <EditOutlined />
            </span>
            {!item.is_builtin && (
              <span className="ml6" onClick={(e) => handleDeleteClick(e, item)}>
                <DeleteOutlined />
              </span>
            )}
          </>
        )}
      </div>
    </li>
  );
};

export default CollapseItem;
