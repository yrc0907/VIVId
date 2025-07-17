/**
 * AI服务相关类型定义
 */

/**
 * 流式生成会话状态
 */
export interface StreamState {
  prompt: string;
  generatedItems: string[];
  currentBuffer: string;
  isCompleted: boolean;
  lastActiveTime: number;
  networkError?: boolean;
}

/**
 * 会话信息
 */
export interface SessionInfo {
  id: string;
  prompt: string;
  itemsCount: number;
  isCompleted: boolean;
}

/**
 * 生成回调函数类型
 */
export type ItemGeneratedCallback = (item: string, isDone: boolean, isRecoveredItem?: boolean) => void;
export type NetworkErrorCallback = (sessionId: string) => void;
export type ContentGeneratedCallback = (content: string) => void;
export type CompleteCallback = (fullContent: string) => void;

/**
 * AI模型配置
 */
export interface AIModelConfig {
  apiKey: string;
  apiUrl: string;
  model: string;
} 