"use client";

import { useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { type DemoSmokeResponse, runDemoSmoke } from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";

export default function DemoPage() {
  const [result, setResult] = useState<DemoSmokeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  async function handleRunDemo() {
    setIsRunning(true);
    setError(null);
    setResult(null);
    try {
      setResult(await runDemoSmoke());
    } catch (demoError) {
      setError(demoError instanceof Error ? demoError.message : "快速演示运行失败。");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <AppShell
      actions={
        <>
          <Button disabled={isRunning} onClick={handleRunDemo} tone="gold" type="button">{isRunning ? "运行中" : "运行演示"}</Button>
          <ButtonLink href="/dashboard" tone="paper">工作台</ButtonLink>
        </>
      }
      description="一键生成演示简历、目标 JD、匹配分析、改写草稿和 Markdown 导出，用于快速验收整条链路。"
      eyebrow="演示启动器"
      title="用一条样例链路检查平台是否真的跑通。"
    >
      {error ? <p className="mb-6 border border-black bg-[#dc2626] p-4 font-mono text-sm font-bold uppercase text-white shadow-sw-sm">{error}</p> : null}

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card tone="lime">
          <CardHeader
            eyebrow="链路检查"
            title="快速演示会做什么"
            description="后端会创建样例简历和 JD，生成分析报告与改写草稿，并将 Markdown 文件导出到 MinIO。"
          />
          <div className="mt-5 grid gap-3">
            {["创建样例简历", "创建目标 JD", "生成匹配分析", "生成改写草稿", "导出 Markdown"].map((item, index) => (
              <div className="border border-black bg-[#f0f0e8] p-4 shadow-sw-xs" key={item}>
                <p className="font-mono text-xs font-bold uppercase tracking-wide text-[#1d4ed8]">STEP {index + 1}</p>
                <p className="mt-2 font-black">{item}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card tone="ink">
          <CardHeader eyebrow="运行结果" title={result ? "演示已完成" : "等待运行"} description="运行成功后，可直接打开每个生成实体进行展示。" />
          {result ? (
            <div className="mt-5 grid gap-3">
              <DemoLink href={`/resumes/${result.resumeId}`} label="简历" value={result.resumeId} />
              <DemoLink href={`/jobs/${result.jobId}`} label="岗位" value={result.jobId} />
              <DemoLink href={`/analyses/${result.analysisId}`} label="分析" value={result.analysisId} />
              <DemoLink href={`/rewrites/${result.rewriteId}`} label="改写" value={result.rewriteId} />
              <div className="border border-white/80 bg-white/10 p-4">
                <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-white/70">Markdown</p>
                <p className="mt-2 break-all text-sm text-white/75">{result.export.objectKey}</p>
                <p className="mt-2 font-mono text-xs text-white/60">过期：{formatDateTime(result.export.downloadUrlExpiresAt)}</p>
                <a className="mt-4 inline-flex border border-white bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wide text-black" href={result.export.downloadUrl} rel="noreferrer" target="_blank">
                  下载
                </a>
              </div>
            </div>
          ) : (
            <p className="mt-5 border border-white/60 bg-white/10 p-5 font-mono text-xs uppercase leading-5 text-white/75">点击运行演示后，这里会显示生成的记录和下载链接。</p>
          )}
        </Card>
      </section>
    </AppShell>
  );
}

function DemoLink({ href, label, value }: { href: string; label: string; value: string }) {
  return (
    <a className="block border border-white/80 bg-white/10 p-4 text-white transition hover:translate-x-[1px] hover:translate-y-[1px]" href={href}>
      <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-white/70">{label}</p>
      <p className="mt-2 break-all text-sm font-black">{value}</p>
    </a>
  );
}
