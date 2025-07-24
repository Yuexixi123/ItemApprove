import React, { useState, useMemo } from 'react';
import { Popover, Segmented } from 'antd';
import CircleIcon from '@/components/CircleIcon';
import * as AntdIcons from '@ant-design/icons';
import Icon from '@ant-design/icons';
import { ProCard } from '@ant-design/pro-components';

interface IconSelectProps {
  value?: string;
  onChange?: (value: string) => void;
}

const OutlinedIcon = (props: any) => (
  <Icon
    {...props}
    component={() => (
      <svg
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1024 1024"
      >
        <path d="M864 64H160C107 64 64 107 64 160v704c0 53 43 96 96 96h704c53 0 96-43 96-96V160c0-53-43-96-96-96z m-12 800H172c-6.6 0-12-5.4-12-12V172c0-6.6 5.4-12 12-12h680c6.6 0 12 5.4 12 12v680c0 6.6-5.4 12-12 12z"></path>
      </svg>
    )}
  />
);
// 定义一个函数组件，用于渲染填充风格的图标
const FilledIcon = (props: any) => (
  <Icon
    {...props}
    component={() => (
      <svg
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1024 1024"
      >
        <path d="M864 64H160C107 64 64 107 64 160v704c0 53 43 96 96 96h704c53 0 96-43 96-96V160c0-53-43-96-96-96z"></path>
      </svg>
    )}
  />
);

// 定义一个函数组件，用于渲染两色风格的图标
const TwoToneIcon = (props: any) => (
  <Icon
    {...props}
    component={() => (
      <svg
        width="1em"
        height="1em"
        fill="currentColor"
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 1024 1024"
      >
        <path d="M16 512c0 273.932 222.066 496 496 496s496-222.068 496-496S785.932 16 512 16 16 238.066 16 512z m496 368V144c203.41 0 368 164.622 368 368 0 203.41-164.622 368-368 368z"></path>
      </svg>
    )}
  />
);

// 创建一个包含所有图标的对象
const allIcons: {
  [key: string]: any;
} = AntdIcons;

// 定义一个函数组件，用于选择图标
const IconSelect: React.FC<IconSelectProps> = ({ value, onChange }) => {
  // 定义一个状态管理变量，用于控制Popover的显示与隐藏
  const [popoverOpen, setPopoverOpen] = useState(false);

  // 定义一个状态管理变量，用于选择图标的主题风格
  const [iconTheme, setIconTheme] = useState<'Outlined' | 'Filled' | 'TwoTone'>('Outlined');

  // 使用useMemo钩子来计算和存储根据主题筛选后的图标列表
  const visibleIconList = useMemo(
    () =>
      Object.keys(allIcons).filter(
        (iconName) =>
          iconName.includes(iconTheme) &&
          iconName !== 'getTwoToneColor' &&
          iconName !== 'setTwoToneColor',
      ),
    [iconTheme],
  );

  // 返回图标选择组件的渲染结果
  return (
    <Popover
      title="选择图标"
      arrow={true}
      trigger="click"
      open={popoverOpen}
      content={
        <div style={{ width: 600 }}>
          <Segmented
            options={[
              { label: '线框风格', value: 'Outlined', icon: <OutlinedIcon /> },
              { label: '实底风格', value: 'Filled', icon: <FilledIcon /> },
              { label: '双色风格', value: 'TwoTone', icon: <TwoToneIcon /> },
            ]}
            block
            onChange={(value: any) => {
              setIconTheme(value);
            }}
          />

          <ProCard
            gutter={[16, 16]}
            wrap
            style={{ marginTop: 8 }}
            bodyStyle={{ height: 400, overflowY: 'auto', paddingInline: 0, paddingBlock: 0 }}
          >
            {visibleIconList.map((iconName) => {
              const Component = allIcons[iconName];
              return (
                <ProCard
                  key={iconName}
                  colSpan={{ xs: 6, sm: 6, md: 6, lg: 6, xl: 6 }}
                  layout="center"
                  hoverable
                  boxShadow={value === iconName}
                  onClick={() => {
                    onChange?.(iconName);
                    setPopoverOpen(false);
                  }}
                >
                  <Component style={{ fontSize: '24px' }} />
                </ProCard>
              );
            })}
          </ProCard>
        </div>
      }
    >
      <CircleIcon allIcons={allIcons} value={value} onClick={() => setPopoverOpen(true)} />
    </Popover>
  );
};

// 导出IconSelect组件以供外部使用
export default IconSelect;
