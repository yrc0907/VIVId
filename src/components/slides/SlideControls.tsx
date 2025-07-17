import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface SlideControlsProps {
  currentSlide: number;
  totalSlides: number;
  onPrev: () => void;
  onNext: () => void;
}

/**
 * 幻灯片导航控制组件
 */
export function SlideControls({
  currentSlide,
  totalSlides,
  onPrev,
  onNext
}: SlideControlsProps) {
  return (
    <div className="flex items-center justify-between mt-2 mb-4">
      {/* 幻灯片计数器 */}
      <div className="text-center text-sm text-gray-400">
        幻灯片 {currentSlide + 1} / {totalSlides}
      </div>

      {/* 导航按钮 */}
      <div className="flex space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={onPrev}
          disabled={currentSlide <= 0}
          className="flex items-center p-2 bg-gray-800 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">上一张</span>
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onNext}
          disabled={currentSlide >= totalSlides - 1}
          className="flex items-center p-2 bg-gray-800 border-gray-700 hover:bg-gray-700 disabled:opacity-50"
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">下一张</span>
        </Button>
      </div>
    </div>
  );
} 