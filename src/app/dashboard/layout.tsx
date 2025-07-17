"use client";

import { Home, LayoutTemplate, Trash2, PlusCircle, Settings } from 'lucide-react';
import { MainLayout } from '@/components/layout';
import { NavConfig } from '@/types/layout.types';

// 定义导航配置
const dashboardNavigation: NavConfig = {
  items: [
    {
      title: "Home",
      href: "/dashboard",
      icon: Home
    },
    {
      title: "Generate",
      href: "/dashboard/generate",
      icon: PlusCircle
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

/**
 * Dashboard布局
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MainLayout
      navigation={dashboardNavigation}
      logoText="Vivid AI"
      options={{
        animation: true,
        defaultCollapsed: false,
        theme: {
          primaryColor: '#ff0080',
          contentPadding: '20px'
        }
      }}
    >
      {children}
    </MainLayout>
  );
}
