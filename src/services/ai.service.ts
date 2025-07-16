import axios from 'axios';

// 需要在环境变量中配置
const API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '';
const API_URL = process.env.NEXT_PUBLIC_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';

// PPT大纲生成提示词模板
const SYSTEM_PROMPT = `你是一位专业的PPT大纲规划专家，擅长为各种主题设计结构化、逻辑清晰的PPT大纲。
请根据用户提供的主题，创建一个包含8-12个要点的PPT大纲。
要点应该涵盖该主题的关键方面，并按照合理的顺序排列，确保逻辑连贯、层次分明。
每个要点应该简洁明了，不超过15个字，适合作为PPT的章节标题。
不要使用编号，只需返回要点列表，每行一个要点。`;

/**
 * 使用Deepseek AI生成PPT大纲
 * @param prompt 用户输入的主题
 * @returns 生成的大纲要点数组
 */
export async function generatePPTOutline(prompt: string): Promise<string[]> {
  console.log("------------------------API_KEY-----------------------", API_KEY);
  try {
    if (!API_KEY) {
      throw new Error('未配置API密钥，请在环境变量中设置NEXT_PUBLIC_DEEPSEEK_API_KEY');
    }

    const response = await axios.post(
      `${API_URL}/chat/completions`,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: SYSTEM_PROMPT
          },
          {
            role: 'user',
            content: `请为"${prompt}"主题设计一个PPT大纲。`
          }
        ],
        temperature: 0.7,
        max_tokens: 800
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${API_KEY}`
        }
      }
    );
    console.log("---------------------response----------------------", response);

    // 处理返回结果
    const content = response.data.choices[0].message.content;

    console.log("---------------------content----------------------", content);
    // 将返回的文本按行分割成数组，并过滤空行
    const outlineItems = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      // 移除可能的编号或标点符号
      .map((line: string) => line.replace(/^[\d\-\*\.\s]+/, '').trim());

    // 添加一个关于主题的概述作为第一项
    return [`${prompt}主题概述`, ...outlineItems];
  } catch (error) {
    console.error('调用Deepseek API失败:', error);
    throw new Error('生成大纲失败，请检查API配置或网络连接');
  }
} 