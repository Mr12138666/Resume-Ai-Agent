"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader, MetricCard } from "@/components/ui/card";
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
      {error ? <p className="mb-6 border-2 border-[#171713] bg-[#f2b8ad] p-4 font-bold">{error}</p> : null}

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <Card tone={readyForTailor ? "lime" : "gold"}>
          <CardHeader
            action={<StatusPill label={readyForTailor ? "READY" : "NEEDS SETUP"} />}
            eyebrow="Master Resume"
            title={latestResume ? latestResume.title : "还没有主简历"}
            description={
              latestResume
                ? `${latestResume.originalFilename} · ${latestResume.status} · ${latestResume.rawTextLength} 字`
                : "先上传一份基础简历，后续所有 JD 定制、关键词高亮和智能体改写都会围绕它展开。"
            }
          />
          <div className="mt-6 grid gap-4 md:grid-cols-[1fr_auto]">
            <div className="border-2 border-[#171713] bg-white/70 p-4">
              <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#6f746d]">解析预览</p>
              <p className="mt-3 line-clamp-5 text-sm leading-7 text-[#424036]">{latestResume?.rawTextPreview || "上传后这里会显示 Tika 解析出的简历文本。"}</p>
            </div>
            <div className="flex flex-col gap-3">
              <ButtonLink href="/upload" tone="ink">{latestResume ? "继续定制" : "上传简历"}</ButtonLink>
              {latestResume ? <ButtonLink href={`/resumes/${latestResume.id}`} tone="paper">查看简历</ButtonLink> : null}
            </div>
          </div>
        </Card>

        <Card tone="ink">
          <CardHeader
            eyebrow="System Status"
            title={data.status?.status ?? "UNKNOWN"}
            description={data.status ? `最近检查：${formatDateTime(data.status.timestamp)}` : "正在等待后端状态。"}
          />
          <div className="mt-5 grid gap-3">
            {(data.status?.components ?? []).slice(0, 5).map((component) => (
              <article className="border-2 border-white/80 bg-white/10 p-3" key={component.name}>
                <div className="flex items-center justify-between gap-3">
                  <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-white/70">{component.name}</p>
                  <span className="border border-white/70 px-2 py-1 font-mono text-[10px] font-black">{component.status}</span>
                </div>
                <p className="mt-2 text-xs leading-5 text-white/70">{component.detail}</p>
              </article>
            ))}
          </div>
        </Card>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <MetricCard label="简历" value={data.resumes.length} tone="paper" />
        <MetricCard label="岗位" value={data.jobs.length} tone="sky" />
        <MetricCard label="分析" value={data.analyses.length} tone="lime" />
        <MetricCard label="改写" value={data.rewrites.length} tone="gold" />
        <MetricCard label="RAG" value={data.knowledge.length} tone="paper" />
        <MetricCard label="最佳分" value={bestAnalysis?.overallScore ?? 0} tone="lime" />
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card tone="paper">
          <CardHeader
            eyebrow="Best Match"
            title={bestAnalysis ? "最佳分析报告" : "等待第一份分析"}
            description={bestAnalysis ? `缺失关键词 ${bestAnalysis.report.missingKeywords.length} 个，建议 ${bestAnalysis.report.suggestions.length} 条。` : "完成一次 Tailor 流程后，这里会显示最适合继续改写的报告。"}
          />
          <div className="mt-5">
            {bestAnalysis ? (
              <>
                <ScoreRing label="综合得分" score={bestAnalysis.overallScore} />
                <ButtonLink className="mt-5" href={`/analyses/${bestAnalysis.id}`} tone="ink">打开报告</ButtonLink>
              </>
            ) : (
              <ButtonLink href="/upload" tone="gold">创建分析</ButtonLink>
            )}
          </div>
        </Card>

        <Card tone="sky">
          <CardHeader
            eyebrow="Tailor Flow"
            title="复现参考项目的定制简历入口"
            description="选择主简历，粘贴目标 JD，系统会生成关键词覆盖、证据映射、RAG 建议和改写草稿。"
          />
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {[
              ["1", "上传主简历", latestResume ? "已就绪" : "待完成"],
              ["2", "粘贴 JD", latestJob ? "有历史岗位" : "待输入"],
              ["3", "生成分析", bestAnalysis ? "已有报告" : "待生成"],
              ["4", "改写导出", data.rewrites.length > 0 ? "已有草稿" : "待生成"],
            ].map(([index, title, state]) => (
              <div className="border-2 border-[#171713] bg-[#fffaf0] p-4" key={index}>
                <p className="font-mono text-xs font-black text-[#6f746d]">STEP {index}</p>
                <p className="mt-2 font-black">{title}</p>
                <p className="mt-2 font-mono text-xs">{state}</p>
              </div>
            ))}
          </div>
          <ButtonLink className="mt-5" href="/upload" tone={readyForTailor ? "ink" : "gold"}>
            {readyForTailor ? "进入 Tailor" : "先完成配置"}
          </ButtonLink>
        </Card>
      </section>

      <section className="mt-6 grid gap-6 lg:grid-cols-2">
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
  return <span className="border-2 border-[#171713] bg-[#fffaf0] px-3 py-1 font-mono text-xs font-black uppercase tracking-[0.16em]">{label}</span>;
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
            <Link className="block border-2 border-[#171713] bg-[#f5f0df] p-4 transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#171713]" href={item.href} key={item.href}>
              <p className="font-mono text-xs font-black uppercase tracking-[0.16em] text-[#6f746d]">{item.meta}</p>
              <h3 className="mt-2 text-xl font-black">{item.title}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#424036]">{clampText(item.body, 220)}</p>
            </Link>
          ))
        ) : (
          <p className="border-2 border-dashed border-[#171713] bg-white/50 p-5 text-sm leading-6 text-[#424036]">{emptyText}</p>
        )}
      </div>
    </Card>
  );
}
