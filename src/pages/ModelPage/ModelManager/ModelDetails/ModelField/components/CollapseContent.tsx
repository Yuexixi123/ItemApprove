// 导入所需的图标组件
import { PlusOutlined } from '@ant-design/icons';
// 导入字段创建抽屉组件
import CreateFieldDrawer from './CreateFieldDrawer';
// 导入字段查看抽屉组件
import LookFieldDrawer from './LookFieldDrawer';
// 导入React相关依赖
import React, { useState } from 'react';
// 导入折叠面板项组件
import CollapseItem from './CollapseItem';

/**
 * 折叠面板内容组件
 * @param list - 字段列表数据
 */
const CollapseContent = ({ list, attrGroupId }: ModelField.CollapseContentProps) => {
  // 新增字段抽屉显示状态
  const [drawerVisit, setDrawerVisit] = useState(false);

  // 编辑字段抽屉显示状态
  const [updateDrawerVisit, setUpdateDrawerVisit] = useState(false);

  // 查看字段抽屉显示状态
  const [lookDrawerVisit, setLookDrawerVisit] = useState(false);

  // 当前选中的字段详情数据
  const [row, setRow] = useState<ModelField.ModelAttribute>();

  // 处理添加字段点击事件
  const handleAddField = () => {
    setDrawerVisit(true);
  };

  return (
    <>
      <ul className="property-list clearfix">
        {/* 渲染字段列表 */}
        {list?.map((item) => (
          <CollapseItem
            setUpdateDrawerVisit={setUpdateDrawerVisit}
            setLookDrawerVisit={setLookDrawerVisit}
            key={item.attr_id}
            item={item}
            setRow={setRow}
          />
        ))}
        {/* 添加字段按钮 */}
        {list && (
          <li className="property-add property-item" onClick={handleAddField}>
            <span className="auth-box">
              <PlusOutlined />
              添加
            </span>
          </li>
        )}
      </ul>
      {/* 新建字段抽屉 */}
      <CreateFieldDrawer
        title="新建字段"
        attrGroupId={attrGroupId}
        drawerVisit={drawerVisit}
        setDrawerVisit={setDrawerVisit}
      />
      {/* 编辑字段抽屉 */}
      <CreateFieldDrawer
        title="编辑字段"
        attrGroupId={attrGroupId}
        drawerVisit={updateDrawerVisit}
        setDrawerVisit={setUpdateDrawerVisit}
        values={row}
      />
      {/* 查看字段抽屉 */}
      <LookFieldDrawer
        drawerVisit={lookDrawerVisit}
        setDrawerVisit={setLookDrawerVisit}
        setUpdateDrawerVisit={setUpdateDrawerVisit}
        values={row}
      />
    </>
  );
};

export default CollapseContent;
