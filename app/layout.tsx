import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
  icons: {
    icon: [
      { url: '/legalese-logo.png', sizes: '32x32', type: 'image/png' },
      { url: '/legalese-logo.png', sizes: '16x16', type: 'image/png' },
      { url: '/legalese-logo-hires.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/legalese-logo-hires.png', sizes: '180x180', type: 'image/png' },
    ],
    shortcut: '/legalese-logo.png',
  },
  manifest: '/site.webmanifest',
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
        {children}
      </body>
    </html>
  );
}
