"use client";

import { useRouter } from "next/navigation";
import { use, useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { CandidateDiffPreview } from "@/components/comparison-panels";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader, MetricCard } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  type ExportRewriteResponse,
  type RewriteCandidateResponse,
  type RewriteDraftResponse,
  acceptRewriteCandidate,
  deleteRewrite,
  exportRewriteMarkdown,
  exportRewritePdf,
  getRewrite,
  regenerateRewrite,
  rejectRewriteCandidate,
  updateRewrite,
} from "@/lib/api/client";
import { formatDate, formatDateTime } from "@/lib/format";

export default function RewriteDetailPage({ params }: { params: Promise<{ rewriteId: string }> }) {
  const { rewriteId } = use(params);
  const router = useRouter();
  const [rewrite, setRewrite] = useState<RewriteDraftResponse | null>(null);
  const [candidate, setCandidate] = useState<RewriteCandidateResponse | null>(null);
  const [exportResult, setExportResult] = useState<ExportRewriteResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  useEffect(() => {
    async function loadRewrite() {
      setIsLoading(true);
      setError(null);
      try {
        setRewrite(await getRewrite(rewriteId));
        setCandidate(null);
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

  async function handleExportPdf() {
    setIsExporting(true);
    setError(null);
    setExportResult(null);
    try {
      setExportResult(await exportRewritePdf(rewriteId));
    } catch (exportError) {
      setError(exportError instanceof Error ? exportError.message : "PDF 导出失败。");
    } finally {
      setIsExporting(false);
    }
  }

  async function handleDelete() {
    if (!rewrite) {
      return;
    }
    setIsDeleting(true);
    setError(null);
    try {
      await deleteRewrite(rewrite.id);
      setShowDeleteDialog(false);
      router.push("/dashboard");
      router.refresh();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "改写草稿删除失败。");
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleSaveEdit(newRewrittenText: string) {
    const updated = await updateRewrite(rewriteId, newRewrittenText);
    setRewrite(updated);
    setCandidate(null);
  }

  async function handleRegenerate(userMessage: string) {
    setIsRegenerating(true);
    setError(null);
    try {
      setCandidate(await regenerateRewrite(rewriteId, userMessage));
    } catch (regenerateError) {
      setError(regenerateError instanceof Error ? regenerateError.message : "改写候选生成失败。");
    } finally {
      setIsRegenerating(false);
    }
  }

  async function handleAcceptCandidate() {
    if (!candidate) {
      return;
    }
    setIsAccepting(true);
    setError(null);
    try {
      const updated = await acceptRewriteCandidate(rewriteId, candidate.rewrittenText);
      setRewrite(updated);
      setCandidate(null);
    } catch (acceptError) {
      setError(acceptError instanceof Error ? acceptError.message : "候选改写确认失败。");
    } finally {
      setIsAccepting(false);
    }
  }

  async function handleRejectCandidate(reason: string) {
    setIsRejecting(true);
    setError(null);
    try {
      const updated = await rejectRewriteCandidate(rewriteId, reason);
      setRewrite(updated);
      setCandidate(null);
    } catch (rejectError) {
      setError(rejectError instanceof Error ? rejectError.message : "候选改写拒绝失败。");
    } finally {
      setIsRejecting(false);
    }
  }

  const previewRewrite = candidate
    ? rewrite
      ? {
        id: rewrite.id,
        analysisId: rewrite.analysisId,
        sectionId: rewrite.sectionId,
        originalText: rewrite.originalText,
        rewrittenText: candidate.rewrittenText,
        rationale: candidate.rationale,
        verificationJson: candidate.verificationJson,
        conversationHistory: candidate.conversationHistory,
        regeneratedCount: candidate.regeneratedCount,
        status: candidate.status,
        createdAt: rewrite.createdAt,
        updatedAt: rewrite.updatedAt,
      }
      : null
    : rewrite;

  const candidateNotes = useMemo(() => candidate?.suggestions ?? [], [candidate]);

  return (
    <AppShell
      actions={
        <>
          <ButtonLink href="/dashboard" tone="paper">
            工作台
          </ButtonLink>
          {rewrite ? (
            <ButtonLink href={`/analyses/${rewrite.analysisId}`} tone="gold">
              返回分析
            </ButtonLink>
          ) : null}
        </>
      }
      description="参考项目的重写流程是候选版本先预览，再接受或拒绝。这里保留手动编辑，但把对话重写改成真正的确认式流程。"
      eyebrow="改写草稿"
      title="先看候选，再决定是否应用。"
    >
      {error ? <p className="mb-6 border border-black bg-[#dc2626] p-4 font-mono text-sm font-bold uppercase text-white shadow-sw-sm">{error}</p> : null}
      {isLoading ? <p className="border border-black bg-[#f0f0e8] p-6 font-mono font-bold uppercase shadow-sw-sm">正在加载改写草稿...</p> : null}

      {previewRewrite ? (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="状态" value={previewRewrite.status} tone="paper" />
            <MetricCard label="段落" value={previewRewrite.sectionId || "默认"} tone="sky" />
            <MetricCard label="创建" value={formatDate(previewRewrite.createdAt)} tone="lime" />
            <MetricCard label="更新" value={formatDate(previewRewrite.updatedAt)} tone="gold" />
          </section>

          <Card tone="lime">
            <CardHeader
              action={
                <div className="flex flex-wrap gap-3">
                  <Button disabled={isExporting} onClick={handleExportMarkdown} tone="ink" type="button">
                    {isExporting ? "导出中" : "导出 Markdown"}
                  </Button>
                  <Button disabled={isExporting} onClick={handleExportPdf} tone="default" type="button">
                    {isExporting ? "导出中" : "导出 PDF"}
                  </Button>
                  <Button disabled={isDeleting || isExporting} onClick={() => setShowDeleteDialog(true)} tone="danger" type="button">
                    {isDeleting ? "删除中" : "删除草稿"}
                  </Button>
                </div>
              }
              eyebrow="导出"
              title="导出优化段落"
              description="Markdown 和 PDF 都会写入 MinIO，并返回一个临时下载链接。"
            />
            {exportResult ? (
              <div className="mt-5 grid gap-3 border border-black bg-[#f0f0e8] p-5 font-mono text-sm shadow-sw-xs md:grid-cols-2">
                <Info label="对象 Key" value={exportResult.objectKey} />
                <Info label="内容类型" value={exportResult.contentType} />
                <Info label="大小" value={`${exportResult.size} bytes`} />
                <Info label="导出时间" value={formatDateTime(exportResult.exportedAt)} />
                <Info label="过期时间" value={formatDateTime(exportResult.downloadUrlExpiresAt)} />
                <div className="md:col-span-2">
                  <a
                    className="inline-flex border border-black bg-[#1d4ed8] px-5 py-3 font-mono text-xs font-bold uppercase tracking-wide text-white shadow-sw-sm transition hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none"
                    href={exportResult.downloadUrl}
                    rel="noreferrer"
                    target="_blank"
                  >
                    下载 {exportResult.format.toUpperCase()}
                  </a>
                </div>
              </div>
            ) : null}
          </Card>

          {candidate ? (
            <Card tone="paper">
              <CardHeader
                eyebrow="候选"
                title="重写候选已生成"
                description="按参考项目思路，候选不会自动覆盖，必须确认后才写回草稿。"
                action={
                  <div className="flex flex-wrap gap-3">
                    <Button disabled={isAccepting || isRejecting} onClick={handleAcceptCandidate} tone="success" type="button">
                      {isAccepting ? "应用中" : "接受候选"}
                    </Button>
                    <Button
                      disabled={isAccepting || isRejecting}
                      onClick={() => void handleRejectCandidate("本次候选不合适，继续调整。")}
                      tone="danger"
                      type="button"
                    >
                      {isRejecting ? "拒绝中" : "拒绝候选"}
                    </Button>
                  </div>
                }
              />
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {candidateNotes.map((note) => (
                  <p className="border border-black bg-[#f0f0e8] p-4 font-mono text-xs uppercase leading-5 text-[#6b7280] shadow-sw-xs" key={note}>
                    {note}
                  </p>
                ))}
              </div>
            </Card>
          ) : null}

          <CandidateDiffPreview
            rewrite={previewRewrite}
            candidate={candidate}
            conversationHistory={candidate?.conversationHistory ?? rewrite?.conversationHistory}
            isRegenerating={isRegenerating}
            isApplying={isAccepting || isRejecting}
            onSave={handleSaveEdit}
            onRegenerate={handleRegenerate}
            onAccept={handleAcceptCandidate}
            onReject={handleRejectCandidate}
          />

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card tone="gold">
              <CardHeader eyebrow="理由" title="改写理由" description="这里解释为什么这样重写，方便人工确认是否符合真实经历。" />
              <p className="mt-5 whitespace-pre-wrap font-mono text-xs uppercase leading-5 text-[#6b7280]">{previewRewrite.rationale}</p>
            </Card>
            <Card tone="ink">
              <CardHeader eyebrow="事实校验" title="事实校验结果" description="这里用于提示哪些内容需要人工确认，避免把无法支撑的新事实写进简历。" />
              <VerificationPanel value={previewRewrite.verificationJson} />
            </Card>
          </section>
        </div>
      ) : null}

      {rewrite ? (
        <ConfirmDialog
          description="将删除这份改写草稿；如果它导出过 Markdown 或 PDF，系统也会尝试清理对应文件。"
          isOpen={showDeleteDialog}
          isWorking={isDeleting}
          onCancel={() => setShowDeleteDialog(false)}
          onConfirm={() => void handleDelete()}
          title="删除这份草稿？"
        />
      ) : null}
    </AppShell>
  );
}

function VerificationPanel({ value }: { value: string | null | undefined }) {
  const parsed = parseVerification(value);
  if (!parsed) {
    return (
      <p className="mt-5 border border-white/60 bg-white/10 p-5 font-mono text-xs leading-5 text-white/75">
        暂无可读的事实校验结果，请人工核对改写内容是否和原始简历一致。
      </p>
    );
  }

  const rows = [
    ["校验结论", parsed["结论"]],
    ["新增事实", parsed["是否发现新增事实"]],
    ["人工复核", parsed["需要人工复核"]],
    ["依据摘要", parsed["依据摘要"]],
    ["复核建议", parsed["复核建议"]],
  ].filter(([, text]) => Boolean(text));

  return (
    <dl className="mt-5 grid gap-3">
      {rows.map(([label, text]) => (
        <div className="border border-white/70 bg-white/10 p-4" key={label}>
          <dt className="font-mono text-xs font-black uppercase tracking-[0.18em] text-white/60">{label}</dt>
          <dd className="mt-2 text-sm leading-6 text-white">{text}</dd>
        </div>
      ))}
    </dl>
  );
}

function parseVerification(value: string | null | undefined): Record<string, string> | null {
  if (!value) {
    return null;
  }
  try {
    const parsed = JSON.parse(value) as Record<string, unknown>;
    const normalized = Object.fromEntries(
      Object.entries(parsed).map(([key, entry]) => [key, typeof entry === "string" ? entry : JSON.stringify(entry)]),
    );
    if (!normalized["结论"] && (normalized.faithfulness || normalized.inventedFactsAllowed)) {
      return {
        结论: normalized.faithfulness === "passed" ? "旧版记录已通过基础校验" : "待人工确认",
        是否发现新增事实: normalized.inventedFactsAllowed === "true" ? "可能存在新增事实" : "未发现明确新增事实",
        需要人工复核: "需要",
        依据摘要: "这是旧版本生成的事实校验记录，字段已自动转换为中文展示。",
        复核建议: "请人工核对改写内容中的公司、项目、时间、数字指标和技术栈是否都能被原始简历支撑。",
      };
    }
    return normalized;
  } catch {
    return { 结论: "待人工确认", 依据摘要: value, 复核建议: "请人工核对改写内容是否和原始简历一致。" };
  }
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-wide text-[#1d4ed8]">{label}</p>
      <p className="mt-1 break-all font-black">{value}</p>
    </div>
  );
}
