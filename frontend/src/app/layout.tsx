import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Resume AI Agent | 简历优化智能平台",
  description: "上传简历和目标 JD，完成结构化解析、RAG 匹配、证据分析与智能体改写。",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
