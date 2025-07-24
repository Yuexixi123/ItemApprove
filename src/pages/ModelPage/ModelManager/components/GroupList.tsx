import { Spin } from 'antd';
import ModelList from './ModelList';
import './index.less';

/**
 * 分组列表组件
 * @param props 组件属性
 * @returns React组件
 */
const GroupList: React.FC<ModelManager.GroupListProps> = (props) => {
  const { setModelVisitor, setEditGroupVisitor, safeModelList, loading, setRow } = props;

  return (
    <Spin spinning={loading}>
      <div className="main-views">
        {safeModelList.map((item) => (
          <ModelList
            setModelVisitor={setModelVisitor}
            key={item.modelgroup_key}
            setEditGroupVisitor={setEditGroupVisitor}
            setRow={setRow}
            item={item}
          />
        ))}
      </div>
    </Spin>
  );
};

export default GroupList;
