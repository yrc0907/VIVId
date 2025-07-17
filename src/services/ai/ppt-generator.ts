import axios from 'axios';
import { ContentGeneratedCallback, CompleteCallback } from '@/types/ai.types';
import { Slide } from '@/types/slide.types';
import { DEFAULT_AI_CONFIG, validateApiConfig } from './config';

/**
 * PPT内容生成系统提示词
 */
const SYSTEM_PROMPT = `你是一位专业的PPT内容创作专家，擅长为各种主题创建清晰、吸引人的PPT内容。
基于用户提供的PPT大纲，你需要为每个大纲要点创建详细的内容。请注意：
1. 内容应该简洁但信息丰富，符合PPT展示的特点
2. 语言应该是正式、专业的，避免口语化表达
3. 每个幻灯片应包含适量内容，不要过于冗长
4. 为每页幻灯片提供一个恰当的标题和正文内容`;

/**
 * 使用AI为大纲生成完整PPT内容
 * @param outlineItems 大纲要点数组
 * @returns 生成的PPT内容字符串
 */
export async function generatePPTFromOutline(outlineItems: string[]): Promise<string> {
  try {
    if (!validateApiConfig()) {
      throw new Error('未配置API密钥，请在环境变量中设置NEXT_PUBLIC_DEEPSEEK_API_KEY');
    }

    const response = await axios.post(
      `${DEFAULT_AI_CONFIG.apiUrl}/chat/completions`,
      {
        model: DEFAULT_AI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `请基于以下PPT大纲创建完整的内容：\n${outlineItems.join('\n')}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2500
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${DEFAULT_AI_CONFIG.apiKey}`
        }
      }
    );

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('调用AI生成PPT内容失败:', error);
    throw new Error('生成PPT内容失败，请检查API配置或网络连接');
  }
}

/**
 * 使用AI为大纲流式生成PPT内容
 * @param outlineItems 大纲要点数组
 * @param onContentGenerated 内容生成回调
 * @param onComplete 完成回调
 * @param onNetworkError 网络错误回调
 */
export async function generatePPTFromOutlineStream(
  outlineItems: string[],
  onContentGenerated: ContentGeneratedCallback,
  onComplete: CompleteCallback,
  onNetworkError?: () => void
): Promise<void> {
  try {
    if (!validateApiConfig()) {
      throw new Error('未配置API密钥，请在环境变量中设置NEXT_PUBLIC_DEEPSEEK_API_KEY');
    }

    const response = await fetch(`${DEFAULT_AI_CONFIG.apiUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${DEFAULT_AI_CONFIG.apiKey}`,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
        model: DEFAULT_AI_CONFIG.model,
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `请基于以下PPT大纲创建完整的内容：\n${outlineItems.join('\n')}`
          }
        ],
        temperature: 0.7,
        max_tokens: 2500,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    const reader = response.body?.getReader();
    if (!reader) {
      throw new Error('无法获取响应流');
    }

    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        buffer += chunk;

        // 处理SSE格式的响应
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (!line.trim() || line.trim() === 'data: [DONE]') continue;

          try {
            if (line.startsWith('data: ')) {
              const jsonStr = line.slice(6);
              const json = JSON.parse(jsonStr);
              const content = json.choices[0].delta.content || '';

              if (content) {
                fullContent += content;
                onContentGenerated(content);
              }
            }
          } catch (e) {
            console.error('解析SSE数据失败:', e);
          }
        }
      }

      // 处理完成
      onComplete(fullContent);
    } catch (streamError) {
      console.error('流式内容生成失败:', streamError);
      throw streamError;
    }
  } catch (error) {
    console.error('生成PPT内容失败:', error);
    if (onNetworkError) {
      onNetworkError();
    }
    throw error;
  }
}

/**
 * 生成结构化的PPT数据
 * @param outlineItems 大纲要点数组
 * @returns 结构化的幻灯片数组
 */
export async function generateStructuredPPT(outlineItems: string[]): Promise<Slide[]> {
  try {
    // 生成所有幻灯片的内容
    const pptContent = await generatePPTFromOutline(outlineItems);

    // 解析生成的内容，创建幻灯片数组
    const slides: Slide[] = [];

    // 首先添加标题页
    slides.push({
      title: outlineItems[0], // 第一项作为主标题
      content: '演示文稿主题概述',
      layout: '标题页',
      imageDescription: `关于${outlineItems[0]}的专业插图，现代设计风格`,
    });

    // 处理其余幻灯片
    for (let i = 1; i < outlineItems.length; i++) {
      const slideTitle = outlineItems[i];
      const slideContent = extractContentForSlide(pptContent, slideTitle, i);

      slides.push({
        title: slideTitle,
        content: slideContent,
        layout: '图文页', // 默认使用图文布局
        imageDescription: `关于"${slideTitle}"的专业插图，信息图表风格`, // 为AI生成图片提供提示
      });
    }

    return slides;
  } catch (error) {
    console.error('生成结构化PPT失败:', error);
    throw new Error('无法生成结构化PPT数据');
  }
}

/**
 * 从生成的内容中提取特定幻灯片的内容
 * @param fullContent 完整生成的内容
 * @param slideTitle 幻灯片标题
 * @param slideIndex 幻灯片索引
 * @returns 提取的幻灯片内容
 */
function extractContentForSlide(fullContent: string, slideTitle: string, slideIndex: number): string {
  // 简单实现：尝试查找幻灯片标题对应的内容
  // 在实际应用中，可能需要更复杂的解析逻辑

  // 按幻灯片分隔符或标题格式分割内容
  const slidePatterns = [
    `# ${slideTitle}`,
    `## ${slideTitle}`,
    `幻灯片 ${slideIndex}:`,
    `幻灯片${slideIndex}:`,
    slideTitle
  ];

  for (const pattern of slidePatterns) {
    const startIndex = fullContent.indexOf(pattern);
    if (startIndex >= 0) {
      // 找到了标题，提取到下一个标题或结尾
      let endIndex = fullContent.length;

      // 查找下一个可能的标题位置
      const possibleNextTitles = [
        '# ',
        '## ',
        `幻灯片 ${slideIndex + 1}:`,
        `幻灯片${slideIndex + 1}:`,
      ];

      for (const nextTitle of possibleNextTitles) {
        const nextTitleIndex = fullContent.indexOf(nextTitle, startIndex + pattern.length);
        if (nextTitleIndex > 0 && nextTitleIndex < endIndex) {
          endIndex = nextTitleIndex;
        }
      }

      // 提取内容并去除标题本身
      const content = fullContent
        .substring(startIndex + pattern.length, endIndex)
        .trim()
        .replace(/^\n+/, '') // 移除开头的换行符
        .replace(/\n+$/, ''); // 移除结尾的换行符

      return content;
    }
  }

  // 如果找不到对应内容，返回一个占位符
  return `关于${slideTitle}的内容`;
}

/**
 * 为PPT生成配图描述
 * @param slide 幻灯片数据
 * @returns 图片描述
 */
export function generateImageDescription(slide: Slide): string {
  const baseDescription = slide.imageDescription || `关于"${slide.title}"的插图`;

  // 根据不同布局类型生成不同的图片描述
  switch (slide.layout) {
    case '标题页':
      return `${baseDescription}，高质量封面图片，简洁大气`;
    case '图文页':
      return `${baseDescription}，专业信息图表，与内容相关`;
    case '分隔页':
      return `${baseDescription}，简约设计，适合过渡页面`;
    default:
      return baseDescription;
  }
} 