import { useModel, history } from '@umijs/max';
import { Card, Spin } from 'antd';
import Masonry from 'react-masonry-css';
import React from 'react';
import './index.less';

const CardContainer = () => {
  const { allIcons } = useModel('global');

  const { filteredData, loading } = useModel('modelPage', (model) => ({
    filteredData: model.filteredData,
    loading: model.loading,
  }));

  const handleJump = (state: API.ModelItem, id: number) => {
    history.push(`/resources/dynamic/${id}`, state);
  };

  const breakpointColumns = {
    default: 4, // 默认列数
    1100: 3,
    700: 2,
    500: 1,
  };

  return (
    <Spin spinning={loading}>
      <Masonry
        breakpointCols={breakpointColumns}
        className="masonry-grid"
        columnClassName="masonry-grid-column"
      >
        {filteredData.map((item) => (
          <Card title={item.modelgroup_name} key={item.modelgroup_key} className="card">
            {item.models.map((child) => {
              const Component = allIcons[child.model_icon];
              return (
                <div
                  className="card-item"
                  key={child.model_id}
                  onClick={() => handleJump(child, child.model_id)}
                >
                  <span className="model-icon">
                    <Component />
                  </span>
                  <span className="model-name">{child.model_name}</span>
                  {/* <span className="model-count">0</span> */}
                </div>
              );
            })}
          </Card>
        ))}
      </Masonry>
    </Spin>
  );
};

export default CardContainer;
