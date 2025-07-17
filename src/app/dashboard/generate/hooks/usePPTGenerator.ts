"use client";

import { useState, useCallback } from "react";
import {
  generatePPTFromOutline,
  generateStructuredPPT,
} from "@/services/ai.service";
import { PPTState } from "../types";
import { PPTData } from "@/utils/slideTypes";

/**
 * 封装PPT内容生成逻辑
 */
export function usePPTGenerator(
  state: PPTState,
  setState: React.Dispatch<React.SetStateAction<PPTState>>
) {
  const [isGeneratingPPT, setIsGeneratingPPT] = useState(false);
  const [pptError, setPptError] = useState<string | null>(null);

  /**
   * 生成完整PPT（结构化数据）
   */
  const handleGenerateFullPPT = useCallback(async () => {
    const outline = state.cards.map((card) => card.content);
    if (outline.length === 0) {
      setPptError("大纲为空，无法生成PPT");
      return;
    }

    setIsGeneratingPPT(true);
    setPptError(null);

    try {
      const result = await generateStructuredPPT(
        outline
      );
      setState((prev: PPTState) => ({ ...prev, structuredPPTData: result, showPPTPreview: true }));
      localStorage.setItem("savedPPTData", JSON.stringify(result));
    } catch (err) {
      console.error("生成结构化PPT失败:", err);
      setPptError("生成PPT失败，请稍后重试");
    } finally {
      setIsGeneratingPPT(false);
    }
  }, [state.cards, state.inputValue, setState]);

  /**
   * 生成PPT文本内容
   */
  const handleGeneratePPTContent = useCallback(async () => {
    const outline = state.cards.map((card) => card.content);
    if (outline.length === 0) {
      setPptError("大纲为空，无法生成PPT内容");
      return;
    }

    setIsGeneratingPPT(true);
    setPptError(null);

    try {
      const result = await generatePPTFromOutline(
        outline
      );
      setState((prev: PPTState) => ({ ...prev, pptContent: result }));
    } catch (err) {
      console.error("生成PPT内容失败:", err);
      setPptError("生成PPT内容失败，请稍后重试");
    } finally {
      setIsGeneratingPPT(false);
    }
  }, [state.cards, state.inputValue, setState]);

  return {
    isGeneratingPPT,
    pptError,
    handleGenerateFullPPT,
    handleGeneratePPTContent,
  };
} 