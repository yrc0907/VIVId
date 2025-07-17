"use client";

import { useState, useEffect } from 'react';

// 定义常用的断点
export const breakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

/**
 * 处理响应式断点的钩子
 * @returns 一个对象，包含当前所有断点的状态
 */
export const useBreakpoint = () => {
  // 在服务器端渲染时，默认值为false
  const [state, setState] = useState<Record<string, boolean>>({
    sm: false,
    md: false,
    lg: false,
    xl: false,
    '2xl': false,
    isMobile: false,
    isTablet: false,
    isDesktop: false,
  });

  useEffect(() => {
    // 创建媒体查询
    const queries = {
      sm: window.matchMedia(`(min-width: ${breakpoints.sm}px)`),
      md: window.matchMedia(`(min-width: ${breakpoints.md}px)`),
      lg: window.matchMedia(`(min-width: ${breakpoints.lg}px)`),
      xl: window.matchMedia(`(min-width: ${breakpoints.xl}px)`),
      '2xl': window.matchMedia(`(min-width: ${breakpoints['2xl']}px)`),
    };

    // 更新状态
    const updateState = () => {
      const newState = {
        sm: queries.sm.matches,
        md: queries.md.matches,
        lg: queries.lg.matches,
        xl: queries.xl.matches,
        '2xl': queries['2xl'].matches,
        // 常用设备类型
        isMobile: !queries.md.matches, // < 768px
        isTablet: queries.md.matches && !queries.lg.matches, // >= 768px && < 1024px
        isDesktop: queries.lg.matches, // >= 1024px
      };

      setState(newState);
    };

    // 初始化状态
    updateState();

    // 添加监听器
    const listeners = Object.values(queries).map((mediaQuery) => {
      mediaQuery.addEventListener('change', updateState);
      return () => mediaQuery.removeEventListener('change', updateState);
    });

    // 清理
    return () => {
      listeners.forEach((removeListener) => removeListener());
    };
  }, []);

  return state;
}; 