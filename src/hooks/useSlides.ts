import { useState, useEffect } from 'react';
import { aiService } from '@/services';
import { Slide, PPTData } from '@/types/slide.types';

/**
 * 自定义钩子，处理幻灯片加载和图片生成
 * @param initialData 初始PPT数据
 */
export function useSlides(initialData: PPTData | null) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loadingImages, setLoadingImages] = useState(false);
  const [loadedSlides, setLoadedSlides] = useState<Slide[]>([]);

  // 加载幻灯片并生成图片
  useEffect(() => {
    const loadSlides = async () => {
      if (!initialData?.slides || initialData.slides.length === 0) return;

      // 检查是否有已保存的带图片的幻灯片数据
      try {
        const savedPPTWithImages = localStorage.getItem('savedPPTDataWithImages');
        if (savedPPTWithImages) {
          const parsedData = JSON.parse(savedPPTWithImages) as PPTData;
          // 确保保存的数据与当前展示的是同一份PPT (比较第一页标题)
          if (parsedData.slides?.[0]?.title === initialData.slides[0].title &&
            parsedData.slides.length === initialData.slides.length) {
            console.log('使用已保存的PPT图片数据');
            setLoadedSlides(parsedData.slides);
            return;
          }
        }
      } catch (error) {
        console.error('加载已保存的PPT图片数据失败:', error);
      }

      setLoadingImages(true);

      try {
        const updatedSlides = [...initialData.slides];

        // 为每张幻灯片生成图片
        for (let i = 0; i < updatedSlides.length; i++) {
          if (updatedSlides[i].imageDescription && !updatedSlides[i].imageUrl) {
            try {
              const imageDescription = updatedSlides[i].imageDescription || '';
              const imageUrl = await aiService.generateImageForPPT(imageDescription);
              updatedSlides[i] = { ...updatedSlides[i], imageUrl };
            } catch (error) {
              console.error(`生成第${i + 1}张幻灯片图片失败:`, error);
            }
          }
          // 更新已加载的幻灯片，以便逐步显示
          setLoadedSlides([...updatedSlides.slice(0, i + 1)]);
        }

        setLoadedSlides(updatedSlides);

        // 保存带有图片URL的完整数据到localStorage
        try {
          localStorage.setItem('savedPPTDataWithImages', JSON.stringify({ slides: updatedSlides }));
          localStorage.setItem('savedPPTData', JSON.stringify({ slides: updatedSlides }));
        } catch (error) {
          console.error('保存PPT图片数据失败:', error);
        }
      } catch (error) {
        console.error('加载PPT图片失败:', error);
      } finally {
        setLoadingImages(false);
      }
    };

    loadSlides();
  }, [initialData]);

  // 导航到上一张幻灯片
  const prevSlide = () => {
    setCurrentSlide(prev => (prev > 0 ? prev - 1 : prev));
  };

  // 导航到下一张幻灯片
  const nextSlide = () => {
    setCurrentSlide(prev => (prev < loadedSlides.length - 1 ? prev + 1 : prev));
  };

  // 获取当前幻灯片
  const currentSlideData = loadedSlides[currentSlide];

  return {
    currentSlide,
    setCurrentSlide,
    loadingImages,
    loadedSlides,
    currentSlideData,
    prevSlide,
    nextSlide
  };
} 