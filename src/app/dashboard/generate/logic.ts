"use client";

import { useState, useEffect, useCallback } from "react";
import { CardItem } from "@/components/DraggableCards";
import { PPTData } from '@/utils/slideTypes';
import { useOutlineGenerator } from "./hooks/useOutlineGenerator";
import { usePPTGenerator } from "./hooks/usePPTGenerator";
import { GeneratePageLogic, PPTState } from "./types";
import { downloadFile } from "@/utils/fileDownloader";

const initialState: PPTState = {
  inputValue: "",
  cards: [],
  cardsCount: 0,
  isGenerating: false,
  isGeneratingPPT: false,
  error: null,
  pptError: null,
  pptContent: null,
  structuredPPTData: null,
  showPPTPreview: false,
  isUsingFallback: false,
  useStreamMode: true,
  currentSessionId: null,
  hasNetworkErrorState: false,
};

/**
 * Generate页面逻辑处理器
 */
export function useGenerateLogic(): GeneratePageLogic {
  const [state, setState] = useState<PPTState>(initialState);

  // 加载保存的PPT数据
  useEffect(() => {
    try {
      const savedPPTData = localStorage.getItem('savedPPTData');
      if (savedPPTData) {
        const parsedData = JSON.parse(savedPPTData) as PPTData;
        setState(prev => ({ ...prev, structuredPPTData: parsedData }));
      }

      const savedOutlineCards = localStorage.getItem('savedOutlineCards');
      if (savedOutlineCards) {
        const parsedCards = JSON.parse(savedOutlineCards) as CardItem[];
        setState(prev => ({ ...prev, cards: parsedCards }));
      }
    } catch (err) {
      console.error("加载保存的PPT数据失败:", err);
    }
  }, []);

  // 更新卡片计数
  useEffect(() => {
    setState(prev => ({ ...prev, cardsCount: state.cards.length }));
  }, [state.cards]);

  // 大纲生成逻辑
  const { handleGenerateClick, handleRetryGeneration } = useOutlineGenerator(state, setState);

  // PPT生成逻辑
  const {
    isGeneratingPPT,
    pptError,
    handleGenerateFullPPT,
    handleGeneratePPTContent
  } = usePPTGenerator(state, setState);

  // 更新主状态中的PPT生成状态
  useEffect(() => {
    setState(prev => ({ ...prev, isGeneratingPPT, pptError }));
  }, [isGeneratingPPT, pptError]);

  // UI交互处理
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({ ...prev, inputValue: e.target.value }));
  };

  const handleClearInput = () => {
    setState(prev => ({ ...prev, inputValue: "" }));
  };

  const handleClearCards = () => {
    setState(prev => ({ ...prev, cards: [] }));
  };

  const handleCardsChange = (updatedCards: CardItem[]) => {
    setState(prev => ({ ...prev, cards: updatedCards }));
    localStorage.setItem('savedOutlineCards', JSON.stringify(updatedCards));
  };

  const toggleStreamMode = () => {
    setState(prev => ({ ...prev, useStreamMode: !state.useStreamMode }));
  };

  // PPT预览处理
  const handleClosePPTPreview = () => {
    setState(prev => ({ ...prev, showPPTPreview: false }));
  };

  const handleReopenPPTPreview = () => {
    if (state.structuredPPTData) {
      setState(prev => ({ ...prev, showPPTPreview: true }));
    }
  };

  // 导出功能
  const handleExportOutline = () => {
    const outline = state.cards.map(card => card.content).join('\n');
    downloadFile(outline, 'ppt-outline.txt', 'text/plain');
  };

  const handleExportPPTContent = () => {
    if (state.pptContent) {
      downloadFile(state.pptContent, 'ppt-content.md', 'text/markdown');
    }
  };

  return {
    state,
    handleInputChange,
    handleClearInput,
    handleClearCards,
    handleGenerateClick,
    handleRetryGeneration,
    handleGenerateFullPPT,
    handleGeneratePPTContent,
    handleExportOutline,
    handleExportPPTContent,
    handleClosePPTPreview,
    handleReopenPPTPreview,
    handleCardsChange,
    toggleStreamMode,
  };
} 