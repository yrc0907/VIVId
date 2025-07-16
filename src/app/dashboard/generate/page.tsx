import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ChevronDown, RefreshCw } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vivid - Creative AI",
  description: "Generate creative content with AI",
};

export default async function DashboardPage() {
  const session = await auth();

  // If not authenticated, redirect to login
  if (!session) {
    redirect("/login");
  }

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
            />
            <div className="absolute right-2 md:right-3 top-1/2 -translate-y-1/2 flex items-center gap-2 md:gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <span>No cards</span>
                <ChevronDown className="h-4 w-4" />
              </div>
              <Button className="bg-red-500 hover:bg-red-600 p-2 h-10 w-10">
                <RefreshCw className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div className="flex justify-center">
            <Button size="lg" className="bg-white text-black hover:bg-gray-200 font-bold py-3 px-6 w-full md:w-auto">
              Generate Outline
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}