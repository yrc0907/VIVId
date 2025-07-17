"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { generateAndDownloadPPTX } from '@/utils/pptExporter';
import { PPTData } from '@/types/slide.types';
import { SlidePreview, SlideControls, DownloadButton } from './slides';
import { useSlides } from '@/hooks';

interface PPTPreviewProps {
  pptData: PPTData;
  onClose: () => void;
}

/**
 * PPT预览组件
 */
const PPTPreview: React.FC<PPTPreviewProps> = ({ pptData, onClose }) => {
  const [generatingPPT, setGeneratingPPT] = useState(false);

  // 使用自定义钩子处理幻灯片逻辑
  const {
    currentSlide,
    loadingImages,
    loadedSlides,
    currentSlideData,
    prevSlide,
    nextSlide
  } = useSlides(pptData);

  // 生成并下载PPT
  const handleGeneratePPTX = async () => {
    if (!loadedSlides || loadedSlides.length === 0) return;

    setGeneratingPPT(true);

    try {
      // 使用专用的导出工具生成和下载PPTX
      const success = await generateAndDownloadPPTX(loadedSlides, loadedSlides[0]?.title || '生成的演示文稿');

      if (!success) {
        throw new Error('生成PPT失败');
      }
    } catch (error) {
      console.error('生成PPT文件失败:', error);
      alert('生成PPT文件失败，请重试');
    } finally {
      setGeneratingPPT(false);
    }
  };

  if (!pptData || !pptData.slides || pptData.slides.length === 0) {
    return <div className="text-center p-8">无PPT数据可预览</div>;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">PPT预览</h2>
        <div className="flex space-x-3">
          {/* 下载按钮 */}
          <DownloadButton
            onDownload={handleGeneratePPTX}
            isLoading={generatingPPT}
            disabled={loadingImages || !loadedSlides.length}
          />

          {/* 关闭按钮 */}
          <Button
            variant="outline"
            className="bg-gray-700 hover:bg-gray-600 border-none text-white"
            onClick={onClose}
          >
            关闭预览
          </Button>
        </div>
      </div>

      {/* 幻灯片控制器 */}
      <SlideControls
        currentSlide={currentSlide}
        totalSlides={loadedSlides.length}
        onPrev={prevSlide}
        onNext={nextSlide}
      />

      {/* 幻灯片预览 */}
      <SlidePreview
        slide={currentSlideData}
        isLoading={loadingImages && currentSlide >= loadedSlides.length}
        slideNumber={loadedSlides.length + 1}
        totalSlides={pptData.slides.length}
      />
    </div>
  );
};

export default PPTPreview; 