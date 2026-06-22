"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";
import {
  type AnalysisResponse,
  type JobDescriptionResponse,
  type ResumeResponse,
  type RewriteDraftResponse,
  createAnalysis,
  createRewrite,
  createJobDescription,
  structureJob,
  structureResume,
  uploadResume,
} from "@/lib/api/client";

export default function UploadPage() {
  const [resumeTitle, setResumeTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [useRag, setUseRag] = useState(true);
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [job, setJob] = useState<JobDescriptionResponse | null>(null);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [rewrite, setRewrite] = useState<RewriteDraftResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isRewriting, setIsRewriting] = useState(false);
  const [isStructuringResume, setIsStructuringResume] = useState(false);
  const [isStructuringJob, setIsStructuringJob] = useState(false);

  async function handleResumeUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!file) {
      setError("Choose a PDF, DOCX, or TXT resume first.");
      return;
    }

    setIsUploading(true);
    setError(null);
    setResume(null);
    setJob(null);
    setAnalysis(null);
    setRewrite(null);

    try {
      const uploaded = await uploadResume(file, resumeTitle);
      setResume(uploaded);
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Resume upload failed.");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resume) {
      setError("Upload and parse a resume before creating an analysis.");
      return;
    }
    if (!jobDescription.trim()) {
      setError("Paste a target job description before creating an analysis.");
      return;
    }

    setIsAnalyzing(true);
    setError(null);
    setAnalysis(null);

    try {
      const job = await createJobDescription({
        title: jobTitle,
        company,
        description: jobDescription,
      });
      setJob(job);
      const createdAnalysis = await createAnalysis({
        resumeId: resume.id,
        jobId: job.id,
        useRag,
      });
      setAnalysis(createdAnalysis);
      setRewrite(null);
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "Analysis failed.");
    } finally {
      setIsAnalyzing(false);
    }
  }

  async function handleRewrite() {
    if (!analysis || !resume) {
      return;
    }
    setIsRewriting(true);
    setError(null);
    setRewrite(null);
    try {
      const createdRewrite = await createRewrite({
        analysisId: analysis.id,
        sectionId: "parsed-preview",
        sectionText: resume.rawTextPreview,
      });
      setRewrite(createdRewrite);
    } catch (rewriteError) {
      setError(rewriteError instanceof Error ? rewriteError.message : "Rewrite failed.");
    } finally {
      setIsRewriting(false);
    }
  }

  async function handleStructureResume() {
    if (!resume) {
      return;
    }
    setIsStructuringResume(true);
    setError(null);
    try {
      setResume(await structureResume(resume.id));
    } catch (structureError) {
      setError(structureError instanceof Error ? structureError.message : "Resume structuring failed.");
    } finally {
      setIsStructuringResume(false);
    }
  }

  async function handleStructureJob() {
    if (!job) {
      return;
    }
    setIsStructuringJob(true);
    setError(null);
    try {
      setJob(await structureJob(job.id));
    } catch (structureError) {
      setError(structureError instanceof Error ? structureError.message : "Job structuring failed.");
    } finally {
      setIsStructuringJob(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f5eb] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-slate-600">MVP Workflow</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black md:text-6xl">
          Resume parsing, JD matching, and first-pass optimization signals.
        </h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="border-2 border-slate-950 bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a]" href="/dashboard">
            Dashboard
          </Link>
          <Link className="border-2 border-slate-950 bg-[#eef4dd] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a]" href="/knowledge">
            RAG Workbench
          </Link>
        </div>

        {error ? (
          <p className="mt-6 border-2 border-red-900 bg-red-50 p-4 text-red-900">{error}</p>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <form
            className="border-2 border-slate-950 bg-white p-8 shadow-[8px_8px_0_#0f172a]"
            onSubmit={handleResumeUpload}
          >
            <h2 className="font-mono text-xl font-bold">1. Upload resume</h2>
            <p className="mt-4 text-slate-700">
              The backend stores the raw file in MinIO, extracts text with Apache Tika, and saves parsed content in PostgreSQL.
            </p>

            <label className="mt-8 block font-mono text-sm font-bold uppercase tracking-widest">
              Resume title
              <input
                className="mt-3 w-full border-2 border-slate-950 px-4 py-3 font-serif text-base outline-none focus:bg-[#eef4dd]"
                placeholder="Java Backend Resume"
                value={resumeTitle}
                onChange={(event) => setResumeTitle(event.target.value)}
              />
            </label>

            <label className="mt-6 block font-mono text-sm font-bold uppercase tracking-widest">
              Resume file
              <input
                accept=".pdf,.doc,.docx,.txt,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                className="mt-3 w-full border-2 border-dashed border-slate-950 bg-[#f8f5eb] px-4 py-6"
                type="file"
                onChange={(event) => setFile(event.target.files?.[0] ?? null)}
              />
            </label>

            <button
              className="mt-8 border-2 border-slate-950 bg-slate-950 px-6 py-3 font-mono font-bold uppercase tracking-wider text-white shadow-[6px_6px_0_#95a36a] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isUploading}
              type="submit"
            >
              {isUploading ? "Parsing..." : "Upload and parse"}
            </button>
          </form>

          <form
            className="border-2 border-slate-950 bg-[#eef4dd] p-8 shadow-[8px_8px_0_#95a36a]"
            onSubmit={handleAnalysis}
          >
            <h2 className="font-mono text-xl font-bold">2. Paste target JD</h2>
            <p className="mt-4 text-slate-700">
              This creates a job description record and runs a transparent keyword/evidence match against the parsed resume.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="block font-mono text-sm font-bold uppercase tracking-widest">
                Role title
                <input
                  className="mt-3 w-full border-2 border-slate-950 px-4 py-3 font-serif text-base outline-none focus:bg-white"
                  placeholder="Java Backend Engineer"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                />
              </label>
              <label className="block font-mono text-sm font-bold uppercase tracking-widest">
                Company
                <input
                  className="mt-3 w-full border-2 border-slate-950 px-4 py-3 font-serif text-base outline-none focus:bg-white"
                  placeholder="Target Company"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              </label>
            </div>

            <label className="mt-6 block font-mono text-sm font-bold uppercase tracking-widest">
              Job description
              <textarea
                className="mt-3 min-h-52 w-full border-2 border-slate-950 px-4 py-3 font-serif text-base leading-7 outline-none focus:bg-white"
                placeholder="Paste the full JD here..."
                value={jobDescription}
                onChange={(event) => setJobDescription(event.target.value)}
              />
            </label>

            <label className="mt-6 flex items-start gap-3 border-2 border-slate-950 bg-white/70 p-4">
              <input
                checked={useRag}
                className="mt-1 h-5 w-5 accent-slate-950"
                onChange={(event) => setUseRag(event.target.checked)}
                type="checkbox"
              />
              <span>
                <span className="block font-mono text-sm font-bold uppercase tracking-widest">
                  Use RAG guidance
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-700">
                  Retrieve indexed resume rules from the knowledge base and include them in analysis suggestions.
                </span>
              </span>
            </label>

            <button
              className="mt-8 border-2 border-slate-950 bg-slate-950 px-6 py-3 font-mono font-bold uppercase tracking-wider text-white shadow-[6px_6px_0_#ffffff] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isAnalyzing || !resume}
              type="submit"
            >
              {isAnalyzing ? "Analyzing..." : "Create analysis"}
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="border-2 border-slate-950 bg-white p-8">
            <h2 className="font-mono text-xl font-bold">Parsed resume</h2>
            {resume ? (
              <div className="mt-6 space-y-4">
                <dl className="grid grid-cols-2 gap-3 font-mono text-sm">
                  <dt className="text-slate-600">Status</dt>
                  <dd className="font-bold">{resume.status}</dd>
                  <dt className="text-slate-600">File</dt>
                  <dd className="break-all font-bold">{resume.originalFilename}</dd>
                  <dt className="text-slate-600">Text Length</dt>
                  <dd className="font-bold">{resume.rawTextLength}</dd>
                </dl>
                <Link
                  className="inline-block border-2 border-slate-950 bg-[#eef4dd] px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a]"
                  href={`/resumes/${resume.id}`}
                >
                  Open resume detail
                </Link>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap border-2 border-slate-950 bg-[#f8f5eb] p-4 text-sm leading-6">
                  {resume.rawTextPreview || "No text extracted yet."}
                </pre>
                <button
                  className="border-2 border-slate-950 bg-white px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a] disabled:opacity-60"
                  disabled={isStructuringResume}
                  onClick={handleStructureResume}
                  type="button"
                >
                  {isStructuringResume ? "Structuring..." : "Structure resume JSON"}
                </button>
                {resume.structuredJson ? (
                  <pre className="max-h-80 overflow-auto whitespace-pre-wrap border-2 border-slate-950 bg-slate-950 p-4 text-xs leading-5 text-white">
                    {JSON.stringify(JSON.parse(resume.structuredJson), null, 2)}
                  </pre>
                ) : null}
              </div>
            ) : (
              <p className="mt-6 leading-7 text-slate-700">Upload a resume to see parsed text preview.</p>
            )}
          </section>

          <section className="border-2 border-slate-950 bg-white p-8">
            <h2 className="font-mono text-xl font-bold">Analysis result</h2>
            {analysis ? (
              <div className="mt-6 space-y-6">
                {job ? (
                  <div className="border-2 border-slate-950 bg-[#eef4dd] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-widest text-slate-600">Job record</p>
                        <p className="font-bold">{job.title || "Untitled role"}</p>
                      </div>
                      <Link
                        className="border-2 border-slate-950 bg-[#f8f5eb] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a]"
                        href={`/jobs/${job.id}`}
                      >
                        Open JD
                      </Link>
                      <button
                        className="border-2 border-slate-950 bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a] disabled:opacity-60"
                        disabled={isStructuringJob}
                        onClick={handleStructureJob}
                        type="button"
                      >
                        {isStructuringJob ? "Structuring..." : "Structure JD JSON"}
                      </button>
                    </div>
                    {job.structuredJson ? (
                      <pre className="mt-4 max-h-80 overflow-auto whitespace-pre-wrap border-2 border-slate-950 bg-slate-950 p-4 text-xs leading-5 text-white">
                        {JSON.stringify(JSON.parse(job.structuredJson), null, 2)}
                      </pre>
                    ) : null}
                  </div>
                ) : null}

                <div className="grid gap-3 md:grid-cols-4">
                  {[
                    ["Overall", analysis.overallScore],
                    ["Keyword", analysis.keywordScore],
                    ["Semantic", analysis.semanticScore],
                    ["ATS", analysis.atsScore],
                  ].map(([label, score]) => (
                    <div key={label} className="border-2 border-slate-950 bg-[#eef4dd] p-4">
                      <p className="font-mono text-xs uppercase tracking-widest text-slate-600">{label}</p>
                      <p className="mt-2 text-3xl font-black">{score}</p>
                    </div>
                  ))}
                </div>
                <Link
                  className="inline-block border-2 border-slate-950 bg-slate-950 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[4px_4px_0_#95a36a]"
                  href={`/analyses/${analysis.id}`}
                >
                  Open full analysis
                </Link>

                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-widest">Missing keywords</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {analysis.report.missingKeywords.slice(0, 16).map((keyword) => (
                      <span key={keyword} className="border border-slate-950 bg-red-50 px-2 py-1 font-mono text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-widest">Suggestions</h3>
                  <ul className="mt-3 space-y-2">
                    {analysis.report.suggestions.map((suggestion) => (
                      <li key={suggestion} className="border-l-4 border-slate-950 bg-[#f8f5eb] px-4 py-2">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-widest">Retrieved RAG guidance</h3>
                  {analysis.report.retrievedGuidance.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {analysis.report.retrievedGuidance.map((guidance) => (
                        <li key={guidance} className="border-2 border-slate-950 bg-white px-4 py-3 text-sm leading-6">
                          {guidance}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-slate-600">No guidance retrieved yet. Index knowledge documents to enable RAG context.</p>
                  )}
                </div>

                <div className="border-2 border-slate-950 bg-[#eef4dd] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-mono text-sm font-bold uppercase tracking-widest">Agent rewrite</h3>
                      <p className="mt-1 text-sm text-slate-700">Generate a faithful rewrite draft using DeepSeek, tools, and RAG guidance.</p>
                    </div>
                    <button
                      className="border-2 border-slate-950 bg-slate-950 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[4px_4px_0_#ffffff] disabled:opacity-60"
                      disabled={isRewriting}
                      onClick={handleRewrite}
                      type="button"
                    >
                      {isRewriting ? "Rewriting..." : "Rewrite with Agent"}
                    </button>
                  </div>
                  {rewrite ? (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="font-mono text-xs font-bold uppercase tracking-widest">Original</p>
                        <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap border-2 border-slate-950 bg-white p-4 text-xs leading-5">
                          {rewrite.originalText}
                        </pre>
                      </div>
                      <div>
                        <p className="font-mono text-xs font-bold uppercase tracking-widest">Rewritten</p>
                        <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap border-2 border-slate-950 bg-slate-950 p-4 text-xs leading-5 text-white">
                          {rewrite.rewrittenText}
                        </pre>
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-mono text-xs font-bold uppercase tracking-widest">Rationale</p>
                        <p className="mt-2 border-2 border-slate-950 bg-white p-4 text-sm leading-6">{rewrite.rationale}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Link
                          className="inline-block border-2 border-slate-950 bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a]"
                          href={`/rewrites/${rewrite.id}`}
                        >
                          Open rewrite and export
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="mt-6 leading-7 text-slate-700">
                After uploading a resume and submitting a JD, match scores and first-pass suggestions will appear here.
              </p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
