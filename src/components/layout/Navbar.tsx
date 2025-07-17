"use client";

import { useState } from "react";
import { NavbarProps } from "@/types/layout.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, Moon, Sun, Menu, Plus, Upload,
  BellRing, User, Settings, LogOut
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useLayout } from "@/contexts/LayoutContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * 顶部导航栏组件
 */
export function Navbar({
  onMenuClick,
  showSearch = true,
  onSearch,
  actions,
  userMenu,
  logo,
  logoText
}: NavbarProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // 使用布局上下文
  const { toggleSidebar, theme, toggleTheme, isCollapsed } = useLayout();

  // 优先使用props的菜单点击处理函数，否则使用布局上下文的
  const handleMenuClick = onMenuClick || toggleSidebar;

  // 处理搜索
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch && searchQuery.trim()) {
      onSearch(searchQuery);
    }
  };

  // 默认用户菜单
  const defaultUserMenu = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full hover:bg-gray-800"
        >
          <User className="h-5 w-5" />
          <span className="sr-only">用户菜单</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 bg-gray-900 border-gray-800">
        <DropdownMenuLabel>我的账户</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>个人资料</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>设置</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <LogOut className="mr-2 h-4 w-4" />
          <span>退出登录</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  // 默认操作按钮
  const defaultActions = (
    <>
      <Button
        variant="outline"
        className="hidden md:flex border-gray-700 bg-gray-900 text-white hover:bg-gray-800 hover:text-white h-10"
      >
        <Upload className="h-4 w-4 mr-2" />
        导入
      </Button>
      <Button
        className="hidden md:flex bg-white text-black hover:bg-gray-200 h-10"
      >
        <Plus className="h-4 w-4 mr-2" />
        新项目
      </Button>
    </>
  );

  return (
    <header className="border-b border-gray-800 p-3 flex justify-between items-center h-16 flex-shrink-0">
      {/* 左侧区域：菜单按钮、Logo、搜索栏 */}
      <div className="flex items-center gap-3">
        {/* 移动端菜单按钮 */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden"
          onClick={handleMenuClick}
        >
          <Menu className="h-6 w-6" />
          <span className="sr-only">菜单</span>
        </Button>

        {/* Logo区域 - 仅当侧边栏收起或在移动端显示 */}
        {(isCollapsed || typeof window !== 'undefined' && window.innerWidth < 768) && (
          <div className="flex items-center gap-2 mr-2">
            {logo || (
              <div className="w-8 h-8 bg-gradient-to-tr from-pink-500 to-blue-500 rounded-md" />
            )}
            {logoText && <span className="text-lg font-bold">{logoText}</span>}
          </div>
        )}

        {/* 搜索区域 */}
        {showSearch && (
          <form onSubmit={handleSearchSubmit} className="hidden md:flex items-center flex-1 max-w-md">
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-gray-900 border-gray-700 pl-10 text-sm rounded-lg w-full h-9"
                placeholder="搜索..."
              />
            </div>
          </form>
        )}
      </div>

      {/* 右侧区域：操作按钮、主题切换、用户菜单 */}
      <div className="flex items-center gap-3">
        {/* 主题切换按钮 */}
        <div className="hidden md:flex items-center gap-2 border border-gray-700 rounded-full p-1">
          <button
            className={cn(
              "p-1 rounded-full transition-all",
              theme.colorScheme === "dark" ? "bg-gray-700 text-white" : "text-gray-400"
            )}
            title="深色模式"
            onClick={() => theme.colorScheme !== "dark" && toggleTheme()}
          >
            <Moon className="h-4 w-4" />
          </button>
          <button
            className={cn(
              "p-1 rounded-full transition-all",
              theme.colorScheme !== "dark" ? "bg-gray-300 text-gray-900" : "text-gray-400"
            )}
            title="浅色模式"
            onClick={() => theme.colorScheme === "dark" && toggleTheme()}
          >
            <Sun className="h-4 w-4" />
          </button>
        </div>

        {/* 通知图标 */}
        <Button variant="ghost" size="icon" className="relative">
          <BellRing className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </Button>

        {/* 操作按钮 */}
        {actions || defaultActions}

        {/* 移动端搜索按钮 */}
        {showSearch && (
          <Button variant="ghost" size="icon" className="md:hidden">
            <Search className="h-5 w-5" />
            <span className="sr-only">搜索</span>
          </Button>
        )}

        {/* 用户菜单 */}
        {userMenu || defaultUserMenu}
      </div>
    </header>
  );
}

