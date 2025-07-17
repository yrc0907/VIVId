import axios from 'axios';
import { ItemGeneratedCallback, NetworkErrorCallback } from '@/types/ai.types';
import { DEFAULT_AI_CONFIG, OUTLINE_SYSTEM_PROMPT, validateApiConfig } from './config';
import {
  generateSessionId,
  getSessionState,
  createSession,
  updateSession,
  hasNetworkError
} from './session-manager';

/**
 * 使用Deepseek AI生成PPT大纲 (非流式)
 * @param prompt 用户输入的主题
 * @returns 生成的大纲要点数组
 */
export async function generatePPTOutline(prompt: string): Promise<string[]> {
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
            content: OUTLINE_SYSTEM_PROMPT
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
          'Authorization': `Bearer ${DEFAULT_AI_CONFIG.apiKey}`
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
  onItemGenerated: ItemGeneratedCallback,
  sessionId?: string,
  onNetworkError?: NetworkErrorCallback
): Promise<string> {
  // 如果没有提供会话ID，生成一个新的
  let currentSessionId = sessionId || generateSessionId(prompt);
  let existingSession = sessionId ? getSessionState(sessionId) : undefined;
  let retryCount = 0;
  const MAX_RETRIES = 3;
  const RETRY_DELAY = 2000; // 2秒后重试

  if (!validateApiConfig()) {
    throw new Error('未配置API密钥，请在环境变量中设置NEXT_PUBLIC_DEEPSEEK_API_KEY');
  }

  // 如果存在之前的会话，发送已生成的项目到UI
  if (existingSession) {
    // 如果存在网络错误，先重置
    if (existingSession.networkError) {
      updateSession(currentSessionId, { networkError: false });
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
    existingSession = createSession(currentSessionId, prompt);

    // 首先添加主题概述
    const overviewItem = `${prompt}主题概述`;
    updateSession(currentSessionId, {
      generatedItems: [overviewItem]
    });
    onItemGenerated(overviewItem, false);
  }

  try {
    // 确保会话状态有效
    if (!existingSession) {
      throw new Error('会话状态无效');
    }

    // 创建基于已生成内容的提示
    const session = getSessionState(currentSessionId);
    if (!session) {
      throw new Error('无法获取会话状态');
    }

    let systemPromptWithContext = OUTLINE_SYSTEM_PROMPT;
    if (session.generatedItems.length > 1) {
      // 如果已经生成了一些内容，添加到上下文中
      const generatedContent = session.generatedItems.slice(1).join('\n'); // 跳过主题概述
      systemPromptWithContext = `${OUTLINE_SYSTEM_PROMPT}\n\n你已经生成了以下内容，请继续生成更多要点:\n${generatedContent}`;
    }

    // 使用fetch进行流式请求
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
            content: systemPromptWithContext
          },
          {
            role: 'user',
            content: `请为"${prompt}"主题设计一个PPT大纲。${session.generatedItems.length > 1 ? '继续生成，不要重复已有内容。' : ''}`
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

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    // 更新会话的当前缓冲区
    updateSession(currentSessionId, { currentBuffer: '' });

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
              const currentSession = getSessionState(currentSessionId);
              if (!currentSession) continue;

              // 更新会话缓冲区
              let updatedBuffer = currentSession.currentBuffer + content;
              updateSession(currentSessionId, { currentBuffer: updatedBuffer });

              // 检查是否有完整的行
              if (updatedBuffer.includes('\n')) {
                const bufferLines = updatedBuffer.split('\n');
                // 保留最后一行作为新缓冲区
                const newBuffer = bufferLines.pop() || '';

                for (const bufferLine of bufferLines) {
                  const trimmedLine = bufferLine.trim();
                  if (trimmedLine) {
                    // 移除可能的编号或标点符号
                    const cleanLine = trimmedLine.replace(/^[\d\-\*\.\s]+/, '').trim();
                    if (cleanLine) {
                      // 更新会话中的生成项
                      const updatedItems = [...currentSession.generatedItems, cleanLine];
                      updateSession(currentSessionId, {
                        generatedItems: updatedItems,
                        currentBuffer: newBuffer
                      });
                      onItemGenerated(cleanLine, false);
                    }
                  }
                }
              }
            }
          }
        } catch (e) {
          console.error('解析SSE数据失败:', e);
        }
      }
    }

    // 处理剩余的缓冲区
    const currentSession = getSessionState(currentSessionId);
    if (currentSession && currentSession.currentBuffer.trim()) {
      const cleanLine = currentSession.currentBuffer.trim().replace(/^[\d\-\*\.\s]+/, '').trim();
      if (cleanLine) {
        const updatedItems = [...currentSession.generatedItems, cleanLine];
        updateSession(currentSessionId, {
          generatedItems: updatedItems,
          currentBuffer: '',
          isCompleted: true
        });
        onItemGenerated(cleanLine, false);
      }
    }

    // 标记为完成
    updateSession(currentSessionId, { isCompleted: true });
    onItemGenerated('', true); // 通知流结束
    return currentSessionId;

  } catch (error) {
    console.error('流式生成失败:', error);

    // 标记网络错误状态
    updateSession(currentSessionId, { networkError: true });

    if (onNetworkError) {
      onNetworkError(currentSessionId);
    }

    // 重试逻辑
    if (retryCount < MAX_RETRIES) {
      retryCount++;
      console.log(`${retryCount}秒后进行第${retryCount}次重试...`);

      return new Promise(resolve => {
        setTimeout(() => {
          resolve(generatePPTOutlineStream(prompt, onItemGenerated, currentSessionId, onNetworkError));
        }, RETRY_DELAY * retryCount);
      });
    }

    throw error;
  }
}

/**
 * 恢复之前中断的生成
 * @param sessionId 之前的会话ID
 * @param onItemGenerated 每生成一个大纲项时的回调
 * @param onNetworkError 网络错误回调
 * @returns 是否成功恢复生成
 */
export function resumeGeneration(
  sessionId: string,
  onItemGenerated: ItemGeneratedCallback,
  onNetworkError?: NetworkErrorCallback
): boolean {
  const session = getSessionState(sessionId);
  if (!session) {
    return false;
  }

  // 如果会话已完成，只重新发送已生成的项目
  if (session.isCompleted) {
    for (const item of session.generatedItems) {
      onItemGenerated(item, false, true);
    }
    onItemGenerated('', true); // 通知流结束
    return true;
  }

  // 否则，重新开始生成
  generatePPTOutlineStream(session.prompt, onItemGenerated, sessionId, onNetworkError)
    .catch(error => {
      console.error('恢复生成失败:', error);
      return false;
    });

  return true;
} 