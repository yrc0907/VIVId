"use client";

import React from 'react';
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import DraggableCards from "@/components/DraggableCards";
import { CardItem } from "@/components/DraggableCards";
import { PPTActionButtons } from './PPTActionButtons';

/**
 * PPT大纲内容区域组件
 */
export function OutlineContentSection({
  cards,
  onCardsChange,
  onExportOutline,
  onReopenPPTPreview,
  onGeneratePPTContent,
  onGenerateFullPPT,
  hasStructuredPPTData,
  isGeneratingPPT,
  pptContent,
}: {
  cards: CardItem[];
  onCardsChange: (updatedCards: CardItem[]) => void;
  onExportOutline: () => void;
  onReopenPPTPreview: () => void;
  onGeneratePPTContent: () => Promise<void>;
  onGenerateFullPPT: () => Promise<void>;
  hasStructuredPPTData: boolean;
  isGeneratingPPT: boolean;
  pptContent: string | null;
}) {
  if (cards.length === 0) return null;

  return (
    <div className="mb-8 bg-gray-900/50 border border-gray-800 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-white">PPT大纲</h2>
          <p className="text-gray-400 text-sm">可拖动调整顺序</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <PPTActionButtons
            handleExportOutline={onExportOutline}
            handleReopenPPTPreview={onReopenPPTPreview}
            handleGeneratePPTContent={onGeneratePPTContent}
            handleGenerateFullPPT={onGenerateFullPPT}
            hasStructuredPPTData={hasStructuredPPTData}
            isGeneratingPPT={isGeneratingPPT}
            pptContent={pptContent}
          />
        </div>
      </div>

      <DraggableCards
        initialCards={cards}
        onCardsChange={onCardsChange}
      />
    </div>
  );
}

/**
 * PPT内容展示组件
 */
export function PPTContentSection({
  pptContent,
  onExportPPTContent,
}: {
  pptContent: string;
  onExportPPTContent: () => void;
}) {
  if (!pptContent) return null;

  return (
    <div className="mb-8 bg-gray-900/50 border border-gray-800 rounded-lg p-6">
      <div className="flex flex-col sm:flex-row sm:justify-between items-start sm:items-center gap-3 mb-4">
        <h2 className="text-xl font-bold text-white">生成的PPT内容</h2>
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:text-white hover:bg-gray-800 flex items-center gap-2"
          onClick={onExportPPTContent}
        >
          <Download className="h-4 w-4" />
          <span>导出PPT内容</span>
        </Button>
      </div>
      <div className="overflow-auto max-h-96 whitespace-pre-wrap text-sm">
        {pptContent}
      </div>
    </div>
  );
}

/**
 * 错误提示组件
 */
export function ErrorMessage({
  message,
  isWarning = false
}: {
  message: string | null;
  isWarning?: boolean;
}) {
  if (!message) return null;

  return (
    <div className={`p-3 rounded-md mb-4 text-sm ${isWarning ? 'bg-yellow-900/30 text-yellow-200' : 'bg-red-900/30 text-red-200'}`}>
      {message}
    </div>
  );
} 