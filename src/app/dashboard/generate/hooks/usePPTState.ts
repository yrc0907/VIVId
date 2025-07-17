"use client";

import { useState } from 'react';

/**
 * 管理生成页面的核心状态
 */
export function usePPTState() {
  const [inputValue, setInputValue] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [useStreamMode, setUseStreamMode] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [hasNetworkErrorState, setHasNetworkErrorState] = useState(false);

  return {
    inputValue, setInputValue,
    isGenerating, setIsGenerating,
    error, setError,
    isUsingFallback, setIsUsingFallback,
    useStreamMode, setUseStreamMode,
    currentSessionId, setCurrentSessionId,
    hasNetworkErrorState, setHasNetworkErrorState,
  };
} 