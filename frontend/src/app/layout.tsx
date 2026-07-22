import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "tldraw/tldraw.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Datasheet AI - The Ultimate AI Assistant for Hardware Engineers",
  description: "Datasheet AI is a powerful RAG engine that allows hardware and electronics engineers to chat with their complex PDF datasheets, extract technical specifications, and sketch circuits on an infinite whiteboard.",
  keywords: ["Datasheet AI", "Electronics Knowledge Base", "Hardware Engineering AI", "Datasheet PDF Chat", "RAG AI for Engineers", "DatasheetAI"],
  authors: [{ name: "Datasheet AI Team" }],
  openGraph: {
    title: "Datasheet AI - Smart Electronics Workspace",
    description: "Chat with your hardware datasheets and design circuits on an AI-powered infinite whiteboard.",
    url: "https://datasheetai-pro.vercel.app",
    siteName: "Datasheet AI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Datasheet AI",
    description: "The AI-Powered Electronics Assistant and Whiteboard for Hardware Engineers.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
