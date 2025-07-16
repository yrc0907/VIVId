"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RefreshCw } from "lucide-react";
import Link from "next/link";
import DraggableCards, { CardItem } from "@/components/DraggableCards";
import CardCounter from "@/components/CardCounter";

// Mock data for initial cards
const MOCK_CARDS = [
  {
    id: "1",
    content: "Define what a SaaS company is and explain its growing relevance in the modern business landscape."
  },
  {
    id: "2",
    content: "Highlight the low barriers to entry, including minimal upfront costs and the availability of cloud infrastructure."
  },
  {
    id: "3",
    content: "Discuss the abundance of tools and platforms that simplify product development, deployment, and scaling for SaaS businesses."
  },
  {
    id: "4",
    content: "Analyze potential challenges and strategies to overcome them in the competitive SaaS market."
  }
];

export default function GeneratePage() {
  const [inputValue, setInputValue] = useState("");
  const [cards, setCards] = useState<CardItem[]>(MOCK_CARDS);
  const [cardsCount, setCardsCount] = useState(MOCK_CARDS.length);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Handle generate button click
  const handleGenerateClick = () => {
    // For demo, simply add the current input as a new card
    if (inputValue.trim()) {
      const newCard = {
        id: `card-${Date.now()}`,
        content: inputValue.trim()
      };

      setCards(prevCards => [...prevCards, newCard]);
      setInputValue("");
    } else {
      // If input is empty, use mock data for demonstration
      setCards(MOCK_CARDS);
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
          Generate with <span className="text-gradient bg-gradient-to-r from-red-500 to-fuchsia-500">Creative AI</span>
        </h1>
        <p className="text-gray-400 mb-8 md:mb-10">What would you like to create today?</p>

        <div className="w-full">
          <div className="relative mb-6">
            <Input
              className="bg-gray-900 border-gray-700 p-4 pl-4 pr-36 md:pr-48 w-full rounded-lg text-white h-14 md:h-16 text-base"
              placeholder="Enter Prompt and add to the cards..."
              value={inputValue}
              onChange={handleInputChange}
            />
            <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-4">
              <CardCounter count={cardsCount} onClear={handleClearCards} />
              <Button
                className="bg-red-500 hover:bg-red-600 p-2 h-10 w-10"
                onClick={() => setInputValue("")}
                aria-label="Clear input"
              >
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {cards.length > 0 && (
            <div className="my-8">
              <DraggableCards
                initialCards={cards}
                onCardsChange={handleCardsChange}
              />
            </div>
          )}

          <div className="flex justify-center">
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-200 font-bold py-3 px-6 w-full md:w-auto"
              onClick={handleGenerateClick}
            >
              Generate Outline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}