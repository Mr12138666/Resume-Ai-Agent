"use client";

import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader, MetricCard } from "@/components/ui/card";
import { type ResumeResponse, getResume, structureResume } from "@/lib/api/client";
import { formatDate, formatJson } from "@/lib/format";

export default function ResumeDetailPage({ params }: { params: Promise<{ resumeId: string }> }) {
  const { resumeId } = use(params);
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStructuring, setIsStructuring] = useState(false);

  async function loadResume() {
    setIsLoading(true);
    setError(null);
    try {
      setResume(await getResume(resumeId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "简历详情加载失败。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadResume();
  }, [resumeId]);

  async function handleStructure() {
    setIsStructuring(true);
    setError(null);
    try {
      setResume(await structureResume(resumeId));
    } catch (structureError) {
      setError(structureError instanceof Error ? structureError.message : "简历结构化失败。");
    } finally {
      setIsStructuring(false);
    }
  }

  return (
    <AppShell
      actions={
        <>
          <ButtonLink href="/dashboard" tone="paper">工作台</ButtonLink>
          <ButtonLink href="/upload" tone="gold">用于 Tailor</ButtonLink>
        </>
      }
      description="主简历详情页保留参考项目里的“原始简历底座”概念：解析文本、结构化 JSON、后续定制都从这里出发。"
      eyebrow="Resume"
      title={resume?.title ?? "简历详情"}
    >
      {error ? <p className="mb-6 border border-black bg-[#dc2626] p-4 font-mono text-sm font-bold uppercase text-white shadow-sw-sm">{error}</p> : null}
      {isLoading ? <p className="border border-black bg-[#f0f0e8] p-6 font-mono font-bold uppercase shadow-sw-sm">正在加载简历...</p> : null}

      {resume ? (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="状态" value={resume.status} tone="lime" />
            <MetricCard label="文本长度" value={resume.rawTextLength} tone="paper" />
            <MetricCard label="创建" value={formatDate(resume.createdAt)} tone="sky" />
            <MetricCard label="更新" value={formatDate(resume.updatedAt)} tone="gold" />
          </section>

          <Card tone="lime">
            <CardHeader
              action={
                <Button disabled={isStructuring} onClick={handleStructure} tone="ink" type="button">
                  {isStructuring ? "结构化中" : "生成 Resume JSON"}
                </Button>
              }
              eyebrow="Source File"
              title={resume.originalFilename}
              description={`${resume.contentType} · 文件已保存到对象存储，文本已写入数据库。`}
            />
          </Card>

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card tone="paper">
              <CardHeader eyebrow="Parsed Text" title="解析文本" description="Tika 提取出的正文会作为匹配和改写的基础证据。" />
              <pre className="panel-scroll mt-5 max-h-[42rem] overflow-auto whitespace-pre-wrap border border-black bg-[#e5e5e0] p-5 font-mono text-sm leading-7">
                {resume.rawTextPreview || "暂无文本预览。"}
              </pre>
            </Card>
            <Card tone="ink">
              <CardHeader eyebrow="Structured JSON" title="结构化抽取" description="AI 结构化结果会用于更精细的章节识别和后续改写。" />
              {resume.structuredJson ? (
                <pre className="panel-scroll mt-5 max-h-[42rem] overflow-auto whitespace-pre-wrap border border-white/80 bg-white/10 p-5 font-mono text-xs leading-5 text-white">
                  {formatJson(resume.structuredJson)}
                </pre>
              ) : (
                <p className="mt-5 border border-white/60 bg-white/10 p-5 font-mono text-xs uppercase leading-5 text-white/75">
                  暂无结构化 JSON。点击按钮后会调用中文提示词进行结构化解析。
                </p>
              )}
            </Card>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
