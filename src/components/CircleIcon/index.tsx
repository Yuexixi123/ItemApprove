import React from 'react';

import './index.css'; // 引入样式文件

interface CircleWithIconProps {
  allIcons?: any;
  value?: string;
  onClick?: () => void;
}

const CircleWithIcon: React.FC<CircleWithIconProps> = ({
  allIcons,
  onClick,
  value = 'AccountBookOutlined',
}) => {
  const Component = allIcons[value];

  return (
    <div className="circle-container">
      <div className="circle" onClick={onClick}>
        <Component style={{ fontSize: '4vh' }} />
      </div>
      <span className="selectIcon">选择图标</span>
    </div>
  );
};

export default CircleWithIcon;
