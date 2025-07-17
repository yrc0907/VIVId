"use client";

import React from 'react';
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import NetworkErrorAlert from "@/components/NetworkErrorAlert";
import PPTPreview from "@/components/PPTPreview";
import { Container, PageTitle } from '@/components/layout';
import { GeneratePageLogic } from '../types';
import { GenerateForm } from './GenerateForm';
import { OutlineContentSection, PPTContentSection, ErrorMessage } from './ContentSections';

/**
 * Generate页面UI组件
 */
export function GeneratePageUI({ logic }: { logic: GeneratePageLogic }) {
  const {
    state,
    handleInputChange,
    handleClearInput,
    handleClearCards,
    handleGenerateClick,
    handleGenerateFullPPT,
    handleGeneratePPTContent,
    handleExportOutline,
    handleExportPPTContent,
    handleClosePPTPreview,
    handleReopenPPTPreview,
    handleCardsChange,
    handleRetryGeneration,
    toggleStreamMode
  } = logic;

  return (
    <Container maxWidth="xl">
      {/* 返回按钮 */}
      <Link href="/dashboard">
        <Button variant="outline" className="mb-6 bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white">
          <ChevronLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
      </Link>

      {/* 页面标题 */}
      <PageTitle
        title="AI生成PPT大纲"
        description="输入主题，AI将为您生成专业的PPT大纲"
        className="text-center"
      />

      {/* 网络错误提示 */}
      {state.hasNetworkErrorState && state.currentSessionId && (
        <NetworkErrorAlert
          visible={true}
          sessionId={state.currentSessionId}
          onRetry={handleRetryGeneration}
        />
      )}

      {/* 生成表单 */}
      <div className="bg-gray-900/50 border border-gray-800 rounded-lg p-6 mb-6">
        <GenerateForm
          inputValue={state.inputValue}
          onInputChange={handleInputChange}
          onClearInput={handleClearInput}
          onClearCards={handleClearCards}
          onGenerate={handleGenerateClick}
          onToggleStreamMode={toggleStreamMode}
          isGenerating={state.isGenerating}
          useStreamMode={state.useStreamMode}
          cardsCount={state.cardsCount}
        />
      </div>

      {/* 错误提示 */}
      <ErrorMessage
        message={state.error}
        isWarning={state.isUsingFallback}
      />

      {/* 大纲内容区域 */}
      {state.cards.length > 0 && !state.showPPTPreview && (
        <OutlineContentSection
          cards={state.cards}
          onCardsChange={handleCardsChange}
          onExportOutline={handleExportOutline}
          onReopenPPTPreview={handleReopenPPTPreview}
          onGeneratePPTContent={handleGeneratePPTContent}
          onGenerateFullPPT={handleGenerateFullPPT}
          hasStructuredPPTData={!!state.structuredPPTData}
          isGeneratingPPT={state.isGeneratingPPT}
          pptContent={state.pptContent}
        />
      )}

      {/* PPT预览 */}
      {state.showPPTPreview && state.structuredPPTData && (
        <PPTPreview
          pptData={state.structuredPPTData}
          onClose={handleClosePPTPreview}
        />
      )}

      {/* PPT生成错误提示 */}
      <ErrorMessage message={state.pptError} />

      {/* 生成的PPT内容 */}
      {state.pptContent && !state.showPPTPreview && (
        <PPTContentSection
          pptContent={state.pptContent}
          onExportPPTContent={handleExportPPTContent}
        />
      )}
    </Container>
  );
} 