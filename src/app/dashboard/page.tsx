import { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Vivid - Get Started",
  description: "Choose your preferred method to begin",
};

export default function DashboardPage() {
  return (
    <div className="flex-1 p-6 flex flex-col items-center justify-center bg-black text-white">
      <div className="text-center mb-10 md:mb-12">
        <h1 className="text-3xl md:text-5xl font-bold mb-3">How would you like to get started?</h1>
        <p className="text-gray-400">Choose your preferred method to begin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 w-full max-w-sm md:max-w-5xl">
        <Card
          title="Use a Template"
          description="Write a prompt and leave everything else for us to handle"
          buttonText="Continue"
          buttonLink="#"
        />
        <Card
          title="Generate with Creative AI"
          description="Write a prompt and leave everything else for us to handle"
          buttonText="Generate"
          buttonLink="/dashboard/generate"
          highlighted
        />
        <Card
          title="Start from Scratch"
          description="Write a prompt and leave everything else for us to handle"
          buttonText="Continue"
          buttonLink="#"
        />
      </div>
    </div>
  );
}

function Card({ title, description, buttonText, buttonLink, highlighted = false }: {
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
  highlighted?: boolean;
}) {
  const cardClasses = `p-6 md:p-8 rounded-2xl flex flex-col h-full bg-gray-900 border ${highlighted ? 'border-pink-500' : 'border-gray-800'}`;

  return (
    <div className={cardClasses}>
      <div className="flex-1">
        <h2 className="text-xl md:text-2xl font-bold mb-4">
          {title === "Generate with Creative AI" ? (
            <>
              Generate with <br />
              <span className="text-gradient bg-gradient-to-r from-red-500 to-fuchsia-500">Creative AI</span>
            </>
          ) : (
            title
          )}
        </h2>
        <p className="text-gray-400 mb-6 md:mb-8">{description}</p>
      </div>
      <Link href={buttonLink}>
        <Button
          variant={highlighted ? "default" : "secondary"}
          className={`w-full ${highlighted ? 'bg-white text-black hover:bg-gray-200' : 'bg-gray-800 text-white hover:bg-gray-700'}`}
        >
          {buttonText}
        </Button>
      </Link>
    </div>
  );
}
