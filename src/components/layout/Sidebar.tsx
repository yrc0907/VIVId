"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ChevronLeft, ChevronRight, X,
  Home, LayoutTemplate, Settings, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SidebarProps, NavItem } from "@/types/layout.types";
import { cn } from "@/lib/utils";
import { useLayout } from "@/contexts/LayoutContext";

/**
 * 渲染导航项
 */
const NavItemComponent = ({
  item,
  isCollapsed,
  depth = 0,
}: {
  item: NavItem;
  isCollapsed?: boolean;
  depth?: number;
}) => {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const isActive = item.isActive !== undefined ? item.isActive : pathname === item.href;
  const Icon = item.icon;
  const hasChildren = item.children && item.children.length > 0;

  // 子项应该显示
  const shouldShowChildren = hasChildren && !isCollapsed && isOpen;

  return (
    <div>
      <Link
        href={item.href}
        onClick={(e) => {
          if (hasChildren) {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium",
          isActive ? "bg-gray-800 text-white" : "text-gray-400 hover:bg-gray-800 hover:text-white",
          isCollapsed && "justify-center"
        )}
      >
        {Icon && <Icon className="h-5 w-5 flex-shrink-0" />}
        {!isCollapsed && (
          <>
            <span className="flex-1 truncate">{item.title}</span>
            {item.badge && (
              <span className="ml-auto rounded-full bg-gray-700 px-2 text-xs font-semibold">
                {item.badge}
              </span>
            )}
            {hasChildren && (
              <ChevronRight
                className={cn(
                  "h-4 w-4 transition-transform",
                  isOpen && "rotate-90"
                )}
              />
            )}
          </>
        )}
      </Link>

      {shouldShowChildren && (
        <div className="ml-4 mt-1 space-y-1 border-l border-gray-700 pl-2">
          {item.children!.map((child, idx) => (
            <NavItemComponent
              key={`${child.title}-${idx}`}
              item={child}
              isCollapsed={isCollapsed}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * 侧边栏组件
 */
export function Sidebar({
  navigation,
  isOpen,
  onClose,
  isCollapsed: propsIsCollapsed,
  onToggleCollapse: propsOnToggleCollapse,
  logo,
  logoText = "Vivid"
}: SidebarProps) {
  // 使用布局上下文或者传入的props
  const layoutContext = useLayout();

  // 优先使用props，否则使用上下文
  const sidebarOpen = isOpen !== undefined ? isOpen : layoutContext.isSidebarOpen;
  const closeSidebar = onClose || layoutContext.closeSidebar;
  const isCollapsed = propsIsCollapsed !== undefined ? propsIsCollapsed : layoutContext.isCollapsed;
  const toggleCollapse = propsOnToggleCollapse || layoutContext.toggleCollapse;

  return (
    <>
      <aside
        className={cn(
          "fixed z-20 inset-y-0 left-0 bg-black border-r border-gray-800 flex-col transform transition-all duration-300 ease-in-out md:relative",
          isCollapsed ? "w-16" : "w-60",
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* 顶部Logo区域 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-tr from-pink-500 to-blue-500 rounded-md">
              {logo}
            </div>
            {!isCollapsed && <h1 className="text-xl font-bold truncate">{logoText}</h1>}
          </div>
          <div className="flex items-center">
            {/* 折叠按钮 - 仅在大屏幕上显示 */}
            <Button
              variant="ghost"
              size="icon"
              className="hidden md:flex"
              onClick={toggleCollapse}
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>

            {/* 关闭按钮 - 仅在小屏幕上显示 */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={closeSidebar}
            >
              <X className="h-5 w-5" />
              <span className="sr-only">关闭侧边栏</span>
            </Button>
          </div>
        </div>

        {/* 导航区域 */}
        <div className={cn("flex-1 overflow-y-auto p-3 space-y-2", isCollapsed && "px-2")}>
          {navigation.items.map((item, idx) => (
            <NavItemComponent
              key={`nav-${idx}`}
              item={item}
              isCollapsed={isCollapsed}
            />
          ))}
        </div>

        {/* 底部导航区 */}
        {navigation.footer && (
          <div className={cn("p-3 border-t border-gray-800", isCollapsed && "px-2")}>
            <div className="space-y-2">
              {navigation.footer.map((item, idx) => (
                <NavItemComponent
                  key={`footer-${idx}`}
                  item={item}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* 背景遮罩 - 在小屏幕和侧边栏打开时显示 */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 md:hidden"
          onClick={closeSidebar}
        />
      )}
    </>
  );
}

/**
 * 默认导航配置 - 用于快速启动
 */
export const defaultNavigation = {
  items: [
    {
      title: "Home",
      href: "/dashboard",
      icon: Home
    },
    {
      title: "Templates",
      href: "/templates",
      icon: LayoutTemplate
    },
    {
      title: "Trash",
      href: "/trash",
      icon: Trash2
    }
  ],
  footer: [
    {
      title: "Settings",
      href: "/settings",
      icon: Settings
    }
  ]
};
