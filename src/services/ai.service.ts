import axios from 'axios';

// 需要在环境变量中配置
const API_KEY = process.env.NEXT_PUBLIC_DEEPSEEK_API_KEY || '';
const API_URL = process.env.NEXT_PUBLIC_DEEPSEEK_API_URL || 'https://api.deepseek.com/v1';

// PPT大纲生成提示词模板
const SYSTEM_PROMPT = `你是一位专业的PPT大纲规划专家，擅长为各种主题设计结构化、逻辑清晰的PPT大纲。
请根据用户提供的主题，创建一个包含3个要点的PPT大纲。
要点应该涵盖该主题的关键方面，并按照合理的顺序排列，确保逻辑连贯、层次分明。
每个要点应该简洁明了，不超过15个字，适合作为PPT的章节标题。
不要使用编号，只需返回要点列表，每行一个要点。`;

// 用于存储生成会话的状态
interface StreamState {
  prompt: string;
  generatedItems: string[];
  currentBuffer: string;
  isCompleted: boolean;
  lastActiveTime: number;
  networkError?: boolean; // 添加网络错误标记
}

// 全局状态存储
let streamSessions: Map<string, StreamState> = new Map();

/**
 * 生成会话ID
 * @param prompt 用户输入的主题
 */
function generateSessionId(prompt: string): string {
  return `session_${prompt.replace(/\s+/g, '_').substring(0, 20)}_${Date.now()}`;
}

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
 * @param sessionId 会话ID，用于恢复生成
 * @param onNetworkError 网络错误回调
 * @returns 返回会话ID，可用于恢复生成
 */
export async function generatePPTOutlineStream(
  prompt: string,
  onItemGenerated: (item: string, isDone: boolean, isRecoveredItem?: boolean) => void,
  sessionId?: string,
  onNetworkError?: (sessionId: string) => void
): Promise<string> {
  // 如果没有提供会话ID，生成一个新的
  let currentSessionId = sessionId || generateSessionId(prompt);
  let existingSession = sessionId ? streamSessions.get(sessionId) : undefined;
  let retryCount = 0;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2秒后重试

  try {
    if (!API_KEY) {
      throw new Error('未配置API密钥，请在环境变量中设置NEXT_PUBLIC_DEEPSEEK_API_KEY');
    }

    // 如果存在之前的会话，发送已生成的项目到UI
    if (existingSession) {
      // 如果存在网络错误，先重置
      if (existingSession.networkError) {
        existingSession.networkError = false;
      }

      // 恢复之前生成的项目
      for (const item of existingSession.generatedItems) {
        onItemGenerated(item, false, true); // 标记为恢复的项目
      }

      // 如果之前的会话已完成，直接返回
      if (existingSession.isCompleted) {
        onItemGenerated('', true); // 通知流结束
        return currentSessionId;
      }

      console.log('继续之前的生成会话:', currentSessionId);
    } else {
      // 创建新会话
      existingSession = {
        prompt,
        generatedItems: [],
        currentBuffer: '',
        isCompleted: false,
        lastActiveTime: Date.now()
      };
      streamSessions.set(currentSessionId, existingSession);

      // 首先添加主题概述
      const overviewItem = `${prompt}主题概述`;
      existingSession.generatedItems.push(overviewItem);
      onItemGenerated(overviewItem, false);
    }

    // 重试机制
    const executeWithRetry = async (): Promise<void> => {
      try {
        // 确保existingSession存在
        if (!existingSession) {
          existingSession = {
            prompt,
            generatedItems: [],
            currentBuffer: '',
            isCompleted: false,
            lastActiveTime: Date.now()
          };
          streamSessions.set(currentSessionId, existingSession);
        }

        // 创建基于已生成内容的提示
        let systemPromptWithContext = SYSTEM_PROMPT;
        if (existingSession && existingSession.generatedItems.length > 1) {
          // 如果已经生成了一些内容，添加到上下文中
          const generatedContent = existingSession.generatedItems.slice(1).join('\n'); // 跳过主题概述
          systemPromptWithContext = `${SYSTEM_PROMPT}\n\n你已经生成了以下内容，请继续生成更多要点:\n${generatedContent}`;
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
                content: systemPromptWithContext
              },
              {
                role: 'user',
                content: `请为"${prompt}"主题设计一个PPT大纲。${existingSession.generatedItems.length > 1 ? '继续生成，不要重复已有内容。' : ''}`
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

        // 处理流式响应
        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = existingSession.currentBuffer || '';
        let currentItem = '';
        const itemPattern = /^(?:\d+\.\s*|\*\s*|-\s*|\s*)([^\n]+)/;

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          buffer += chunk;

          // 更新会话状态
          existingSession.lastActiveTime = Date.now();
          existingSession.currentBuffer = buffer;

          // 解析响应中的事件
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';
          existingSession.currentBuffer = buffer;

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
                        const newItem = match[1].trim();
                        // 检查是否已存在，避免重复
                        if (!existingSession.generatedItems.includes(newItem)) {
                          existingSession.generatedItems.push(newItem);
                          onItemGenerated(newItem, false);
                        }
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
                  const lastItem = match[1].trim();
                  // 检查是否已存在，避免重复
                  if (!existingSession.generatedItems.includes(lastItem)) {
                    existingSession.generatedItems.push(lastItem);
                    onItemGenerated(lastItem, true); // 最后一项
                  } else {
                    onItemGenerated('', true); // 通知流结束
                  }
                }
              } else {
                onItemGenerated('', true); // 通知流结束
              }

              // 标记会话完成
              existingSession.isCompleted = true;
              existingSession.currentBuffer = '';

              // 清理超过1小时的会话
              cleanupOldSessions();
            }
          }
        }
      } catch (error) {
        console.error(`流式调用失败 (尝试 ${retryCount + 1}/${MAX_RETRIES}):`, error);

        // 更新会话状态
        if (existingSession) {
          existingSession.lastActiveTime = Date.now();
        }

        // 如果尝试次数未达到最大值，则重试
        if (retryCount < MAX_RETRIES) {
          retryCount++;
          console.log(`${RETRY_DELAY}毫秒后重试...`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return executeWithRetry();
        } else {
          // 标记为网络错误
          if (existingSession) {
            existingSession.networkError = true;

            // 调用网络错误回调
            if (onNetworkError) {
              onNetworkError(currentSessionId);
            }
          }
          throw new Error('多次重试后仍然失败，请检查网络连接');
        }
      }
    };

    // 执行生成（带重试）
    await executeWithRetry();

    return currentSessionId;
  } catch (error) {
    console.error('流式调用Deepseek API失败:', error);
    throw error;
  }
}

/**
 * 检查会话是否有网络错误
 * @param sessionId 会话ID
 * @returns 如果有网络错误则返回true，否则返回false
 */
export function hasNetworkError(sessionId: string): boolean {
  const session = streamSessions.get(sessionId);
  return session ? !!session.networkError : false;
}

/**
 * 继续之前中断的生成会话
 * @param sessionId 会话ID
 * @param onItemGenerated 回调函数
 * @param onNetworkError 网络错误回调
 * @returns 如果会话存在则返回true，否则返回false
 */
export function resumeGeneration(
  sessionId: string,
  onItemGenerated: (item: string, isDone: boolean, isRecoveredItem?: boolean) => void,
  onNetworkError?: (sessionId: string) => void
): boolean {
  const session = streamSessions.get(sessionId);

  if (!session) {
    return false;
  }

  // 如果会话已完成，只发送已有项目
  if (session.isCompleted) {
    for (const item of session.generatedItems) {
      onItemGenerated(item, false, true);
    }
    onItemGenerated('', true); // 通知流结束
    return true;
  }

  // 如果会话未完成，尝试继续生成
  try {
    generatePPTOutlineStream(session.prompt, onItemGenerated, sessionId, onNetworkError)
      .catch(err => console.error('恢复生成失败:', err));
    return true;
  } catch (error) {
    console.error('恢复生成会话失败:', error);
    return false;
  }
}

/**
 * 清理旧会话
 */
function cleanupOldSessions(): void {
  const now = Date.now();
  const ONE_HOUR = 60 * 60 * 1000;

  for (const [sessionId, session] of streamSessions.entries()) {
    if (now - session.lastActiveTime > ONE_HOUR) {
      streamSessions.delete(sessionId);
    }
  }
}

/**
 * 获取所有活跃会话
 * @returns 所有活跃会话列表
 */
export function getActiveSessions(): { id: string, prompt: string, itemsCount: number, isCompleted: boolean }[] {
  return Array.from(streamSessions.entries())
    .map(([id, session]) => ({
      id,
      prompt: session.prompt,
      itemsCount: session.generatedItems.length,
      isCompleted: session.isCompleted
    }));
}

/**
 * 将大纲转换为PPT内容
 * @param outlineItems 大纲项目列表
 * @returns 返回一个下载链接
 */
export async function generatePPTFromOutline(outlineItems: string[]): Promise<string> {
  try {
    if (!API_KEY) {
      throw new Error('未配置API密钥，请在环境变量中设置NEXT_PUBLIC_DEEPSEEK_API_KEY');
    }

    // 构建提示词
    const outlineText = outlineItems.join('\n');
    const prompt = `请基于以下大纲创建一个完整的PPT内容，包含每个大纲项的详细内容和适合的图表描述：\n\n${outlineText}\n\n对于每个大纲项，请提供具体内容，可以用markdown格式表示。`;

    const response = await axios.post(
      `${API_URL}/chat/completions`,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的PPT内容撰写专家，擅长将大纲扩展为详细的PPT内容。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
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

    // 这里只是返回生成的内容，实际应用中可能需要将内容转换为PPT格式或提供下载功能
    return content;
  } catch (error) {
    console.error('生成PPT内容失败:', error);
    throw new Error('生成PPT内容失败，请检查API配置或网络连接');
  }
}

/**
 * 流式生成PPT内容
 * @param outlineItems 大纲项目列表
 * @param onContentGenerated 内容生成回调
 * @param onComplete 完成回调
 * @param onNetworkError 网络错误回调
 */
export async function generatePPTFromOutlineStream(
  outlineItems: string[],
  onContentGenerated: (content: string) => void,
  onComplete: (fullContent: string) => void,
  onNetworkError?: () => void
): Promise<void> {
  try {
    if (!API_KEY) {
      throw new Error('未配置API密钥，请在环境变量中设置NEXT_PUBLIC_DEEPSEEK_API_KEY');
    }

    // 构建提示词
    const outlineText = outlineItems.join('\n');
    const prompt = `请基于以下大纲创建一个完整的PPT内容，包含每个大纲项的详细内容和适合的图表描述：\n\n${outlineText}\n\n对于每个大纲项，请提供具体内容，可以用markdown格式表示。`;

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
            content: '你是一位专业的PPT内容撰写专家，擅长将大纲扩展为详细的PPT内容。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: true
      })
    });

    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status} ${response.statusText}`);
    }

    if (!response.body) {
      throw new Error('响应体为空');
    }

    // 处理流式响应
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let fullContent = '';

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

            if (content) {
              fullContent += content;
              onContentGenerated(content);
            }
          } catch (e) {
            console.warn('解析事件数据失败:', e);
          }
        } else if (line.includes('[DONE]')) {
          onComplete(fullContent);
        }
      }
    }
  } catch (error) {
    console.error('流式生成PPT内容失败:', error);
    if (onNetworkError) {
      onNetworkError();
    }
    throw new Error('生成PPT内容失败，请检查API配置或网络连接');
  }
}

/**
 * 生成结构化的PPT数据
 * @param outlineItems 大纲项目列表
 * @returns 结构化的PPT数据，包含每页的布局、内容和图片描述
 */
export async function generateStructuredPPT(outlineItems: string[]): Promise<any> {
  try {
    if (!API_KEY) {
      throw new Error('未配置API密钥，请在环境变量中设置NEXT_PUBLIC_DEEPSEEK_API_KEY');
    }

    // 构建提示词
    const outlineText = outlineItems.join('\n');
    const prompt = `请为以下大纲创建一个完整的PPT结构，包含每个幻灯片的：
    1. 布局类型(标题页/内容页/图表页/对比页/列表页等)
    2. 标题文字
    3. 主要内容(文本内容，不超过100字/页)
    4. 图片描述(详细描述应在幻灯片中使用的图片)
    
    以JSON格式返回，结构如下:
    {
      "slides": [
        {
          "layout": "标题页",
          "title": "标题文本",
          "content": "副标题或简短描述",
          "imageDescription": "封面图片描述，应具体描述图片内容，以便后续生成"
        },
        // 更多幻灯片...
      ]
    }
    
    请确保JSON格式正确无误，可以直接被解析。每个幻灯片的图片描述应详细具体，以便能生成对应的图片。
    
    大纲内容：${outlineText}`;

    const response = await axios.post(
      `${API_URL}/chat/completions`,
      {
        model: 'deepseek-chat',
        messages: [
          {
            role: 'system',
            content: '你是一位专业的PPT设计专家，擅长根据大纲创建结构良好、布局合理的PPT内容。返回的内容必须是有效的JSON格式。'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7,
        max_tokens: 3000
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

    // 尝试解析JSON
    try {
      // 可能需要清理输出中的markdown代码块标记
      const jsonStr = content.replace(/```json|```/g, '').trim();
      const pptData = JSON.parse(jsonStr);
      return pptData;
    } catch (parseError) {
      console.error('解析PPT数据失败:', parseError);
      throw new Error('生成的PPT数据格式不正确，请重试');
    }
  } catch (error) {
    console.error('生成结构化PPT数据失败:', error);
    throw new Error('生成PPT数据失败，请检查API配置或网络连接');
  }
}

/**
 * 为PPT生成图片
 * @param description 图片描述
 * @returns 图片数据URL
 */
export async function generateImageForPPT(description: string): Promise<string> {
  try {
    console.log('正在通过代理调用豆包API生成图片, 描述:', description);

    // 使用本地API代理来避免CORS问题
    const response = await axios.post(
      '/api/image-proxy',  // 使用App Router格式的API代理路由
      {
        prompt: description,
        size: '1024x1024'    // 图片尺寸
      },
      {
        headers: {
          'Content-Type': 'application/json'
        },
        timeout: 60000  // 增加超时时间到60秒
      }
    );

    console.log('豆包API响应:', JSON.stringify(response.data));

    // 解析返回的图片URL - 根据官方文档中的响应结构
    if (response.data && response.data.data && response.data.data.length > 0) {
      return response.data.data[0].url; // 返回生成的图片URL
    }

    throw new Error('API返回的图片数据格式不符合预期');
  } catch (error) {
    console.error('调用豆包API生成图片失败:', error);

    // 发生错误时返回占位图作为备选
    const placeholderWidth = 800;
    const placeholderHeight = 600;
    const placeholderText = encodeURIComponent('图片生成失败: ' + (error as Error).message);
    return `https://via.placeholder.com/${placeholderWidth}x${placeholderHeight}?text=${placeholderText}`;
  }
} 