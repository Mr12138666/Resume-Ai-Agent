"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import {
  type AnalysisResponse,
  type JobDescriptionResponse,
  type ResumeResponse,
  createAnalysis,
  getJobDescription,
  listResumes,
  structureJob,
} from "@/lib/api/client";

export default function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = use(params);
  const [job, setJob] = useState<JobDescriptionResponse | null>(null);
  const [resumes, setResumes] = useState<ResumeResponse[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [createdAnalysis, setCreatedAnalysis] = useState<AnalysisResponse | null>(null);
  const [useRag, setUseRag] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStructuring, setIsStructuring] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  async function loadJob() {
    setIsLoading(true);
    setError(null);
    try {
      const [loadedJob, loadedResumes] = await Promise.all([
        getJobDescription(jobId),
        listResumes(),
      ]);
      setJob(loadedJob);
      setResumes(loadedResumes);
      setSelectedResumeId((current) => current || loadedResumes[0]?.id || "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Failed to load job.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadJob();
  }, [jobId]);

  async function handleStructure() {
    setIsStructuring(true);
    setError(null);
    try {
      setJob(await structureJob(jobId));
    } catch (structureError) {
      setError(structureError instanceof Error ? structureError.message : "Job structuring failed.");
    } finally {
      setIsStructuring(false);
    }
  }

  async function handleCreateAnalysis() {
    if (!selectedResumeId) {
      setError("Choose a resume before creating analysis.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setCreatedAnalysis(null);
    try {
      setCreatedAnalysis(await createAnalysis({
        resumeId: selectedResumeId,
        jobId,
        useRag,
      }));
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Analysis creation failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#dce8c4,transparent_24rem),linear-gradient(135deg,#f8f5eb,#e7eee0)] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.35em] text-slate-600">Target Job</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              Requirements, structure, and resume match launchpad.
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
          <p className="mt-8 border-2 border-slate-950 bg-white p-6 font-mono">Loading job...</p>
        ) : null}

        {job ? (
          <div className="mt-8 space-y-8">
            <section className="grid gap-4 md:grid-cols-4">
              {[
                ["Status", job.status],
                ["Company", job.company || "Unknown"],
                ["Created", new Date(job.createdAt).toLocaleDateString()],
                ["Updated", new Date(job.updatedAt).toLocaleDateString()],
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
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-600">Role</p>
                  <h2 className="mt-2 text-2xl font-black">{job.title || "Untitled role"}</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-700">
                    Structure this JD before analysis when you want an inspectable requirement JSON artifact.
                  </p>
                </div>
                <button
                  className="border-2 border-slate-950 bg-slate-950 px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[5px_5px_0_#ffffff] disabled:opacity-60"
                  disabled={isStructuring}
                  onClick={handleStructure}
                  type="button"
                >
                  {isStructuring ? "Structuring..." : "Structure JSON"}
                </button>
              </div>
            </section>

            <section className="border-2 border-slate-950 bg-white p-6 shadow-[8px_8px_0_#0f172a]">
              <h2 className="font-mono text-xl font-bold">Create analysis from this JD</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
                <label className="block font-mono text-sm font-bold uppercase tracking-widest">
                  Resume
                  <select
                    className="mt-3 w-full border-2 border-slate-950 bg-white px-4 py-3 font-serif text-base outline-none focus:bg-[#eef4dd]"
                    value={selectedResumeId}
                    onChange={(event) => setSelectedResumeId(event.target.value)}
                  >
                    {resumes.length > 0 ? (
                      resumes.map((resume) => (
                        <option key={resume.id} value={resume.id}>
                          {resume.title} · {resume.status}
                        </option>
                      ))
                    ) : (
                      <option value="">No resumes available</option>
                    )}
                  </select>
                </label>
                <div className="flex flex-col justify-end gap-3">
                  <label className="flex items-center gap-2 font-mono text-xs font-bold uppercase tracking-widest">
                    <input
                      checked={useRag}
                      className="h-4 w-4 accent-slate-950"
                      onChange={(event) => setUseRag(event.target.checked)}
                      type="checkbox"
                    />
                    Use RAG
                  </label>
                  <button
                    className="border-2 border-slate-950 bg-slate-950 px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[5px_5px_0_#95a36a] disabled:opacity-60"
                    disabled={isAnalyzing || !selectedResumeId}
                    onClick={handleCreateAnalysis}
                    type="button"
                  >
                    {isAnalyzing ? "Analyzing..." : "Create analysis"}
                  </button>
                </div>
              </div>
              {createdAnalysis ? (
                <div className="mt-5 border-2 border-slate-950 bg-[#f8f5eb] p-5">
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-600">Analysis created</p>
                  <p className="mt-2 text-xl font-black">Overall score {createdAnalysis.overallScore}</p>
                  <Link
                    className="mt-4 inline-block border-2 border-slate-950 bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a]"
                    href={`/analyses/${createdAnalysis.id}`}
                  >
                    Open analysis
                  </Link>
                </div>
              ) : null}
            </section>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <section className="border-2 border-slate-950 bg-white p-6 shadow-[8px_8px_0_#0f172a]">
                <h2 className="font-mono text-xl font-bold">Job description</h2>
                <pre className="mt-5 max-h-[36rem] overflow-auto whitespace-pre-wrap border-2 border-slate-950 bg-[#f8f5eb] p-5 text-sm leading-6">
                  {job.description}
                </pre>
              </section>

              <section className="border-2 border-slate-950 bg-slate-950 p-6 text-white shadow-[8px_8px_0_#95a36a]">
                <h2 className="font-mono text-xl font-bold">Structured JSON</h2>
                {job.structuredJson ? (
                  <pre className="mt-5 max-h-[36rem] overflow-auto whitespace-pre-wrap border-2 border-white/80 bg-white/10 p-5 text-xs leading-5">
                    {formatJson(job.structuredJson)}
                  </pre>
                ) : (
                  <p className="mt-5 leading-7 text-white/80">
                    No structured JD JSON yet. Run structure extraction to inspect parsed requirements.
                  </p>
                )}
              </section>
            </div>
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
