import { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Vivid - Creative AI",
  description: "Generate creative content with AI",
};

export default async function GenerateLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If not authenticated, redirect to login
  if (!session) {
    redirect("/login");
  }

  return <>{children}</>;
} 