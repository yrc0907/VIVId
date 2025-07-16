"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw, Loader2, Download } from "lucide-react";
import Link from "next/link";
import DraggableCards, { CardItem } from "@/components/DraggableCards";
import CardCounter from "@/components/CardCounter";
import { generatePPTOutline } from "@/services/ai.service";

// 用于备用的示例大纲模板，当API调用失败时使用
const fallbackTemplates = {
  business: [
    "介绍公司背景与使命愿景",
    "市场分析与行业趋势",
    "产品或服务概述",
    "目标客户与价值主张",
    "营销策略与销售计划",
    "财务预测与投资回报",
    "团队介绍与组织架构",
    "未来发展计划与里程碑"
  ],
  technology: [
    "技术背景与发展历史",
    "核心技术原理介绍",
    "产品架构与技术栈",
    "技术创新点与竞争优势",
    "应用场景与案例展示",
    "技术路线图与未来演进",
    "团队技术能力与研发实力",
    "技术合作与生态建设"
  ],
  education: [
    "教育理念与学习目标",
    "课程内容概述",
    "教学方法与特色",
    "学习成果与评估标准",
    "实践活动与项目展示",
    "师资力量与教学资源",
    "学员反馈与成功案例",
    "后续学习路径与资源推荐"
  ]
};

export default function GeneratePage() {
  const [inputValue, setInputValue] = useState("");
  const [cards, setCards] = useState<CardItem[]>([]);
  const [cardsCount, setCardsCount] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // 使用备用模板生成大纲
  const generateFallbackOutline = (prompt: string): string[] => {
    // 基于输入提示选择模板
    let template = fallbackTemplates.business;
    if (prompt.toLowerCase().includes("技术") || prompt.toLowerCase().includes("technology")) {
      template = fallbackTemplates.technology;
    } else if (prompt.toLowerCase().includes("教育") || prompt.toLowerCase().includes("education")) {
      template = fallbackTemplates.education;
    }

    // 添加基于提示的自定义标题
    return [`${prompt}主题概述`, ...template];
  };

  // Handle generate button click
  const handleGenerateClick = async () => {
    if (!inputValue.trim()) {
      setError("请输入PPT主题");
      return;
    }

    setIsGenerating(true);
    setError(null);
    setIsUsingFallback(false);

    try {
      // 调用实际的AI服务生成大纲
      const outlineItems = await generatePPTOutline(inputValue.trim());

      // 将大纲转换为卡片
      const newCards: CardItem[] = outlineItems.map((item, index) => ({
        id: `card-${Date.now()}-${index}`,
        content: item
      }));

      setCards(newCards);
      setInputValue("");
    } catch (err) {
      console.error("生成大纲失败:", err);

      // 显示错误但使用备用模板
      setError("AI服务连接失败，使用备用模板生成大纲");
      setIsUsingFallback(true);

      // 使用备用模板
      const fallbackItems = generateFallbackOutline(inputValue.trim());
      const fallbackCards: CardItem[] = fallbackItems.map((item, index) => ({
        id: `card-${Date.now()}-${index}`,
        content: item
      }));

      setCards(fallbackCards);
      setInputValue("");
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle cards change (from DraggableCards component)
  const handleCardsChange = (updatedCards: CardItem[]) => {
    setCards(updatedCards);
  };

  // Update cardsCount whenever cards change
  useEffect(() => {
    setCardsCount(cards.length);
  }, [cards]);

  // Handle clear all cards
  const handleClearCards = () => {
    setCards([]);
  };

  // 处理导出大纲
  const handleExportOutline = () => {
    if (cards.length === 0) return;

    // 将卡片内容转换为文本
    const outlineText = cards.map((card, index) => `${index + 1}. ${card.content}`).join('\n\n');

    // 创建Blob对象
    const blob = new Blob([outlineText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // 创建下载链接并触发
    const a = document.createElement('a');
    a.href = url;
    a.download = `PPT大纲_${new Date().toLocaleDateString()}.txt`;
    document.body.appendChild(a);
    a.click();

    // 清理
    URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  return (
    <div className="flex-1 p-6 flex flex-col items-center justify-center bg-black">
      <div className="w-full max-w-3xl flex flex-col items-center text-center">
        <div className="w-full flex justify-start">
          <Link href="/dashboard">
            <Button variant="outline" className="mb-8 bg-gray-900 border-gray-700 text-gray-400 hover:bg-gray-800 hover:text-white">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m15 18-6-6 6-6" />
              </svg>
              Back
            </Button>
          </Link>
        </div>

        <h1 className="text-3xl md:text-5xl font-bold mb-3">
          AI生成 <span className="text-gradient bg-gradient-to-r from-red-500 to-fuchsia-500">PPT大纲</span>
        </h1>
        <p className="text-gray-400 mb-8 md:mb-10">输入主题，AI将为您生成专业的PPT大纲</p>

        <div className="w-full">
          <div className="relative mb-6">
            <Input
              className="bg-gray-900 border-gray-700 p-4 pl-4 pr-36 md:pr-48 w-full rounded-lg text-white h-14 md:h-16 text-base"
              placeholder="输入PPT主题，例如：公司年度报告、技术分享..."
              value={inputValue}
              onChange={handleInputChange}
              disabled={isGenerating}
            />
            <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-4">
              <CardCounter count={cardsCount} onClear={handleClearCards} />
              <Button
                className="bg-red-500 hover:bg-red-600 p-2 h-10 w-10"
                onClick={() => setInputValue("")}
                disabled={isGenerating || !inputValue}
                aria-label="Clear input"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {error && (
            <div className={`p-3 rounded-md mb-4 text-sm ${isUsingFallback ? 'bg-yellow-900/30 text-yellow-200' : 'bg-red-900/30 text-red-200'}`}>
              {error}
            </div>
          )}

          {cards.length > 0 && (
            <div className="my-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-white text-left">
                  PPT大纲 <span className="text-gray-400 text-sm font-normal">(可拖动调整顺序)</span>
                </h2>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-gray-300 hover:text-white hover:bg-gray-800 flex items-center gap-2"
                  onClick={handleExportOutline}
                >
                  <Download className="h-4 w-4" />
                  <span>导出</span>
                </Button>
              </div>
              <DraggableCards
                initialCards={cards}
                onCardsChange={handleCardsChange}
              />
            </div>
          )}

          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-gradient-to-r from-red-500 to-fuchsia-500 hover:from-red-600 hover:to-fuchsia-600 text-white font-bold py-3 px-6 w-full md:w-auto"
              onClick={handleGenerateClick}
              disabled={isGenerating || !inputValue.trim()}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  正在生成...
                </>
              ) : (
                "生成PPT大纲"
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}