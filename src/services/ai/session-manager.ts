import { StreamState, SessionInfo } from '@/types/ai.types';

/**
 * 存储所有生成会话的全局状态
 */
let streamSessions: Map<string, StreamState> = new Map();

/**
 * 生成会话ID
 * @param prompt 用户输入的主题
 * @returns 生成的会话ID
 */
export function generateSessionId(prompt: string): string {
  return `session_${prompt.replace(/\s+/g, '_').substring(0, 20)}_${Date.now()}`;
}

/**
 * 获取会话状态
 * @param sessionId 会话ID
 * @returns 会话状态或undefined
 */
export function getSessionState(sessionId: string): StreamState | undefined {
  return streamSessions.get(sessionId);
}

/**
 * 创建新会话
 * @param sessionId 会话ID
 * @param prompt 用户提示词
 * @returns 新创建的会话状态
 */
export function createSession(sessionId: string, prompt: string): StreamState {
  const session: StreamState = {
    prompt,
    generatedItems: [],
    currentBuffer: '',
    isCompleted: false,
    lastActiveTime: Date.now()
  };
  streamSessions.set(sessionId, session);
  return session;
}

/**
 * 更新会话状态
 * @param sessionId 会话ID
 * @param updates 部分会话状态更新
 * @returns 更新后的会话状态
 */
export function updateSession(sessionId: string, updates: Partial<StreamState>): StreamState | undefined {
  const session = streamSessions.get(sessionId);
  if (!session) return undefined;

  const updatedSession = { ...session, ...updates, lastActiveTime: Date.now() };
  streamSessions.set(sessionId, updatedSession);
  return updatedSession;
}

/**
 * 检查会话是否存在网络错误
 * @param sessionId 会话ID
 * @returns 是否存在网络错误
 */
export function hasNetworkError(sessionId: string): boolean {
  const session = streamSessions.get(sessionId);
  return session ? !!session.networkError : false;
}

/**
 * 清理过期的会话
 * 默认清理超过1小时未活动的会话
 */
export function cleanupOldSessions(): void {
  const MAX_SESSION_AGE = 60 * 60 * 1000; // 1小时
  const now = Date.now();

  for (const [id, session] of streamSessions.entries()) {
    if (now - session.lastActiveTime > MAX_SESSION_AGE) {
      streamSessions.delete(id);
    }
  }
}

/**
 * 获取所有活跃会话
 * @returns 活跃会话信息数组
 */
export function getActiveSessions(): SessionInfo[] {
  return Array.from(streamSessions.entries()).map(([id, session]) => ({
    id,
    prompt: session.prompt,
    itemsCount: session.generatedItems.length,
    isCompleted: session.isCompleted
  }));
} 