import { IconType } from "react-icons";
import { LucideIcon } from "lucide-react";

/**
 * 导航项类型定义
 */
export interface NavItem {
  title: string;
  href: string;
  icon?: LucideIcon | IconType;
  isActive?: boolean;
  badge?: string | number;
  children?: NavItem[];
}

/**
 * 导航区配置
 */
export interface NavConfig {
  items: NavItem[];
  footer?: NavItem[];
}

/**
 * 布局主题配置
 */
export interface LayoutTheme {
  colorScheme: 'light' | 'dark' | 'system';
  primaryColor: string;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  headerHeight?: string;
  sidebarWidth?: string;
  contentPadding?: string;
  borderRadius?: string;
}

/**
 * 布局配置选项
 */
export interface LayoutOptions {
  showSidebar?: boolean;
  showNavbar?: boolean;
  sidebarCollapsible?: boolean;
  defaultCollapsed?: boolean;
  contentWidth?: 'full' | 'contained';
  theme?: Partial<LayoutTheme>;
  animation?: boolean;
}

/**
 * 侧边栏属性
 */
export interface SidebarProps {
  navigation: NavConfig;
  isOpen?: boolean;
  onClose?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  logo?: React.ReactNode;
  logoText?: string;
  theme?: Partial<LayoutTheme>;
}

/**
 * 导航栏属性
 */
export interface NavbarProps {
  onMenuClick?: () => void;
  showSearch?: boolean;
  onSearch?: (query: string) => void;
  actions?: React.ReactNode[];
  userMenu?: React.ReactNode;
  logo?: React.ReactNode;
  logoText?: string;
  theme?: Partial<LayoutTheme>;
}

/**
 * 页面过渡属性
 */
export interface PageTransitionProps {
  children: React.ReactNode;
  type?: 'fade' | 'slide' | 'scale' | 'none';
  duration?: number;
}

/**
 * 布局上下文数据
 */
export interface LayoutContextData {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  isCollapsed: boolean;
  toggleCollapse: () => void;
  theme: LayoutTheme;
  setTheme: (theme: Partial<LayoutTheme>) => void;
  toggleTheme: () => void;
} 