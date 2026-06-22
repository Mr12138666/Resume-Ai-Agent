"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
      setError(loadError instanceof Error ? loadError.message : "Failed to load dashboard.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  const bestAnalysis = data.analyses.reduce<AnalysisResponse | null>((best, analysis) => {
    if (!best || analysis.overallScore > best.overallScore) {
      return analysis;
    }
    return best;
  }, null);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_10%,#dce8c4,transparent_24rem),linear-gradient(135deg,#f8f5eb,#e5ecdf)] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.35em] text-slate-600">Command Center</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              One board for the resume optimization pipeline.
            </h1>
          </div>
          <button
            className="border-2 border-slate-950 bg-white px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider shadow-[5px_5px_0_#0f172a] disabled:opacity-60"
            disabled={isLoading}
            onClick={loadDashboard}
            type="button"
          >
            {isLoading ? "Loading..." : "Refresh"}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="border-2 border-slate-950 bg-slate-950 px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[5px_5px_0_#95a36a]" href="/upload">
            Run workflow
          </Link>
          <Link className="border-2 border-slate-950 bg-white px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider shadow-[5px_5px_0_#0f172a]" href="/knowledge">
            Manage RAG
          </Link>
        </div>

        {error ? (
          <p className="mt-6 border-2 border-red-900 bg-red-50 p-4 text-red-900">{error}</p>
        ) : null}

        <div className="mt-8 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
          {[
            ["Resumes", data.resumes.length],
            ["Jobs", data.jobs.length],
            ["Analyses", data.analyses.length],
            ["Rewrites", data.rewrites.length],
            ["Knowledge", data.knowledge.length],
            ["Best score", bestAnalysis?.overallScore ?? 0],
          ].map(([label, value]) => (
            <article key={label} className="border-2 border-slate-950 bg-white p-5 shadow-[5px_5px_0_#0f172a]">
              <p className="font-mono text-xs uppercase tracking-widest text-slate-600">{label}</p>
              <p className="mt-3 text-4xl font-black">{value}</p>
            </article>
          ))}
        </div>

        <section className="mt-8 border-2 border-slate-950 bg-[#eef4dd] p-6 shadow-[8px_8px_0_#95a36a]">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="font-mono text-xl font-bold">Runtime status</h2>
              <p className="mt-1 text-sm text-slate-700">
                {data.status ? `Last checked ${new Date(data.status.timestamp).toLocaleString()}` : "Backend status has not loaded yet."}
              </p>
            </div>
            <span className="border-2 border-slate-950 bg-white px-3 py-1 font-mono text-sm font-bold">
              {data.status?.status ?? "UNKNOWN"}
            </span>
          </div>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {(data.status?.components ?? []).map((component) => (
              <article key={component.name} className="border-2 border-slate-950 bg-white p-4">
                <p className="font-mono text-xs uppercase tracking-widest text-slate-600">{component.name}</p>
                <p className="mt-2 font-black">{component.status}</p>
                <p className="mt-2 text-sm leading-6 text-slate-700">{component.detail}</p>
              </article>
            ))}
          </div>
        </section>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <RecentCard
            emptyText="No resumes uploaded yet."
            items={data.resumes.slice(0, 5).map((resume) => ({
              id: resume.id,
              href: `/resumes/${resume.id}`,
              title: resume.title,
              meta: `${resume.status} · ${resume.rawTextLength} chars`,
              body: resume.rawTextPreview || resume.originalFilename,
            }))}
            title="Recent resumes"
          />
          <RecentCard
            emptyText="No job descriptions created yet."
            items={data.jobs.slice(0, 5).map((job) => ({
              id: job.id,
              href: `/jobs/${job.id}`,
              title: job.title || "Untitled role",
              meta: `${job.company || "Unknown company"} · ${job.status}`,
              body: job.description,
            }))}
            title="Target jobs"
          />
          <RecentCard
            emptyText="No analyses created yet."
            items={data.analyses.slice(0, 5).map((analysis) => ({
              id: analysis.id,
              href: `/analyses/${analysis.id}`,
              title: `Overall ${analysis.overallScore} / Keyword ${analysis.keywordScore}`,
              meta: `${analysis.status} · missing ${analysis.report.missingKeywords.length}`,
              body: analysis.report.suggestions.join(" "),
            }))}
            title="Recent analyses"
          />
          <RecentCard
            emptyText="No rewrite drafts yet."
            items={data.rewrites.slice(0, 5).map((rewrite) => ({
              id: rewrite.id,
              href: `/rewrites/${rewrite.id}`,
              title: rewrite.sectionId || "Rewrite draft",
              meta: rewrite.status,
              body: rewrite.rewrittenText,
            }))}
            title="Agent rewrites"
          />
        </div>
      </section>
    </main>
  );
}

function RecentCard({
  emptyText,
  items,
  title,
}: {
  emptyText: string;
  items: Array<{ id: string; href?: string; title: string; meta: string; body: string }>;
  title: string;
}) {
  return (
    <section className="border-2 border-slate-950 bg-white p-6 shadow-[8px_8px_0_#0f172a]">
      <h2 className="font-mono text-xl font-bold">{title}</h2>
      <div className="mt-5 space-y-4">
        {items.length > 0 ? (
          items.map((item) => (
            <RecordCard item={item} key={item.id} />
          ))
        ) : (
          <p className="border-2 border-dashed border-slate-950 bg-white/70 p-5 leading-7 text-slate-700">{emptyText}</p>
        )}
      </div>
    </section>
  );
}

function RecordCard({
  item,
}: {
  item: { id: string; href?: string; title: string; meta: string; body: string };
}) {
  const content = (
    <>
      <p className="font-mono text-xs uppercase tracking-widest text-slate-600">{item.meta}</p>
      <h3 className="mt-2 text-lg font-black">{item.title}</h3>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-700">{item.body}</p>
      {item.href ? (
        <p className="mt-3 font-mono text-xs font-bold uppercase tracking-widest text-slate-950">Open detail</p>
      ) : null}
    </>
  );

  if (item.href) {
    return (
      <Link className="block border-2 border-slate-950 bg-[#f8f5eb] p-4 transition hover:-translate-y-0.5 hover:shadow-[5px_5px_0_#0f172a]" href={item.href}>
        {content}
      </Link>
    );
  }

  return <article className="border-2 border-slate-950 bg-[#f8f5eb] p-4">{content}</article>;
}
