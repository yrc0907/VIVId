import React from 'react';
import { cn } from '@/lib/utils';

interface ContainerProps {
  children: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'full';
  centered?: boolean;
  padding?: string;
}

/**
 * 内容容器组件，用于限制内容的最大宽度并居中
 */
export function Container({
  children,
  className,
  maxWidth = 'lg',
  centered = true,
  padding = 'px-4 md:px-6 lg:px-8',
}: ContainerProps) {
  const maxWidthClasses = {
    sm: 'max-w-screen-sm',
    md: 'max-w-screen-md',
    lg: 'max-w-screen-lg',
    xl: 'max-w-screen-xl',
    '2xl': 'max-w-screen-2xl',
    full: 'max-w-full',
  };

  return (
    <div
      className={cn(
        maxWidthClasses[maxWidth],
        padding,
        centered && 'mx-auto',
        'w-full',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * 页面标题组件
 */
export function PageTitle({
  title,
  description,
  className,
  actions,
}: {
  title: string;
  description?: string;
  className?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className={cn('mb-8', className)}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">{title}</h1>
          {description && (
            <p className="mt-2 text-sm text-gray-400">{description}</p>
          )}
        </div>
        {actions && <div className="mt-4 md:mt-0 flex gap-3">{actions}</div>}
      </div>
    </div>
  );
}

/**
 * 页面内容包装器
 */
export function ContentWrapper({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'p-6 bg-gray-900/50 border border-gray-800 rounded-xl',
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * 页面区块组件
 */
export function ContentSection({
  title,
  description,
  children,
  className,
  noPadding,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  noPadding?: boolean;
}) {
  return (
    <section className={cn('mb-8', className)}>
      {title && (
        <div className="mb-4">
          <h2 className="text-xl font-semibold">{title}</h2>
          {description && (
            <p className="mt-1 text-sm text-gray-400">{description}</p>
          )}
        </div>
      )}
      <div
        className={cn(
          'bg-gray-900/50 border border-gray-800 rounded-lg overflow-hidden',
          !noPadding && 'p-4 md:p-6'
        )}
      >
        {children}
      </div>
    </section>
  );
} 