"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  type AnalysisResponse,
  type RewriteDraftResponse,
  createRewrite,
  getAnalysis,
} from "@/lib/api/client";

export default function AnalysisDetailPage({
  params,
}: {
  params: Promise<{ analysisId: string }>;
}) {
  const { analysisId } = use(params);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [rewrite, setRewrite] = useState<RewriteDraftResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRewriting, setIsRewriting] = useState(false);

  async function loadAnalysis() {
    setIsLoading(true);
    setError(null);
    try {
      setAnalysis(await getAnalysis(analysisId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load analysis.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadAnalysis();
  }, [analysisId]);

  async function handleRewrite() {
    if (!analysis) {
      return;
    }

    setIsRewriting(true);
    setError(null);
    try {
      setRewrite(await createRewrite({ analysisId: analysis.id, sectionId: "analysis-detail" }));
    } catch (rewriteError) {
      setError(rewriteError instanceof Error ? rewriteError.message : "Rewrite failed.");
    } finally {
      setIsRewriting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8f5eb,#edf3dc_55%,#dfe8df)] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.35em] text-slate-600">Analysis Report</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              Resume fit, gaps, evidence, and next rewrite move.
            </h1>
          </div>
          <Link
            className="border-2 border-slate-950 bg-white px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider shadow-[5px_5px_0_#0f172a]"
            href="/dashboard"
          >
            Dashboard
          </Link>
        </div>

        {error ? (
          <p className="mt-6 border-2 border-red-900 bg-red-50 p-4 text-red-900">{error}</p>
        ) : null}

        {isLoading ? (
          <p className="mt-8 border-2 border-slate-950 bg-white p-6 font-mono">Loading analysis...</p>
        ) : null}

        {analysis ? (
          <div className="mt-8 space-y-8">
            <section className="grid gap-4 md:grid-cols-4">
              {[
                ["Overall", analysis.overallScore],
                ["Keyword", analysis.keywordScore],
                ["Semantic", analysis.semanticScore],
                ["ATS", analysis.atsScore],
              ].map(([label, score]) => (
                <article key={label} className="border-2 border-slate-950 bg-white p-5 shadow-[5px_5px_0_#0f172a]">
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-600">{label}</p>
                  <p className="mt-3 text-5xl font-black">{score}</p>
                </article>
              ))}
            </section>

            <section className="border-2 border-slate-950 bg-[#eef4dd] p-6 shadow-[8px_8px_0_#95a36a]">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <h2 className="font-mono text-xl font-bold">Agent rewrite</h2>
                  <p className="mt-2 max-w-2xl leading-7 text-slate-700">
                    Generate a rewrite draft from this analysis. The backend uses Spring AI tool calling and falls back safely if the model call fails.
                  </p>
                </div>
                <button
                  className="border-2 border-slate-950 bg-slate-950 px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[5px_5px_0_#ffffff] disabled:opacity-60"
                  disabled={isRewriting}
                  onClick={handleRewrite}
                  type="button"
                >
                  {isRewriting ? "Rewriting..." : "Create rewrite"}
                </button>
              </div>
              {rewrite ? (
                <div className="mt-5 border-2 border-slate-950 bg-white p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-widest text-slate-600">Draft created</p>
                      <h3 className="mt-2 text-xl font-black">{rewrite.sectionId || "Rewrite draft"}</h3>
                    </div>
                    <Link
                      className="border-2 border-slate-950 bg-[#f8f5eb] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a]"
                      href={`/rewrites/${rewrite.id}`}
                    >
                      Open draft
                    </Link>
                  </div>
                  <p className="mt-4 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{rewrite.rewrittenText}</p>
                </div>
              ) : null}
            </section>

            <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
              <section className="border-2 border-slate-950 bg-white p-6 shadow-[8px_8px_0_#0f172a]">
                <h2 className="font-mono text-xl font-bold">Missing keywords</h2>
                <div className="mt-5 flex flex-wrap gap-2">
                  {analysis.report.missingKeywords.length > 0 ? (
                    analysis.report.missingKeywords.map((keyword) => (
                      <span key={keyword} className="border border-slate-950 bg-red-50 px-2 py-1 font-mono text-xs">
                        {keyword}
                      </span>
                    ))
                  ) : (
                    <p className="leading-7 text-slate-700">No missing keywords detected in the current report.</p>
                  )}
                </div>
              </section>

              <section className="border-2 border-slate-950 bg-white p-6 shadow-[8px_8px_0_#0f172a]">
                <h2 className="font-mono text-xl font-bold">Suggestions</h2>
                <ul className="mt-5 space-y-3">
                  {analysis.report.suggestions.map((suggestion) => (
                    <li key={suggestion} className="border-l-4 border-slate-950 bg-[#f8f5eb] px-4 py-3 leading-7">
                      {suggestion}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <section className="border-2 border-slate-950 bg-white p-6 shadow-[8px_8px_0_#0f172a]">
              <h2 className="font-mono text-xl font-bold">Evidence map</h2>
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {analysis.report.evidenceMap.map((item) => (
                  <article key={`${item.keyword}-${item.evidence}`} className="border-2 border-slate-950 bg-[#f8f5eb] p-4">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-mono text-sm font-bold uppercase tracking-widest">{item.keyword}</h3>
                      <span className={item.matched ? "border border-slate-950 bg-[#eef4dd] px-2 py-1 font-mono text-xs" : "border border-slate-950 bg-red-50 px-2 py-1 font-mono text-xs"}>
                        {item.matched ? "matched" : "missing"}
                      </span>
                    </div>
                    <p className="mt-3 text-sm leading-6 text-slate-700">{item.evidence || "No resume evidence found."}</p>
                  </article>
                ))}
              </div>
            </section>

            <section className="border-2 border-slate-950 bg-slate-950 p-6 text-white shadow-[8px_8px_0_#95a36a]">
              <h2 className="font-mono text-xl font-bold">Retrieved RAG guidance</h2>
              {analysis.report.retrievedGuidance.length > 0 ? (
                <ul className="mt-5 space-y-3">
                  {analysis.report.retrievedGuidance.map((guidance) => (
                    <li key={guidance} className="border-2 border-white/80 bg-white/10 px-4 py-3 text-sm leading-6">
                      {guidance}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-5 text-white/80">No RAG guidance was retrieved for this analysis.</p>
              )}
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
