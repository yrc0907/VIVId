/**
 * 幻灯片相关类型定义
 */

/**
 * 幻灯片布局类型
 */
export type SlideLayout = '标题页' | '内容页' | '图文页' | '分隔页';

/**
 * 幻灯片数据结构
 */
export interface Slide {
  title: string;
  content: string;
  layout?: SlideLayout;
  imageDescription?: string;
  imageUrl?: string;
}

/**
 * PPT数据结构
 */
export interface PPTData {
  slides: Slide[];
} 