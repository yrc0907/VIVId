import { AIModelConfig } from '@/types/ai.types';

/**
 * AI服务的默认配置
 */
export const DEFAULT_AI_CONFIG: AIModelConfig = {
  apiKey: process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '',
  apiUrl: process.env.NEXT_PUBLIC_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
};

/**
 * PPT大纲生成的系统提示词
 */
export const OUTLINE_SYSTEM_PROMPT = `你是一位专业的PPT大纲规划专家，擅长为各种主题设计结构化、逻辑清晰的PPT大纲。
请根据用户提供的主题，创建一个包含3个要点的PPT大纲。
要点应该涵盖该主题的关键方面，并按照合理的顺序排列，确保逻辑连贯、层次分明。
每个要点应该简洁明了，不超过15个字，适合作为PPT的章节标题。
不要使用编号，只需返回要点列表，每行一个要点。`;

/**
 * 检查API配置是否有效
 */
export function validateApiConfig(): boolean {
  if (!DEFAULT_AI_CONFIG.apiKey) {
    console.error('未配置API密钥，请在环境变量中设置NEXT_PUBLIC_DEEPSEEK_API_KEY');
    return false;
  }
  return true;
} 