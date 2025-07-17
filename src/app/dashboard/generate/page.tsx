"use client";

import { GeneratePageUI } from './components';
import { useGenerateLogic } from './logic';

/**
 * PPT大纲生成页面
 * 
 * 这个文件只作为UI和逻辑的连接点，保持简洁
 */
export default function GeneratePage() {
  // 使用逻辑处理器
  const logic = useGenerateLogic();

  // 渲染UI
  return <GeneratePageUI logic={logic} />;
}