import axios from 'axios';
import { DEFAULT_AI_CONFIG, validateApiConfig } from './config';

/**
 * 为PPT生成配图
 * @param description 图片描述
 * @returns 生成的图片URL
 */
export async function generateImageForPPT(description: string): Promise<string> {
  try {
    if (!validateApiConfig()) {
      throw new Error('未配置API密钥，请在环境变量中设置NEXT_PUBLIC_DEEPSEEK_API_KEY');
    }

    // 构建一个更详细的图片生成提示
    const enhancedPrompt = `为PPT创建一张专业的插图：${description}。
风格：现代、简洁、专业
颜色：使用和谐的配色方案
分辨率：高清
格式：适合PPT使用的横向图片`;

    // 实际应用中需要调用专门的图像生成API
    // 这里使用占位图片服务作为示例
    // 在真实应用中，这里应该调用类似DALL-E、Midjourney等图像生成API
    const placeholderSize = '800x600';
    const placeholderText = encodeURIComponent(description.substring(0, 30) + '...');

    // 模拟API调用延迟
    await new Promise(resolve => setTimeout(resolve, 1000));

    // 返回一个占位图片URL
    // 在实际应用中，这里应返回真实的AI生成图片URL
    return `https://placehold.co/${placeholderSize}/CCDDEE/334455?text=${placeholderText}`;
  } catch (error) {
    console.error('生成图片失败:', error);
    // 如果生成失败，返回一个默认的错误占位图
    return 'https://placehold.co/800x600/FFDDDD/FF4444?text=Image+Generation+Failed';
  }
}

/**
 * 检查图片URL是否有效
 * @param url 图片URL
 * @returns 是否有效
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    // 尝试获取图片头信息，验证URL是否有效
    const response = await fetch(url, { method: 'HEAD' });
    return response.ok;
  } catch (error) {
    console.error('验证图片URL失败:', error);
    return false;
  }
} 