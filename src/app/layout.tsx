import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 产品导航",
  description: "本地产品经理导航站",
  keywords: [
    "ai工具",
    "AI工具",
    "ai产品导航",
    "AI产品导航",
    "AI工具导航",
    "AIGC工具",
    "AI导航站",
    "产品经理导航",
    "产品经理工具",
    "运营工具导航",
    "效率工具导航",
    "AI写作工具",
    "AI编程工具",
    "AI绘画工具",
    "AI视频工具",
    "AI搜索工具",
    "AI办公工具",
    "Prompt工具",
    "设计工具导航",
    "数据分析工具"
  ]
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-CN" suppressHydrationWarning>
      <body>{children}</body>
    </html>
  );
}
