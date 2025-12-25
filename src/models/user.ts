import { useState, useEffect } from 'react';
import { getUserNames } from '@/services/user/api';

export default () => {
  // 用户列表状态
  const [userOptions, setUserOptions] = useState<{ label: string; value: number }[]>([]);
  // 加载状态
  const [loading, setLoading] = useState<boolean>(true); // 初始状态设为true

  // 获取用户列表数据
  const fetchUserNames = async () => {
    setLoading(true);
    try {
      const res = await getUserNames();
      if (res && res.inside_code === 0 && Array.isArray(res.data)) {
        setUserOptions(res.data);
      }
    } catch (error) {
      console.error('获取用户列表失败:', error);
    } finally {
      setLoading(false);
    }
  };

  // 初始化时获取用户列表
  useEffect(() => {
    fetchUserNames();
  }, []);

  return {
    userOptions,
    loading,
    fetchUserNames, // 导出刷新方法，以便在需要时手动刷新
  };
};
