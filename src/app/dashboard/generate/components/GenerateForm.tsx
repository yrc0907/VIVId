"use client";

import React from 'react';
import { RefreshCw, Loader2, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CardCounter from "@/components/CardCounter";

/**
 * 生成表单组件
 */
export function GenerateForm({
  inputValue,
  onInputChange,
  onClearInput,
  onClearCards,
  onGenerate,
  onToggleStreamMode,
  isGenerating,
  useStreamMode,
  cardsCount,
}: {
  inputValue: string;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onClearInput: () => void;
  onClearCards: () => void;
  onGenerate: () => Promise<void>;
  onToggleStreamMode: () => void;
  isGenerating: boolean;
  useStreamMode: boolean;
  cardsCount: number;
}) {
  return (
    <>
      {/* 输入区域 */}
      <div className="mb-6">
        <div className="relative">
          <Input
            className="bg-gray-900 border-gray-700 p-4 pl-4 pr-36 md:pr-48 w-full rounded-lg text-white h-14 md:h-16 text-base"
            placeholder="输入PPT主题，例如：公司年度报告、技术分享..."
            value={inputValue}
            onChange={onInputChange}
            disabled={isGenerating}
          />
          <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-4">
            <CardCounter count={cardsCount} onClear={onClearCards} />
            <Button
              className="bg-red-500 hover:bg-red-600 p-2 h-10 w-10"
              onClick={onClearInput}
              disabled={isGenerating || !inputValue}
              aria-label="清空输入"
            >
              <RefreshCw className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* 生成按钮区域 */}
      <div className="flex flex-col md:flex-row gap-4 justify-center items-center mt-8">
        <Button
          size="lg"
          className="bg-gradient-to-r from-red-500 to-fuchsia-500 hover:from-red-600 hover:to-fuchsia-600 text-white font-bold py-3 px-6 w-full md:w-auto"
          onClick={onGenerate}
          disabled={isGenerating || !inputValue.trim()}
        >
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              {useStreamMode ? "正在生成中..." : "正在生成..."}
            </>
          ) : (
            "生成PPT大纲"
          )}
        </Button>

        <Button
          type="button"
          variant={useStreamMode ? "default" : "outline"}
          size="sm"
          className={`flex items-center gap-2 px-3 transition-all ${useStreamMode
            ? "bg-gradient-to-r from-red-600/80 to-fuchsia-600/80 text-white border-none"
            : "border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
            }`}
          onClick={onToggleStreamMode}
          disabled={isGenerating}
        >
          <Zap className={`h-4 w-4 ${useStreamMode ? "text-yellow-300" : "text-gray-400"}`} />
          <span className="text-sm">流式生成</span>
        </Button>
      </div>

      {/* 说明文本 */}
      {useStreamMode && (
        <div className="mt-4 text-center">
          <p className="text-gray-500 text-xs">
            流式生成模式会实时显示生成结果，带来更好的交互体验
          </p>
        </div>
      )}
    </>
  );
} 