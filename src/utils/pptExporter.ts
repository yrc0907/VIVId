"use client";

// 专门用于处理PPT导出的工具，避免直接在组件中导入pptxgenjs
// 这个文件只会在客户端运行

import { Slide } from '@/utils/slideTypes';

// 将在线图片URL转换为base64数据
const getImageAsBase64 = async (imageUrl: string): Promise<string | null> => {
  try {
    // 如果已经是base64格式，直接返回
    if (imageUrl.startsWith('data:image')) {
      return imageUrl;
    }

    // 否则通过fetch下载图片并转换为base64
    const response = await fetch(imageUrl);
    const blob = await response.blob();

    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('获取图片数据失败:', error);
    return null;
  }
};

// 动态导入pptxgenjs，避免服务器端导入问题
export const generateAndDownloadPPTX = async (slides: Slide[], title: string = '生成的演示文稿'): Promise<boolean> => {
  try {
    // 确保我们在客户端
    if (typeof window === 'undefined') {
      return false;
    }

    // 动态导入pptxgenjs
    const pptxModule = await import('pptxgenjs');
    const pptxgen = pptxModule.default;

    const pres = new pptxgen();

    // 设置PPT属性
    pres.layout = 'LAYOUT_16x9';

    // 创建每个幻灯片
    for (const slide of slides) {
      // 创建一个新的幻灯片
      const s = pres.addSlide();

      // 设置背景颜色
      s.background = { color: "FFFFFF" };

      // 添加标题
      s.addText(slide.title || "", {
        x: 0.5,
        y: 0.5,
        w: '90%',
        h: 1,
        fontSize: 24,
        bold: true,
        color: '363636',
        align: 'center'
      });

      // 添加内容
      if (slide.content) {
        s.addText(slide.content, {
          x: 0.5,
          y: 2.0,
          w: '90%',
          h: 2,
          fontSize: 14,
          color: '666666',
          align: slide.layout === '标题页' ? 'center' : 'left',
          breakLine: true
        });
      }

      // 添加图片(如果有)
      if (slide.imageUrl) {
        // 先将图片转换为base64格式
        const imageBase64 = await getImageAsBase64(slide.imageUrl);

        if (imageBase64) {
          // 根据布局类型调整图片位置
          const imageOptions = slide.layout === '标题页'
            ? { x: 1.5, y: 3.5, w: 7, h: 4 } // 标题页的图片居中且较大
            : { x: 5.5, y: 1.5, w: 4, h: 3 }; // 其他页面的图片在右侧

          try {
            s.addImage({ data: imageBase64, ...imageOptions });
          } catch (error) {
            console.error('添加图片失败:', error);
          }
        }
      }
    }

    // 下载PPT文件
    pres.writeFile({ fileName: `${title || '生成的演示文稿'}.pptx` });

    return true;
  } catch (error) {
    console.error('生成PPT文件失败:', error);
    return false;
  }
}; 