// 幻灯片类型定义，便于跨组件共享

export interface Slide {
  layout: string;
  title: string;
  content: string;
  imageDescription: string;
  imageUrl?: string;
}

export interface PPTData {
  slides: Slide[];
} 