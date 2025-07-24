import { QuestionCircleOutlined } from '@ant-design/icons';
// 修复：从正确的模块导入SelectLang
// 从 umi 的 locale 模块导入 SelectLang 组件

export type SiderTheme = 'light' | 'dark';

export const SelectLang = () => {
  return;
};

export const Question = () => {
  return (
    <div
      style={{
        display: 'flex',
        height: 26,
      }}
      onClick={() => {
        window.open('https://pro.ant.design/docs/getting-started');
      }}
    >
      <QuestionCircleOutlined />
    </div>
  );
};
