"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence } from "framer-motion";
import { Sidebar, defaultNavigation } from "@/components/layout/Sidebar";
import { Navbar } from "@/components/layout/Navbar";
import { PageTransition } from "@/components/layout/PageTransition";
import { LayoutProvider, useLayout } from "@/contexts/LayoutContext";
import { LayoutOptions, NavConfig } from "@/types/layout.types";
import { cn } from "@/lib/utils";

interface MainLayoutProps {
  children: React.ReactNode;
  navigation?: NavConfig;
  options?: LayoutOptions;
  pageTransitionType?: 'fade' | 'slide' | 'scale' | 'none';
  pageTransitionDuration?: number;
  logoText?: string;
  logo?: React.ReactNode;
  onSearch?: (query: string) => void;
  actions?: React.ReactNode[];
  userMenu?: React.ReactNode;
}

/**
 * 内部布局组件，用于访问布局上下文
 */
function InnerLayout({
  children,
  navigation = defaultNavigation,
  pageTransitionType = 'fade',
  pageTransitionDuration = 0.5,
  logoText = 'Vivid',
  logo,
  onSearch,
  actions,
  userMenu,
}: Omit<MainLayoutProps, 'options'>) {
  const { isSidebarOpen, closeSidebar, isCollapsed, toggleSidebar, theme } = useLayout();
  const pathname = usePathname();

  const contentWidthClass = isCollapsed
    ? "md:ml-16" // 侧边栏折叠时的宽度
    : "md:ml-60"; // 侧边栏展开时的宽度

  return (
    <div
      className={cn(
        "flex h-screen text-white transition-colors duration-300",
        theme.colorScheme === 'dark' ? 'bg-black' : 'bg-white'
      )}
      style={{
        color: theme.textColor,
        backgroundColor: theme.backgroundColor,
      }}
    >
      {/* 侧边栏 */}
      <Sidebar
        navigation={navigation}
        isOpen={isSidebarOpen}
        onClose={closeSidebar}
        isCollapsed={isCollapsed}
        logoText={logoText}
        logo={logo}
      />

      {/* 主内容区 */}
      <div className={cn("flex-1 flex flex-col transition-all", contentWidthClass)}>
        {/* 顶部导航栏 */}
        <Navbar
          onMenuClick={toggleSidebar}
          onSearch={onSearch}
          actions={actions}
          userMenu={userMenu}
          logoText={logoText}
          logo={logo}
        />

        {/* 主内容区 */}
        <main className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <PageTransition
              key={pathname}
              type={pageTransitionType}
              duration={pageTransitionDuration}
            >
              <div className="p-6">
                {children}
              </div>
            </PageTransition>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

/**
 * 主布局组件
 */
export function MainLayout(props: MainLayoutProps) {
  const { options, ...rest } = props;

  return (
    <LayoutProvider options={options}>
      <InnerLayout {...rest} />
    </LayoutProvider>
  );
} 