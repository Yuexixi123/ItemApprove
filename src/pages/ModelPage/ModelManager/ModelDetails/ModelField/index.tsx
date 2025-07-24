import { Button, Space } from 'antd';
import SearchInput from './components/SearchInput';
// import { SettingOutlined } from "@ant-design/icons";
import DetailsCollapse from './components/DetailsCollapse';
import { useEffect, useState } from 'react';
import FieldPreview from './components/FieldPreview';
import './index.less';
import { useModel } from '@umijs/max';

const ModelField = ({ active }: { active: boolean }) => {
  const [showFieldPreview, setShowFieldPreview] = useState(false);

  const { fetchModelAttributes } = useModel('modelDetails', (model) => ({
    fetchModelAttributes: model.fetchModelAttributes,
  }));

  useEffect(() => {
    if (active) {
      fetchModelAttributes();
    }
  }, [active]);

  const handleClick = () => {
    setShowFieldPreview(true);
  };

  const handleClose = () => {
    setShowFieldPreview(false);
  };

  return (
    <>
      <Space>
        <Button onClick={handleClick}>字段预览</Button>
        <SearchInput />
      </Space>
      {/* <div className="setting-box">
                <SettingOutlined />
                <span>表格排序设置</span>
            </div> */}
      <DetailsCollapse />
      <FieldPreview showFieldPreview={showFieldPreview} handleClose={handleClose} />
    </>
  );
};

export default ModelField;
