import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { NavigationProgress } from '@/components/ui/navigation-progress'
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Legalese - AI Document Review Assistant",
  description: "Understand your contracts in seconds, not hours. AI-powered legal document analysis for SMBs and startups.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <NavigationProgress />
        {children}
      </body>
    </html>
  );
}
