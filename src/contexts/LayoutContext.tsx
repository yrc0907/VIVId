"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { LayoutContextData, LayoutTheme, LayoutOptions } from '@/types/layout.types';

// 默认主题配置
const defaultTheme: LayoutTheme = {
  colorScheme: 'dark',
  primaryColor: '#ff0080',
  borderColor: '#1f2937',
  backgroundColor: '#000000',
  textColor: '#ffffff',
  headerHeight: '64px',
  sidebarWidth: '240px',
  contentPadding: '24px',
  borderRadius: '8px',
};

// 创建上下文
const LayoutContext = createContext<LayoutContextData | null>(null);

// 布局提供者组件
export function LayoutProvider({
  children,
  options
}: {
  children: React.ReactNode,
  options?: LayoutOptions
}) {
  // 状态管理
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(options?.defaultCollapsed || false);
  const [theme, setThemeState] = useState<LayoutTheme>({
    ...defaultTheme,
    ...options?.theme
  });

  // 侧边栏控制函数
  const toggleSidebar = () => setIsSidebarOpen(prev => !prev);
  const closeSidebar = () => setIsSidebarOpen(false);

  // 折叠控制函数
  const toggleCollapse = () => setIsCollapsed(prev => !prev);

  // 主题控制函数
  const setTheme = (newTheme: Partial<LayoutTheme>) => {
    setThemeState(prev => ({ ...prev, ...newTheme }));
  };

  // 切换暗/亮主题
  const toggleTheme = () => {
    setThemeState(prev => ({
      ...prev,
      colorScheme: prev.colorScheme === 'dark' ? 'light' : 'dark',
      backgroundColor: prev.colorScheme === 'dark' ? '#ffffff' : '#000000',
      textColor: prev.colorScheme === 'dark' ? '#000000' : '#ffffff',
      borderColor: prev.colorScheme === 'dark' ? '#e5e7eb' : '#1f2937',
    }));
  };

  // 上下文值
  const contextValue: LayoutContextData = {
    isSidebarOpen,
    toggleSidebar,
    closeSidebar,
    isCollapsed,
    toggleCollapse,
    theme,
    setTheme,
    toggleTheme
  };

  return (
    <LayoutContext.Provider value={contextValue}>
      {children}
    </LayoutContext.Provider>
  );
}

// 自定义钩子，用于访问布局上下文
export function useLayout(): LayoutContextData {
  const context = useContext(LayoutContext);
  if (!context) {
    throw new Error('useLayout must be used within a LayoutProvider');
  }
  return context;
} 