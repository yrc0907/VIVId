"use client";

// 专门用于处理PPT导出的工具，避免直接在组件中导入pptxgenjs
// 这个文件只会在客户端运行

import { Slide } from '@/utils/slideTypes';

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
        // 根据布局类型调整图片位置
        const imageOptions = slide.layout === '标题页'
          ? { x: 1.5, y: 3.5, w: 7, h: 4 } // 标题页的图片居中且较大
          : { x: 5.5, y: 1.5, w: 4, h: 3 }; // 其他页面的图片在右侧

        try {
          s.addImage({ data: slide.imageUrl, ...imageOptions });
        } catch (error) {
          console.error('添加图片失败:', error);
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