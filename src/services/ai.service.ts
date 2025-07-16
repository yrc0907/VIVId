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
 * 使用Deepseek AI生成PPT大纲 (非流式)
 * @param prompt 用户输入的主题
 * @returns 生成的大纲要点数组
 */
export async function generatePPTOutline(prompt: string): Promise<string[]> {
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

    // 处理返回结果
    const content = response.data.choices[0].message.content;

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

/**
 * 使用Deepseek AI流式生成PPT大纲
 * @param prompt 用户输入的主题
 * @param onItemGenerated 每生成一个大纲项时的回调
 */
export async function generatePPTOutlineStream(
  prompt: string,
  onItemGenerated: (item: string, isDone: boolean) => void
): Promise<void> {
  try {
    if (!API_KEY) {
      throw new Error('未配置API密钥，请在环境变量中设置NEXT_PUBLIC_DEEPSEEK_API_KEY');
    }

    // 使用fetch进行流式请求
    const response = await fetch(`${API_URL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify({
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
        max_tokens: 800,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('响应体为空');
    }

    // 首先添加主题概述
    onItemGenerated(`${prompt}主题概述`, false);

    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let currentItem = '';
    const itemPattern = /^(?:\d+\.\s*|\*\s*|-\s*|\s*)([^\n]+)/;

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value);
      buffer += chunk;

      // 解析响应中的事件
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data:') && !line.includes('[DONE]')) {
          try {
            const data = JSON.parse(line.substring(5));
            const content = data.choices[0]?.delta?.content || '';

            currentItem += content;

            // 检查是否是完整的行（包含换行符）
            if (content.includes('\n')) {
              const items = currentItem.split('\n');
              currentItem = items.pop() || ''; // 最后一个可能不完整

              for (const item of items) {
                const trimmed = item.trim();
                if (trimmed) {
                  const match = trimmed.match(itemPattern);
                  if (match && match[1]) {
                    onItemGenerated(match[1].trim(), false);
                  }
                }
              }
            }
          } catch (e) {
            console.warn('解析事件数据失败:', e);
          }
        } else if (line.includes('[DONE]')) {
          // 检查是否还有未处理的项
          if (currentItem.trim()) {
            const match = currentItem.trim().match(itemPattern);
            if (match && match[1]) {
              onItemGenerated(match[1].trim(), true); // 最后一项
            }
          } else {
            onItemGenerated('', true); // 通知流结束
          }
        }
      }
    }
  } catch (error) {
    console.error('流式调用Deepseek API失败:', error);
    throw error;
  }
} 