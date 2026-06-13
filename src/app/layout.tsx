import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI 产品导航复刻",
  description: "本地复刻的产品经理导航站"
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
