"use client";

import { useCallback } from "react";
import { CardItem } from "@/components/DraggableCards";
import {
  generatePPTOutline,
  generatePPTOutlineStream,
} from "@/services/ai.service";
import { fallbackTemplates } from "../data";
import { PPTState } from "../types";

/**
 * 封装PPT大纲生成逻辑
 */
export function useOutlineGenerator(
  state: PPTState,
  setState: React.Dispatch<React.SetStateAction<PPTState>>
) {
  /**
   * 使用备用模板生成大纲
   */
  const generateFallbackOutline = useCallback(
    (prompt: string): string[] => {
      setState((prev: PPTState) => ({ ...prev, isUsingFallback: true }));
      let template = fallbackTemplates.business;
      if (
        prompt.toLowerCase().includes("技术") ||
        prompt.toLowerCase().includes("technology")
      ) {
        template = fallbackTemplates.technology;
      } else if (
        prompt.toLowerCase().includes("教育") ||
        prompt.toLowerCase().includes("education")
      ) {
        template = fallbackTemplates.education;
      }
      return [`${prompt}主题概述`, ...template];
    },
    [setState]
  );

  /**
   * 处理网络错误
   */
  const handleNetworkError = useCallback(
    (sessionId: string) => {
      setState((prev: PPTState) => ({
        ...prev,
        hasNetworkErrorState: true,
        currentSessionId: sessionId,
        isGenerating: false,
      }));
    },
    [setState]
  );

  /**
   * 处理流式生成时的每个大纲项
   */
  const handleStreamItem = useCallback(
    (item: string, isDone: boolean, isRecoveredItem?: boolean) => {
      if (!item && isDone) return;

      setState((prev: PPTState) => {
        let newCards = prev.cards;
        if (
          isRecoveredItem &&
          prev.cards.some((card: CardItem) => card.content === item)
        ) {
          return prev;
        }
        if (item) {
          newCards = [
            ...prev.cards,
            { id: `card-${Date.now()}-${prev.cards.length}`, content: item },
          ];
        }
        return { ...prev, cards: newCards, isGenerating: !isDone };
      });
    },
    [setState]
  );

  /**
   * 重试生成
   */
  const handleRetryGeneration = useCallback(
    (sessionId: string) => {
      if (!sessionId) return;
      setState((prev: PPTState) => ({
        ...prev,
        hasNetworkErrorState: false,
        isGenerating: true,
      }));

      generatePPTOutlineStream(
        state.inputValue || "",
        handleStreamItem,
        sessionId,
        handleNetworkError
      ).catch((err) => {
        console.error("重试生成失败:", err);
        setState((prev: PPTState) => ({
          ...prev,
          error: "重试失败，请稍后再试",
          isGenerating: false,
        }));
      });
    },
    [state.inputValue, handleStreamItem, handleNetworkError, setState]
  );

  /**
   * 处理生成按钮点击
   */
  const handleGenerateClick = useCallback(async () => {
    if (!state.inputValue.trim()) {
      setState((prev: PPTState) => ({ ...prev, error: "请输入PPT主题" }));
      return;
    }

    setState((prev: PPTState) => ({
      ...prev,
      isGenerating: true,
      error: null,
      isUsingFallback: false,
      hasNetworkErrorState: false,
      cards: [],
    }));

    try {
      if (state.useStreamMode) {
        const sessionId = await generatePPTOutlineStream(
          state.inputValue.trim(),
          handleStreamItem,
          undefined,
          handleNetworkError
        );
        setState((prev: PPTState) => ({ ...prev, currentSessionId: sessionId }));
      } else {
        const outlineItems = await generatePPTOutline(state.inputValue.trim());
        const newCards: CardItem[] = outlineItems.map((item, index) => ({
          id: `card-${Date.now()}-${index}`,
          content: item,
        }));
        setState((prev: PPTState) => ({
          ...prev,
          cards: newCards,
          isGenerating: false,
        }));
      }
    } catch (err) {
      console.error("生成大纲失败:", err);
      const fallbackOutline = generateFallbackOutline(state.inputValue.trim());
      const fallbackCards: CardItem[] = fallbackOutline.map((item, index) => ({
        id: `card-fallback-${Date.now()}-${index}`,
        content: item,
      }));
      setState((prev: PPTState) => ({
        ...prev,
        cards: fallbackCards,
        error: "AI服务暂不可用，已为您生成备用大纲",
        isGenerating: false,
      }));
    }
  }, [
    state.inputValue,
    state.useStreamMode,
    handleStreamItem,
    handleNetworkError,
    generateFallbackOutline,
    setState,
  ]);

  return {
    handleGenerateClick,
    handleRetryGeneration,
  };
} 