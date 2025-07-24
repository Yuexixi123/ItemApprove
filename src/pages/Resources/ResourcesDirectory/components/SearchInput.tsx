import { SearchOutlined } from '@ant-design/icons';
import { useModel } from '@umijs/max';
import { Input } from 'antd';

const SearchInput = () => {
  const { handleSearch } = useModel('modelPage', (model) => {
    return {
      handleSearch: model.handleSearch,
    };
  });

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleSearch(e.target.value);
  };

  return (
    <Input
      placeholder="请输入关键字"
      allowClear
      style={{ width: 200, marginBottom: '20px' }}
      onChange={onChange}
      suffix={<SearchOutlined style={{ color: 'rgba(0,0,0,.45)' }} />}
    />
  );
};

export default SearchInput;
