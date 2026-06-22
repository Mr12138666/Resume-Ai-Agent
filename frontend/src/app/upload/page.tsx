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
      setError("请先选择 PDF、DOCX 或 TXT 简历文件。");
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
      setError(uploadError instanceof Error ? uploadError.message : "简历上传失败。");
    } finally {
      setIsUploading(false);
    }
  }

  async function handleAnalysis(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!resume) {
      setError("请先上传并解析简历，再创建匹配分析。");
      return;
    }
    if (!jobDescription.trim()) {
      setError("请先粘贴目标岗位 JD，再创建匹配分析。");
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
      setError(analysisError instanceof Error ? analysisError.message : "匹配分析失败。");
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
      setError(rewriteError instanceof Error ? rewriteError.message : "简历改写失败。");
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
      setError(structureError instanceof Error ? structureError.message : "简历结构化失败。");
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
      setError(structureError instanceof Error ? structureError.message : "岗位结构化失败。");
    } finally {
      setIsStructuringJob(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f5eb] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <p className="font-mono text-sm uppercase tracking-[0.3em] text-slate-600">简历优化流程</p>
        <h1 className="mt-4 max-w-4xl text-4xl font-black md:text-6xl">
          上传简历、匹配 JD，并拿到第一轮优化建议。
        </h1>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="border-2 border-slate-950 bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a]" href="/dashboard">
            工作台
          </Link>
          <Link className="border-2 border-slate-950 bg-[#eef4dd] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a]" href="/knowledge">
            RAG 知识库
          </Link>
        </div>

        {error ? (
          <p className="mt-6 border-2 border-red-900 bg-red-50 p-4 text-red-900">{error}</p>
        ) : null}

        {analysis || rewrite ? (
          <section className="mt-6 border-2 border-slate-950 bg-slate-950 p-5 text-white shadow-[6px_6px_0_#95a36a]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="font-mono text-xs font-bold uppercase tracking-[0.25em] text-white/70">
                  下一步
                </p>
                <h2 className="mt-2 text-2xl font-black">
                  {rewrite ? "改写草稿已生成，可以检查并导出。" : "匹配分析已生成，可以进入完整报告。"}
                </h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
                  进入详情页可以查看证据链、继续智能体改写，并导出 Markdown 成果。
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                {analysis ? (
                  <Link
                    className="border-2 border-white bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 shadow-[4px_4px_0_#95a36a]"
                    href={`/analyses/${analysis.id}`}
                  >
                    打开分析报告
                  </Link>
                ) : null}
                {rewrite ? (
                  <Link
                    className="border-2 border-white bg-[#f6d875] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-slate-950 shadow-[4px_4px_0_#95a36a]"
                    href={`/rewrites/${rewrite.id}`}
                  >
                    查看并导出
                  </Link>
                ) : null}
              </div>
            </div>
          </section>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <form
            className="border-2 border-slate-950 bg-white p-8 shadow-[8px_8px_0_#0f172a]"
            onSubmit={handleResumeUpload}
          >
            <h2 className="font-mono text-xl font-bold">1. 上传简历</h2>
            <p className="mt-4 text-slate-700">
              后端会把原始文件保存到 MinIO，用 Apache Tika 提取文本，并把解析内容写入 PostgreSQL。
            </p>

            <label className="mt-8 block font-mono text-sm font-bold uppercase tracking-widest">
              简历标题
              <input
                className="mt-3 w-full border-2 border-slate-950 px-4 py-3 font-serif text-base outline-none focus:bg-[#eef4dd]"
                placeholder="Java 后端简历"
                value={resumeTitle}
                onChange={(event) => setResumeTitle(event.target.value)}
              />
            </label>

            <label className="mt-6 block font-mono text-sm font-bold uppercase tracking-widest">
              简历文件
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
              {isUploading ? "解析中..." : "上传并解析"}
            </button>
          </form>

          <form
            className="border-2 border-slate-950 bg-[#eef4dd] p-8 shadow-[8px_8px_0_#95a36a]"
            onSubmit={handleAnalysis}
          >
            <h2 className="font-mono text-xl font-bold">2. 粘贴目标 JD</h2>
            <p className="mt-4 text-slate-700">
              系统会创建岗位记录，并基于解析后的简历生成透明的关键词与证据匹配结果。
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="block font-mono text-sm font-bold uppercase tracking-widest">
                岗位名称
                <input
                  className="mt-3 w-full border-2 border-slate-950 px-4 py-3 font-serif text-base outline-none focus:bg-white"
                  placeholder="Java 后端工程师"
                  value={jobTitle}
                  onChange={(event) => setJobTitle(event.target.value)}
                />
              </label>
              <label className="block font-mono text-sm font-bold uppercase tracking-widest">
                公司
                <input
                  className="mt-3 w-full border-2 border-slate-950 px-4 py-3 font-serif text-base outline-none focus:bg-white"
                  placeholder="目标公司"
                  value={company}
                  onChange={(event) => setCompany(event.target.value)}
                />
              </label>
            </div>

            <label className="mt-6 block font-mono text-sm font-bold uppercase tracking-widest">
              岗位 JD
              <textarea
                className="mt-3 min-h-52 w-full border-2 border-slate-950 px-4 py-3 font-serif text-base leading-7 outline-none focus:bg-white"
                placeholder="在这里粘贴完整 JD..."
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
                  使用 RAG 建议
                </span>
                <span className="mt-1 block text-sm leading-6 text-slate-700">
                  从知识库检索已索引的简历优化规则，并加入分析建议。
                </span>
              </span>
            </label>

            <button
              className="mt-8 border-2 border-slate-950 bg-slate-950 px-6 py-3 font-mono font-bold uppercase tracking-wider text-white shadow-[6px_6px_0_#ffffff] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isAnalyzing || !resume}
              type="submit"
            >
              {isAnalyzing ? "分析中..." : "创建匹配分析"}
            </button>
          </form>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <section className="border-2 border-slate-950 bg-white p-8">
            <h2 className="font-mono text-xl font-bold">简历解析结果</h2>
            {resume ? (
              <div className="mt-6 space-y-4">
                <dl className="grid grid-cols-2 gap-3 font-mono text-sm">
                  <dt className="text-slate-600">状态</dt>
                  <dd className="font-bold">{resume.status}</dd>
                  <dt className="text-slate-600">文件</dt>
                  <dd className="break-all font-bold">{resume.originalFilename}</dd>
                  <dt className="text-slate-600">文本长度</dt>
                  <dd className="font-bold">{resume.rawTextLength}</dd>
                </dl>
                <Link
                  className="inline-block border-2 border-slate-950 bg-[#eef4dd] px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a]"
                  href={`/resumes/${resume.id}`}
                >
                  打开简历详情
                </Link>
                <pre className="max-h-80 overflow-auto whitespace-pre-wrap border-2 border-slate-950 bg-[#f8f5eb] p-4 text-sm leading-6">
                  {resume.rawTextPreview || "暂未提取到文本。"}
                </pre>
                <button
                  className="border-2 border-slate-950 bg-white px-4 py-2 font-mono text-sm font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a] disabled:opacity-60"
                  disabled={isStructuringResume}
                  onClick={handleStructureResume}
                  type="button"
                >
                  {isStructuringResume ? "结构化中..." : "生成简历 JSON"}
                </button>
                {resume.structuredJson ? (
                  <pre className="max-h-80 overflow-auto whitespace-pre-wrap border-2 border-slate-950 bg-slate-950 p-4 text-xs leading-5 text-white">
                    {JSON.stringify(JSON.parse(resume.structuredJson), null, 2)}
                  </pre>
                ) : null}
              </div>
            ) : (
              <p className="mt-6 leading-7 text-slate-700">上传简历后，这里会显示解析出的文本预览。</p>
            )}
          </section>

          <section className="border-2 border-slate-950 bg-white p-8">
            <h2 className="font-mono text-xl font-bold">匹配分析结果</h2>
            {analysis ? (
              <div className="mt-6 space-y-6">
                {job ? (
                  <div className="border-2 border-slate-950 bg-[#eef4dd] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-widest text-slate-600">岗位记录</p>
                        <p className="font-bold">{job.title || "未命名岗位"}</p>
                      </div>
                      <Link
                        className="border-2 border-slate-950 bg-[#f8f5eb] px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a]"
                        href={`/jobs/${job.id}`}
                      >
                        打开 JD
                      </Link>
                      <button
                        className="border-2 border-slate-950 bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a] disabled:opacity-60"
                        disabled={isStructuringJob}
                        onClick={handleStructureJob}
                        type="button"
                      >
                        {isStructuringJob ? "结构化中..." : "生成 JD JSON"}
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
                    ["综合", analysis.overallScore],
                    ["关键词", analysis.keywordScore],
                    ["语义", analysis.semanticScore],
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
                  打开完整分析
                </Link>

                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-widest">缺失关键词</h3>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {analysis.report.missingKeywords.slice(0, 16).map((keyword) => (
                      <span key={keyword} className="border border-slate-950 bg-red-50 px-2 py-1 font-mono text-xs">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-widest">优化建议</h3>
                  <ul className="mt-3 space-y-2">
                    {analysis.report.suggestions.map((suggestion) => (
                      <li key={suggestion} className="border-l-4 border-slate-950 bg-[#f8f5eb] px-4 py-2">
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3 className="font-mono text-sm font-bold uppercase tracking-widest">RAG 检索建议</h3>
                  {analysis.report.retrievedGuidance.length > 0 ? (
                    <ul className="mt-3 space-y-2">
                      {analysis.report.retrievedGuidance.map((guidance) => (
                        <li key={guidance} className="border-2 border-slate-950 bg-white px-4 py-3 text-sm leading-6">
                          {guidance}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-3 text-slate-600">暂未检索到建议。请先在知识库中索引文档以启用 RAG 上下文。</p>
                  )}
                </div>

                <div className="border-2 border-slate-950 bg-[#eef4dd] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-mono text-sm font-bold uppercase tracking-widest">智能体改写</h3>
                      <p className="mt-1 text-sm text-slate-700">使用 DeepSeek、工具调用和 RAG 建议生成忠于事实的改写草稿。</p>
                    </div>
                    <button
                      className="border-2 border-slate-950 bg-slate-950 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[4px_4px_0_#ffffff] disabled:opacity-60"
                      disabled={isRewriting}
                      onClick={handleRewrite}
                      type="button"
                    >
                      {isRewriting ? "改写中..." : "智能体改写"}
                    </button>
                  </div>
                  {rewrite ? (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <div>
                        <p className="font-mono text-xs font-bold uppercase tracking-widest">原文</p>
                        <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap border-2 border-slate-950 bg-white p-4 text-xs leading-5">
                          {rewrite.originalText}
                        </pre>
                      </div>
                      <div>
                        <p className="font-mono text-xs font-bold uppercase tracking-widest">改写后</p>
                        <pre className="mt-2 max-h-72 overflow-auto whitespace-pre-wrap border-2 border-slate-950 bg-slate-950 p-4 text-xs leading-5 text-white">
                          {rewrite.rewrittenText}
                        </pre>
                      </div>
                      <div className="md:col-span-2">
                        <p className="font-mono text-xs font-bold uppercase tracking-widest">改写理由</p>
                        <p className="mt-2 border-2 border-slate-950 bg-white p-4 text-sm leading-6">{rewrite.rationale}</p>
                      </div>
                      <div className="md:col-span-2">
                        <Link
                          className="inline-block border-2 border-slate-950 bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a]"
                          href={`/rewrites/${rewrite.id}`}
                        >
                          打开改写并导出
                        </Link>
                      </div>
                    </div>
                  ) : null}
                </div>
              </div>
            ) : (
              <p className="mt-6 leading-7 text-slate-700">
                上传简历并提交 JD 后，这里会显示匹配分数和第一轮优化建议。
              </p>
            )}
          </section>
        </div>
      </section>
    </main>
  );
}
