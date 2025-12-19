import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { DataLoader } from "@/components/data-loader";
import { SetupCheck } from "@/components/setup-check";


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NutriSnap AI - 智能饮食助手",
  description: "基于 AI 的饮食管理助手，帮助大学生和年轻白领快速识别热量并获得即时选购建议",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "NutriSnap AI",
  },
  icons: {
    apple: "/icon-192.png",
  },
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <head>
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body 
        className={`${inter.className} bg-zinc-100 min-h-screen font-sans antialiased`}
        suppressHydrationWarning
      >
        <SetupCheck>
          <DataLoader>
            <main className="max-w-md mx-auto bg-white min-h-screen shadow-xl relative pb-24">
              {children}
            </main>
          </DataLoader>
        </SetupCheck>
      </body>
    </html>
  );
}
