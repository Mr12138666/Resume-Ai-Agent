"use client";

import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { RewriteDiffPreview } from "@/components/comparison-panels";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader, MetricCard } from "@/components/ui/card";
import {
  type ExportRewriteResponse,
  type RewriteDraftResponse,
  exportRewriteMarkdown,
  getRewrite,
} from "@/lib/api/client";
import { formatDate, formatDateTime, formatJson } from "@/lib/format";

export default function RewriteDetailPage({ params }: { params: Promise<{ rewriteId: string }> }) {
  const { rewriteId } = use(params);
  const [rewrite, setRewrite] = useState<RewriteDraftResponse | null>(null);
  const [exportResult, setExportResult] = useState<ExportRewriteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);

  useEffect(() => {
    async function loadRewrite() {
      setIsLoading(true);
      setError(null);
      try {
        setRewrite(await getRewrite(rewriteId));
      } catch (loadError) {
        setError(loadError instanceof Error ? loadError.message : "改写草稿加载失败。");
      } finally {
        setIsLoading(false);
      }
    }

    void loadRewrite();
  }, [rewriteId]);

  async function handleExportMarkdown() {
    setIsExporting(true);
    setError(null);
    setExportResult(null);
    try {
      setExportResult(await exportRewriteMarkdown(rewriteId));
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "Markdown 导出失败。");
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <AppShell
      actions={
        <>
          <ButtonLink href="/dashboard" tone="paper">工作台</ButtonLink>
          {rewrite ? <ButtonLink href={`/analyses/${rewrite.analysisId}`} tone="gold">返回分析</ButtonLink> : null}
        </>
      }
      description="参考项目里的 diff preview 是确认改写质量的关键。这里把原文、改写、理由、事实校验和 Markdown 导出放在同一页。"
      eyebrow="Rewrite Draft"
      title="先看差异，再决定是否导出。"
    >
      {error ? <p className="mb-6 border-2 border-[#171713] bg-[#f2b8ad] p-4 font-bold">{error}</p> : null}
      {isLoading ? <p className="border-2 border-[#171713] bg-[#fffaf0] p-6 font-mono font-black">正在加载改写草稿...</p> : null}

      {rewrite ? (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="状态" value={rewrite.status} tone="paper" />
            <MetricCard label="段落" value={rewrite.sectionId || "默认"} tone="sky" />
            <MetricCard label="创建" value={formatDate(rewrite.createdAt)} tone="lime" />
            <MetricCard label="更新" value={formatDate(rewrite.updatedAt)} tone="gold" />
          </section>

          <Card tone="lime">
            <CardHeader
              action={
                <Button disabled={isExporting} onClick={handleExportMarkdown} tone="ink" type="button">
                  {isExporting ? "导出中" : "导出 Markdown"}
                </Button>
              }
              eyebrow="Export"
              title="导出优化段落"
              description="导出会写入 MinIO，并返回一个临时下载链接。"
            />
            {exportResult ? (
              <div className="mt-5 grid gap-3 border-2 border-[#171713] bg-[#fffaf0] p-5 font-mono text-sm md:grid-cols-2">
                <Info label="对象 Key" value={exportResult.objectKey} />
                <Info label="内容类型" value={exportResult.contentType} />
                <Info label="大小" value={`${exportResult.size} bytes`} />
                <Info label="导出时间" value={formatDateTime(exportResult.exportedAt)} />
                <Info label="过期时间" value={formatDateTime(exportResult.downloadUrlExpiresAt)} />
                <div className="md:col-span-2">
                  <a
                    className="inline-flex border-2 border-[#171713] bg-[#171713] px-5 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] text-white shadow-[5px_5px_0_#95a36a]"
                    href={exportResult.downloadUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    下载 Markdown
                  </a>
                </div>
              </div>
            ) : null}
          </Card>

          <RewriteDiffPreview rewrite={rewrite} />

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card tone="gold">
              <CardHeader eyebrow="Rationale" title="改写理由" description="这里解释为什么这样重写，方便人工确认是否符合真实经历。" />
              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#424036]">{rewrite.rationale}</p>
            </Card>
            <Card tone="ink">
              <CardHeader eyebrow="Verification" title="事实校验 JSON" description="模型输出应尽量说明是否引入了无法从原文支撑的新事实。" />
              <pre className="panel-scroll mt-5 max-h-96 overflow-auto whitespace-pre-wrap border-2 border-white/80 bg-white/10 p-4 text-xs leading-5 text-white">
                {formatJson(rewrite.verificationJson)}
              </pre>
            </Card>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-[#6f746d]">{label}</p>
      <p className="mt-1 break-all font-black">{value}</p>
    </div>
  );
}
