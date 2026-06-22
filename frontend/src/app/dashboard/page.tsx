"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ScoreRing } from "@/components/score-ring";
import {
  type AnalysisResponse,
  type JobDescriptionResponse,
  type KnowledgeDocumentResponse,
  type ResumeResponse,
  type RewriteDraftResponse,
  type SystemStatusResponse,
  getSystemStatus,
  listAnalyses,
  listJobDescriptions,
  listKnowledgeDocuments,
  listResumes,
  listRewrites,
} from "@/lib/api/client";
import { clampText, formatDateTime } from "@/lib/format";

type DashboardData = {
  status: SystemStatusResponse | null;
  resumes: ResumeResponse[];
  jobs: JobDescriptionResponse[];
  analyses: AnalysisResponse[];
  rewrites: RewriteDraftResponse[];
  knowledge: KnowledgeDocumentResponse[];
};

const emptyData: DashboardData = {
  status: null,
  resumes: [],
  jobs: [],
  analyses: [],
  rewrites: [],
  knowledge: [],
};

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(emptyData);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadDashboard() {
    setIsLoading(true);
    setError(null);
    try {
      const [status, resumes, jobs, analyses, rewrites, knowledge] = await Promise.all([
        getSystemStatus(),
        listResumes(),
        listJobDescriptions(),
        listAnalyses(),
        listRewrites(),
        listKnowledgeDocuments(),
      ]);
      setData({ status, resumes, jobs, analyses, rewrites, knowledge });
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "工作台加载失败。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const latestResume = data.resumes[0] ?? null;
  const latestJob = data.jobs[0] ?? null;
  const bestAnalysis = useMemo(
    () => data.analyses.reduce<AnalysisResponse | null>((best, analysis) => (!best || analysis.overallScore > best.overallScore ? analysis : best), null),
    [data.analyses],
  );
  const llmComponent = data.status?.components.find((component) => component.name === "llm");
  const readyForTailor = Boolean(latestResume && llmComponent?.status === "CONFIGURED");

  return (
    <AppShell
      actions={
        <>
          <Button disabled={isLoading} onClick={loadDashboard} tone="paper" type="button">
            {isLoading ? "刷新中" : "刷新"}
          </Button>
          <ButtonLink href="/upload" tone="gold">新建 Tailor</ButtonLink>
        </>
      }
      description="参考 Resume-Matcher 的工作台结构：先确认主简历和模型状态，再进入定制流程，并在同一页追踪最近生成的分析、改写与 RAG 资产。"
      eyebrow="Dashboard"
      title="你的简历优化控制塔。"
    >
      {error ? <p className="border border-black bg-[#dc2626] p-4 font-mono text-sm font-bold uppercase text-white shadow-sw-sm">{error}</p> : null}

      <section className="grid grid-cols-1 gap-[1px] border border-black bg-black md:grid-cols-2 xl:grid-cols-5">
        <ModuleCard className="min-h-72 xl:aspect-square" href={latestResume ? `/resumes/${latestResume.id}` : "/upload"} tone="primary">
          <div className="flex h-full flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-16 w-16 items-center justify-center border-2 border-black bg-[#1d4ed8] font-mono text-xl font-bold text-white">
                  M
                </div>
                <StatusPill label={readyForTailor ? "READY" : "SETUP"} />
              </div>
              <h2 className="mt-8 font-serif text-3xl font-semibold uppercase leading-none tracking-tight">
                {latestResume ? "Master Resume" : "Initialize Resume"}
              </h2>
              <p className="mt-4 line-clamp-5 font-mono text-xs uppercase leading-5 text-[#6b7280]">
                {latestResume ? `${latestResume.title} // ${latestResume.status} // ${latestResume.rawTextLength} 字` : "上传一份基础简历，作为后续 JD 定制和改写的主档案。"}
              </p>
            </div>
            <span className="mt-6 font-mono text-xs font-bold uppercase tracking-wide text-[#1d4ed8]">
              {latestResume ? "Open Resume" : "Upload Now"}
            </span>
          </div>
        </ModuleCard>

        <ModuleCard className="min-h-72 xl:aspect-square" href="/upload">
          <div className="flex h-full flex-col justify-between">
            <div className="flex h-14 w-14 items-center justify-center border-2 border-current text-3xl leading-none">+</div>
            <div>
              <h2 className="font-serif text-3xl font-semibold uppercase leading-none tracking-tight">Tailor Resume</h2>
              <p className="mt-4 font-mono text-xs uppercase leading-5 text-[#6b7280]">粘贴目标 JD，生成关键词覆盖、证据映射、RAG 建议和改写草稿。</p>
            </div>
          </div>
        </ModuleCard>

        <ModuleCard className="min-h-72 xl:aspect-square" href="/settings" tone="dark">
          <div className="flex h-full flex-col justify-between">
            <div>
              <p className="font-mono text-xs font-bold uppercase tracking-wide text-white/60">System</p>
              <h2 className="mt-4 font-serif text-4xl font-semibold uppercase leading-none">{data.status?.status ?? "Unknown"}</h2>
              <p className="mt-4 font-mono text-xs uppercase leading-5 text-white/60">
                {data.status ? formatDateTime(data.status.timestamp) : "等待后端状态"}
              </p>
            </div>
            <div className="space-y-2">
              {(data.status?.components ?? []).slice(0, 4).map((component) => (
                <div className="flex items-center justify-between gap-2 border border-white/40 px-2 py-1 font-mono text-[10px] uppercase text-white/75" key={component.name}>
                  <span>{component.name}</span>
                  <span>{component.status}</span>
                </div>
              ))}
            </div>
          </div>
        </ModuleCard>

        {[
          ["Resumes", data.resumes.length, "/dashboard"],
          ["Jobs", data.jobs.length, latestJob ? `/jobs/${latestJob.id}` : "/upload"],
          ["Analyses", data.analyses.length, bestAnalysis ? `/analyses/${bestAnalysis.id}` : "/upload"],
          ["Rewrites", data.rewrites.length, data.rewrites[0] ? `/rewrites/${data.rewrites[0].id}` : "/upload"],
          ["RAG Docs", data.knowledge.length, "/knowledge"],
        ].map(([label, value, href]) => (
          <ModuleCard className="min-h-44 xl:aspect-square" href={String(href)} key={label}>
            <div className="flex h-full flex-col justify-between">
              <p className="font-mono text-xs font-bold uppercase tracking-wide text-[#1d4ed8]">{label}</p>
              <p className="font-mono text-6xl font-bold leading-none">{value}</p>
            </div>
          </ModuleCard>
        ))}

        <ModuleCard className="min-h-72 md:col-span-2 xl:col-span-2" href={bestAnalysis ? `/analyses/${bestAnalysis.id}` : "/upload"}>
          <div className="grid h-full gap-6 md:grid-cols-[auto_1fr] md:items-center">
            {bestAnalysis ? <ScoreRing label="Best Match" score={bestAnalysis.overallScore} /> : <div className="flex h-32 w-32 items-center justify-center border border-black bg-[#e5e5e0] font-mono text-xs font-bold uppercase">No Report</div>}
            <div>
              <h2 className="font-serif text-3xl font-semibold uppercase leading-none tracking-tight">{bestAnalysis ? "Best Analysis" : "Create First Analysis"}</h2>
              <p className="mt-4 font-mono text-xs uppercase leading-5 text-[#6b7280]">
                {bestAnalysis ? `缺失关键词 ${bestAnalysis.report.missingKeywords.length} 个，建议 ${bestAnalysis.report.suggestions.length} 条。` : "完成 Tailor 流程后，这里显示最适合继续改写的报告。"}
              </p>
            </div>
          </div>
        </ModuleCard>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <RecordList
          emptyText="还没有上传简历。"
          items={data.resumes.slice(0, 5).map((resume) => ({
            href: `/resumes/${resume.id}`,
            meta: `${resume.status} · ${formatDateTime(resume.createdAt)}`,
            title: resume.title,
            body: resume.rawTextPreview || resume.originalFilename,
          }))}
          title="最近简历"
        />
        <RecordList
          emptyText="还没有创建岗位。"
          items={data.jobs.slice(0, 5).map((job) => ({
            href: `/jobs/${job.id}`,
            meta: `${job.company || "未知公司"} · ${job.status}`,
            title: job.title || "未命名岗位",
            body: job.description,
          }))}
          title="目标岗位"
        />
        <RecordList
          emptyText="还没有分析报告。"
          items={data.analyses.slice(0, 5).map((analysis) => ({
            href: `/analyses/${analysis.id}`,
            meta: `${analysis.status} · 综合 ${analysis.overallScore}`,
            title: `缺口 ${analysis.report.missingKeywords.length} · 建议 ${analysis.report.suggestions.length}`,
            body: analysis.report.suggestions.join(" "),
          }))}
          title="分析报告"
        />
        <RecordList
          emptyText="还没有改写草稿。"
          items={data.rewrites.slice(0, 5).map((rewrite) => ({
            href: `/rewrites/${rewrite.id}`,
            meta: `${rewrite.status} · ${formatDateTime(rewrite.createdAt)}`,
            title: rewrite.sectionId || "改写草稿",
            body: rewrite.rewrittenText,
          }))}
          title="改写草稿"
        />
      </section>
    </AppShell>
  );
}

function StatusPill({ label }: { label: string }) {
  return <span className="border border-black bg-[#f0f0e8] px-3 py-1 font-mono text-xs font-bold uppercase tracking-wide text-black">{label}</span>;
}

function ModuleCard({
  children,
  className = "",
  href,
  tone = "light",
}: {
  children: React.ReactNode;
  className?: string;
  href: string;
  tone?: "light" | "primary" | "dark";
}) {
  const toneClass = {
    light: "bg-[#f0f0e8] text-black hover:bg-[#e5e5e0]",
    primary: "bg-[#f0f0e8] text-black hover:bg-[#1d4ed8] hover:text-white",
    dark: "bg-black text-white hover:bg-[#1d4ed8]",
  }[tone];

  return (
    <Link className={`group block p-6 transition-[transform,box-shadow,background-color,color] duration-150 hover:z-20 hover:-translate-x-[2px] hover:-translate-y-[2px] hover:shadow-sw-default ${toneClass} ${className}`} href={href}>
      {children}
    </Link>
  );
}

function RecordList({
  emptyText,
  items,
  title,
}: {
  emptyText: string;
  items: Array<{ body: string; href: string; meta: string; title: string }>;
  title: string;
}) {
  return (
    <Card tone="paper">
      <CardHeader eyebrow="Records" title={title} />
      <div className="mt-5 space-y-3">
        {items.length > 0 ? (
          items.map((item) => (
            <Link className="block border border-black bg-[#f0f0e8] p-4 transition hover:translate-x-[1px] hover:translate-y-[1px] hover:bg-[#e5e5e0] hover:shadow-none shadow-sw-sm" href={item.href} key={item.href}>
              <p className="font-mono text-xs font-bold uppercase tracking-wide text-[#1d4ed8]">{item.meta}</p>
              <h3 className="mt-2 font-serif text-xl font-semibold uppercase leading-tight">{item.title}</h3>
              <p className="mt-2 line-clamp-3 font-mono text-xs uppercase leading-5 text-[#6b7280]">{clampText(item.body, 220)}</p>
            </Link>
          ))
        ) : (
          <p className="border border-dashed border-black bg-[#e5e5e0] p-5 font-mono text-xs uppercase leading-5 text-[#6b7280]">{emptyText}</p>
        )}
      </div>
    </Card>
  );
}
