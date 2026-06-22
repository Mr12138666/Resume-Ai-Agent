"use client";

import Link from "next/link";
import { useState } from "react";
import { type DemoSmokeResponse, runDemoSmoke } from "@/lib/api/client";

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
      setError(demoError instanceof Error ? demoError.message : "Demo smoke run failed.");
    } finally {
      setIsRunning(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_18%_15%,#dce8c4,transparent_24rem),linear-gradient(135deg,#f8f5eb,#e5ecdf)] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.35em] text-slate-600">Demo Launcher</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              One click to seed a full resume optimization trace.
            </h1>
          </div>
          <Link
            className="border-2 border-slate-950 bg-white px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider shadow-[5px_5px_0_#0f172a]"
            href="/dashboard"
          >
            Dashboard
          </Link>
        </div>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
          This creates a demo resume, target JD, analysis report, rewrite draft, and Markdown export in MinIO. It is meant for quick smoke testing and presentations.
        </p>

        {error ? (
          <p className="mt-6 border-2 border-red-900 bg-red-50 p-4 text-red-900">{error}</p>
        ) : null}

        <section className="mt-8 border-2 border-slate-950 bg-[#eef4dd] p-8 shadow-[8px_8px_0_#95a36a]">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="font-mono text-xl font-bold">Smoke run</h2>
              <p className="mt-2 leading-7 text-slate-700">
                The backend writes records to PostgreSQL, exports Markdown to MinIO, and returns a presigned download URL.
              </p>
            </div>
            <button
              className="border-2 border-slate-950 bg-slate-950 px-6 py-3 font-mono font-bold uppercase tracking-wider text-white shadow-[6px_6px_0_#ffffff] disabled:opacity-60"
              disabled={isRunning}
              onClick={handleRunDemo}
              type="button"
            >
              {isRunning ? "Running..." : "Run demo smoke"}
            </button>
          </div>
        </section>

        {result ? (
          <div className="mt-8 space-y-6">
            <section className="grid gap-4 md:grid-cols-4">
              {[
                ["Resume", result.resumeId, `/resumes/${result.resumeId}`],
                ["Job", result.jobId, `/jobs/${result.jobId}`],
                ["Analysis", result.analysisId, `/analyses/${result.analysisId}`],
                ["Rewrite", result.rewriteId, `/rewrites/${result.rewriteId}`],
              ].map(([label, value, href]) => (
                <Link
                  className="block border-2 border-slate-950 bg-white p-5 shadow-[5px_5px_0_#0f172a] transition hover:-translate-y-0.5"
                  href={href}
                  key={label}
                >
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-600">{label}</p>
                  <p className="mt-3 break-all text-sm font-black">{value}</p>
                  <p className="mt-3 font-mono text-xs font-bold uppercase tracking-widest">Open detail</p>
                </Link>
              ))}
            </section>

            <section className="border-2 border-slate-950 bg-slate-950 p-6 text-white shadow-[8px_8px_0_#95a36a]">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h2 className="font-mono text-xl font-bold">Markdown export</h2>
                  <p className="mt-2 break-all text-sm leading-6 text-white/80">{result.export.objectKey}</p>
                  <p className="mt-2 font-mono text-xs uppercase tracking-widest text-white/70">
                    Expires {new Date(result.export.downloadUrlExpiresAt).toLocaleString()}
                  </p>
                </div>
                <a
                  className="border-2 border-white bg-white px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider text-slate-950 shadow-[5px_5px_0_#95a36a]"
                  href={result.export.downloadUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  Download Markdown
                </a>
              </div>
            </section>
          </div>
        ) : null}
      </section>
    </main>
  );
}
