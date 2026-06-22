"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  type ExportRewriteResponse,
  type RewriteDraftResponse,
  exportRewriteMarkdown,
  getRewrite,
} from "@/lib/api/client";

export default function RewriteDetailPage({
  params,
}: {
  params: Promise<{ rewriteId: string }>;
}) {
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
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_right,#dce8c4,transparent_24rem),linear-gradient(135deg,#f8f5eb,#e7eee0)] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.35em] text-slate-600">改写草稿</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              对照原文，检查事实，再导出可用版本。
            </h1>
          </div>
          <Link
            className="border-2 border-slate-950 bg-white px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider shadow-[5px_5px_0_#0f172a]"
            href="/dashboard"
          >
            工作台
          </Link>
        </div>

        {error ? (
          <p className="mt-6 border-2 border-red-900 bg-red-50 p-4 text-red-900">{error}</p>
        ) : null}

        {isLoading ? (
          <p className="mt-8 border-2 border-slate-950 bg-white p-6 font-mono">正在加载改写草稿...</p>
        ) : null}

        {rewrite ? (
          <div className="mt-8 space-y-8">
            <section className="grid gap-4 md:grid-cols-4">
              {[
                ["状态", rewrite.status],
                ["段落", rewrite.sectionId || "默认"],
                ["创建时间", new Date(rewrite.createdAt).toLocaleDateString()],
                ["更新时间", new Date(rewrite.updatedAt).toLocaleDateString()],
              ].map(([label, value]) => (
                <article key={label} className="border-2 border-slate-950 bg-white p-5 shadow-[5px_5px_0_#0f172a]">
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-600">{label}</p>
                  <p className="mt-3 break-words text-xl font-black">{value}</p>
                </article>
              ))}
            </section>

            <section className="border-2 border-slate-950 bg-[#eef4dd] p-6 shadow-[8px_8px_0_#95a36a]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-mono text-xl font-bold">导出文件</h2>
                  <p className="mt-2 max-w-2xl leading-7 text-slate-700">
                    将优化后的段落保存为 MinIO 中的 Markdown 文件，后续可用于下载链接或导出记录。
                  </p>
                </div>
                <button
                  className="border-2 border-slate-950 bg-slate-950 px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[5px_5px_0_#ffffff] disabled:opacity-60"
                  disabled={isExporting}
                  onClick={handleExportMarkdown}
                  type="button"
                >
                  {isExporting ? "导出中..." : "导出 Markdown"}
                </button>
              </div>
              {exportResult ? (
                <dl className="mt-5 grid gap-3 border-2 border-slate-950 bg-white p-5 font-mono text-sm md:grid-cols-2">
                  <dt className="text-slate-600">对象 Key</dt>
                  <dd className="break-all font-bold">{exportResult.objectKey}</dd>
                  <dt className="text-slate-600">内容类型</dt>
                  <dd className="font-bold">{exportResult.contentType}</dd>
                  <dt className="text-slate-600">大小</dt>
                  <dd className="font-bold">{exportResult.size} bytes</dd>
                  <dt className="text-slate-600">导出时间</dt>
                  <dd className="font-bold">{new Date(exportResult.exportedAt).toLocaleString()}</dd>
                  <dt className="text-slate-600">下载过期时间</dt>
                  <dd className="font-bold">{new Date(exportResult.downloadUrlExpiresAt).toLocaleString()}</dd>
                  <dt className="text-slate-600 md:col-span-2">下载</dt>
                  <dd className="md:col-span-2">
                    <a
                      className="inline-block border-2 border-slate-950 bg-slate-950 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[4px_4px_0_#95a36a]"
                      href={exportResult.downloadUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      下载 Markdown
                    </a>
                  </dd>
                </dl>
              ) : null}
            </section>

            <section className="grid gap-6 lg:grid-cols-2">
              <article className="border-2 border-slate-950 bg-white p-6 shadow-[8px_8px_0_#0f172a]">
                <h2 className="font-mono text-xl font-bold">原文</h2>
                <pre className="mt-5 max-h-[32rem] overflow-auto whitespace-pre-wrap border-2 border-slate-950 bg-[#f8f5eb] p-5 text-sm leading-6">
                  {rewrite.originalText}
                </pre>
              </article>
              <article className="border-2 border-slate-950 bg-slate-950 p-6 text-white shadow-[8px_8px_0_#95a36a]">
                <h2 className="font-mono text-xl font-bold">改写后</h2>
                <pre className="mt-5 max-h-[32rem] overflow-auto whitespace-pre-wrap border-2 border-white/80 bg-white/10 p-5 text-sm leading-6">
                  {rewrite.rewrittenText}
                </pre>
              </article>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
              <article className="border-2 border-slate-950 bg-[#eef4dd] p-6 shadow-[8px_8px_0_#95a36a]">
                <h2 className="font-mono text-xl font-bold">改写理由</h2>
                <p className="mt-5 whitespace-pre-wrap leading-7 text-slate-700">{rewrite.rationale}</p>
              </article>
              <article className="border-2 border-slate-950 bg-white p-6 shadow-[8px_8px_0_#0f172a]">
                <h2 className="font-mono text-xl font-bold">事实校验</h2>
                <pre className="mt-5 max-h-80 overflow-auto whitespace-pre-wrap border-2 border-slate-950 bg-slate-950 p-4 text-xs leading-5 text-white">
                  {formatJson(rewrite.verificationJson)}
                </pre>
              </article>
            </section>

            <Link
              className="inline-block border-2 border-slate-950 bg-white px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider shadow-[5px_5px_0_#0f172a]"
              href={`/analyses/${rewrite.analysisId}`}
            >
              返回分析报告
            </Link>
          </div>
        ) : null}
      </section>
    </main>
  );
}

function formatJson(value: string) {
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}
