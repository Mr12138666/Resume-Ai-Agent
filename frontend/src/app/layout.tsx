import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "简历优化智能体",
  description: "面向求职者的 AI 简历优化平台。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
