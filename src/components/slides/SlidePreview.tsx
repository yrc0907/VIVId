import { Loader2 } from 'lucide-react';
import { Slide } from '@/types/slide.types';

interface SlidePreviewProps {
  slide: Slide | undefined;
  isLoading: boolean;
  slideNumber: number;
  totalSlides: number;
}

/**
 * 单个幻灯片预览组件
 */
export function SlidePreview({ slide, isLoading, slideNumber, totalSlides }: SlidePreviewProps) {
  if (isLoading && !slide) {
    return (
      <div className="relative bg-white rounded-lg p-6 shadow-lg aspect-video mb-4 overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
            <p className="text-sm">加载幻灯片 {slideNumber}/{totalSlides}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!slide) {
    return (
      <div className="bg-white rounded-lg p-6 shadow-lg aspect-video mb-4 overflow-hidden flex items-center justify-center">
        <p className="text-gray-500">幻灯片加载中...</p>
      </div>
    );
  }

  return (
    <div className="relative bg-white rounded-lg p-6 shadow-lg aspect-video mb-4 overflow-hidden">
      <div className="text-black h-full flex flex-col">
        {/* 幻灯片标题 */}
        <h3 className="text-2xl font-bold text-center mb-4">{slide.title}</h3>

        {/* 幻灯片内容 */}
        <div className="flex flex-1">
          <div className="flex-1">
            <p className="text-gray-700 whitespace-pre-wrap">
              {slide.content}
            </p>
          </div>

          {/* 幻灯片图片 */}
          {slide.imageUrl && (
            <div className={`${slide.layout === '标题页' ? 'w-full mt-4' : 'w-1/2 pl-4'}`}>
              <img
                src={slide.imageUrl}
                alt={slide.imageDescription || slide.title}
                className="rounded-md object-contain max-h-full"
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 