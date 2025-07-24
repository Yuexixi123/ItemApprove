import { useState, useCallback } from 'react';

// 修改 useHover 支持多元素悬停状态
const useHover = <T extends string | number>() => {
  // 将状态从布尔值改为泛型 ID 值
  const [hoveredId, setHoveredId] = useState<T | null>(null);

  // 修改处理函数接收 ID 参数
  const handleMouseEnter = useCallback((id: T) => {
    setHoveredId(id);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredId(null);
  }, []);

  // 添加一个检查函数，用于判断特定 ID 是否处于悬停状态
  const isItemHovered = useCallback(
    (id: T) => {
      return hoveredId === id;
    },
    [hoveredId],
  );

  return {
    hoveredId,
    handleMouseEnter,
    handleMouseLeave,
    isItemHovered,
  };
};

export default useHover;
