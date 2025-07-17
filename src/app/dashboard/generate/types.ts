import { CardItem } from "@/components/DraggableCards";
import { PPTData } from '@/utils/slideTypes';

/**
 * 备用模板类别
 */
export type TemplateCategory = 'business' | 'technology' | 'education';

/**
 * 备用模板数据
 */
export interface FallbackTemplates {
  [key: string]: string[];
  business: string[];
  technology: string[];
  education: string[];
}

/**
 * Generate页面状态
 */
export interface PPTState {
  inputValue: string;
  cards: CardItem[];
  cardsCount: number;
  isGenerating: boolean;
  isGeneratingPPT: boolean;
  error: string | null;
  pptError: string | null;
  pptContent: string | null;
  structuredPPTData: PPTData | null;
  showPPTPreview: boolean;
  isUsingFallback: boolean;
  useStreamMode: boolean;
  currentSessionId: string | null;
  hasNetworkErrorState: boolean;
}

/**
 * Generate页面逻辑处理器接口
 */
export interface GeneratePageLogic {
  state: PPTState;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleClearInput: () => void;
  handleClearCards: () => void;
  handleGenerateClick: () => Promise<void>;
  handleGenerateFullPPT: () => Promise<void>;
  handleGeneratePPTContent: () => Promise<void>;
  handleExportOutline: () => void;
  handleExportPPTContent: () => void;
  handleClosePPTPreview: () => void;
  handleReopenPPTPreview: () => void;
  handleCardsChange: (updatedCards: CardItem[]) => void;
  handleRetryGeneration: (sessionId: string) => void;
  toggleStreamMode: () => void;
} 