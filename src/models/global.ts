import * as AntdIcons from '@ant-design/icons';

// 创建一个包含所有图标的对象
const allIcons: {
  [key: string]: any;
} = AntdIcons;
export default function Global() {
  return {
    allIcons,
  };
}
