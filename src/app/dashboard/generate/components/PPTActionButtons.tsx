"use client";

import React from 'react';
import { Download, Loader2, FileText, Presentation, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * PPT生成功能按钮组件
 */
export function PPTActionButtons({
  handleExportOutline,
  handleReopenPPTPreview,
  handleGeneratePPTContent,
  handleGenerateFullPPT,
  hasStructuredPPTData,
  isGeneratingPPT,
  pptContent
}: {
  handleExportOutline: () => void;
  handleReopenPPTPreview: () => void;
  handleGeneratePPTContent: () => Promise<void>;
  handleGenerateFullPPT: () => Promise<void>;
  hasStructuredPPTData: boolean;
  isGeneratingPPT: boolean;
  pptContent: string | null;
}) {
  return (
    <>
      <Button
        variant="ghost"
        size="sm"
        className="text-gray-300 hover:text-white hover:bg-gray-800 flex items-center gap-2"
        onClick={handleExportOutline}
      >
        <Download className="h-4 w-4" />
        <span>导出大纲</span>
      </Button>

      {hasStructuredPPTData && (
        <Button
          variant="ghost"
          size="sm"
          className="text-gray-300 hover:text-white hover:bg-gray-800 flex items-center gap-2"
          onClick={handleReopenPPTPreview}
        >
          <Eye className="h-4 w-4" />
          <span>预览PPT</span>
        </Button>
      )}

      <Button
        variant="outline"
        size="sm"
        className="bg-gray-800 text-white hover:bg-gray-700 border-gray-700 flex items-center gap-2"
        onClick={handleGeneratePPTContent}
        disabled={isGeneratingPPT}
      >
        {isGeneratingPPT && !pptContent ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>生成中...</span>
          </>
        ) : (
          <>
            <FileText className="h-4 w-4" />
            <span>生成PPT内容</span>
          </>
        )}
      </Button>

      <Button
        variant="outline"
        size="sm"
        className="bg-blue-600 text-white hover:bg-blue-700 border-blue-700 flex items-center gap-2"
        onClick={handleGenerateFullPPT}
        disabled={isGeneratingPPT}
      >
        {isGeneratingPPT && !pptContent ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>生成中...</span>
          </>
        ) : (
          <>
            <Presentation className="h-4 w-4" />
            <span>生成完整PPT</span>
          </>
        )}
      </Button>
    </>
  );
}
