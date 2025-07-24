import React, { useState, useCallback, useEffect } from 'react';
import { Input, Flex } from 'antd';
import type { GetProps } from 'antd';

// 定义一个类型SearchProps，用于获取Input.Search组件的props类型
type SearchProps = GetProps<typeof Input.Search>;

// 定义样式对象，用于SearchPage组件的样式
const styles = {
  content: {
    width: '100%',
    height: '70vh',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  search: {
    width: '50%',
  },
};

// SearchPage函数组件
const SearchPage = () => {
  // 定义searchValue状态来存储搜索框的值
  const [searchValue, setSearchValue] = useState('');

  // 定义handleInputChange函数来处理搜索框的输入变化
  // 使用useCallback来避免不必要的重新渲染
  const handleInputChange: SearchProps['onSearch'] = useCallback(
    (value: string) => {
      setSearchValue(value);
    },
    [searchValue],
  );

  // 使用useEffect来监听searchValue的变化
  useEffect(() => {
    // 跳转至模型页面，并附带查询参数
    // history.push(`/search-result?query=${encodeURIComponent(searchValue)}`);
    console.log('搜索值变化:', searchValue);
  }, [searchValue]);

  // 渲染搜索页面组件
  return (
    <Flex style={styles.content} justify="center" align="center">
      <Flex style={styles.search}>
        <Input.Search
          placeholder="请输入IP或资产名称"
          allowClear
          enterButton
          size="large"
          onSearch={handleInputChange}
        />
      </Flex>
    </Flex>
  );
};

// 导出SearchPage组件
export default SearchPage;
