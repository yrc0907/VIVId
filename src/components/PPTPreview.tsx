"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Download, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react';
import { generateImageForPPT } from '@/services/ai.service';
import { generateAndDownloadPPTX } from '@/utils/pptExporter';
import { Slide, PPTData } from '@/utils/slideTypes';

interface PPTPreviewProps {
  pptData: PPTData;
  onClose: () => void;
}

const PPTPreview: React.FC<PPTPreviewProps> = ({ pptData, onClose }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadingImages, setLoadingImages] = useState(false);
  const [generatingPPT, setGeneratingPPT] = useState(false);
  const [loadedSlides, setLoadedSlides] = useState<Slide[]>([]);

  // 加载图片
  useEffect(() => {
    const loadImages = async () => {
      if (!pptData?.slides || pptData.slides.length === 0) return;

      setLoadingImages(true);

      try {
        const updatedSlides = [...pptData.slides];

        // 为每张幻灯片生成图片
        for (let i = 0; i < updatedSlides.length; i++) {
          if (updatedSlides[i].imageDescription && !updatedSlides[i].imageUrl) {
            try {
              const imageUrl = await generateImageForPPT(updatedSlides[i].imageDescription);
              updatedSlides[i] = { ...updatedSlides[i], imageUrl };
            } catch (error) {
              console.error(`生成第${i + 1}张幻灯片图片失败:`, error);
            }
          }
          // 更新已加载的幻灯片，以便逐步显示
          setLoadedSlides([...updatedSlides.slice(0, i + 1)]);
        }

        setLoadedSlides(updatedSlides);
      } catch (error) {
        console.error('加载PPT图片失败:', error);
      } finally {
        setLoadingImages(false);
      }
    };

    loadImages();
  }, [pptData]);

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

  // 上一张幻灯片
  const prevSlide = () => {
    setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));
  };

  // 下一张幻灯片
  const nextSlide = () => {
    setCurrentSlide(prev => (prev < loadedSlides.length - 1 ? prev + 1 : prev));
  };

  // 获取当前幻灯片
  const currentSlideData = loadedSlides[currentSlide];

  if (!pptData || !pptData.slides || pptData.slides.length === 0) {
    return <div className="text-center p-8">无PPT数据可预览</div>;
  }

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-lg p-6 text-white">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold">PPT预览</h2>
        <div className="flex space-x-3">
          {/* 下载按钮 */}
          <Button
            variant="outline"
            className="bg-blue-600 hover:bg-blue-700 border-none text-white"
            onClick={handleGeneratePPTX}
            disabled={loadingImages || generatingPPT || !loadedSlides.length}
          >
            {generatingPPT ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                生成中...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                下载PPT
              </>
            )}
          </Button>

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

      {/* 幻灯片计数器 */}
      <div className="text-center text-sm text-gray-400 mb-2">
        幻灯片 {currentSlide + 1} / {loadedSlides.length}
      </div>

      {/* 幻灯片预览区域 */}
      <div className="relative bg-white rounded-lg p-6 shadow-lg aspect-video mb-4 overflow-hidden">
        {loadingImages && currentSlide >= loadedSlides.length ? (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-800 bg-opacity-70">
            <div className="text-center">
              <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
              <p className="text-sm">加载幻灯片 {loadedSlides.length + 1}/{pptData.slides.length}</p>
            </div>
          </div>
        ) : currentSlideData ? (
          <div className="text-black h-full flex flex-col">
            {/* 幻灯片标题 */}
            <h3 className="text-2xl font-bold text-center mb-4">{currentSlideData.title}</h3>

            {/* 幻灯片内容 */}
            <div className="flex flex-1">
              <div className="flex-1">
                <p className="text-gray-700 whitespace-pre-wrap">
                  {currentSlideData.content}
                </p>
              </div>

              {/* 幻灯片图片 */}
              {currentSlideData.imageUrl && (
                <div className={`${currentSlideData.layout === '标题页' ? 'w-full mt-4' : 'w-1/2 pl-4'}`}>
                  <img
                    src={currentSlideData.imageUrl}
                    alt={currentSlideData.imageDescription}
                    className="rounded-md object-contain max-h-full"
                  />
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-500">幻灯片加载中...</p>
          </div>
        )}
      </div>

      {/* 导航按钮 */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          className="bg-gray-800 border-none text-white"
          onClick={prevSlide}
          disabled={currentSlide === 0}
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          上一页
        </Button>

        <Button
          variant="outline"
          className="bg-gray-800 border-none text-white"
          onClick={nextSlide}
          disabled={currentSlide >= loadedSlides.length - 1}
        >
          下一页
          <ChevronRight className="h-4 w-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};

export default PPTPreview; 