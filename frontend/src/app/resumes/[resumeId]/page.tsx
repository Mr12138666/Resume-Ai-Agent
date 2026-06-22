"use client";

import Link from "next/link";
import { use, useEffect, useState } from "react";
import { type ResumeResponse, getResume, structureResume } from "@/lib/api/client";

export default function ResumeDetailPage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const { resumeId } = use(params);
  const [resume, setResume] = useState<ResumeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isStructuring, setIsStructuring] = useState(false);

  async function loadResume() {
    setIsLoading(true);
    setError(null);
    try {
      setResume(await getResume(resumeId));
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "简历详情加载失败。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadResume();
  }, [resumeId]);

  async function handleStructure() {
    setIsStructuring(true);
    setError(null);
    try {
      setResume(await structureResume(resumeId));
    } catch (structureError) {
      setError(structureError instanceof Error ? structureError.message : "简历结构化失败。");
    } finally {
      setIsStructuring(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8f5eb,#edf3dc_55%,#dfe8df)] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.35em] text-slate-600">简历文件</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              查看解析文本和结构化抽取结果。
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
          <p className="mt-8 border-2 border-slate-950 bg-white p-6 font-mono">正在加载简历...</p>
        ) : null}

        {resume ? (
          <div className="mt-8 space-y-8">
            <section className="grid gap-4 md:grid-cols-4">
              {[
                ["状态", resume.status],
                ["文本长度", resume.rawTextLength],
                ["创建时间", new Date(resume.createdAt).toLocaleDateString()],
                ["更新时间", new Date(resume.updatedAt).toLocaleDateString()],
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
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-600">源文件</p>
                  <h2 className="mt-2 text-2xl font-black">{resume.title}</h2>
                  <p className="mt-2 break-all text-sm leading-6 text-slate-700">
                    {resume.originalFilename} · {resume.contentType}
                  </p>
                </div>
                <button
                  className="border-2 border-slate-950 bg-slate-950 px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[5px_5px_0_#ffffff] disabled:opacity-60"
                  disabled={isStructuring}
                  onClick={handleStructure}
                  type="button"
                >
                  {isStructuring ? "结构化中..." : "生成 JSON"}
                </button>
              </div>
            </section>

            <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <section className="border-2 border-slate-950 bg-white p-6 shadow-[8px_8px_0_#0f172a]">
                <h2 className="font-mono text-xl font-bold">解析文本预览</h2>
                <pre className="mt-5 max-h-[36rem] overflow-auto whitespace-pre-wrap border-2 border-slate-950 bg-[#f8f5eb] p-5 text-sm leading-6">
                  {resume.rawTextPreview || "暂无文本预览。"}
                </pre>
              </section>

              <section className="border-2 border-slate-950 bg-slate-950 p-6 text-white shadow-[8px_8px_0_#95a36a]">
                <h2 className="font-mono text-xl font-bold">结构化 JSON</h2>
                {resume.structuredJson ? (
                  <pre className="mt-5 max-h-[36rem] overflow-auto whitespace-pre-wrap border-2 border-white/80 bg-white/10 p-5 text-xs leading-5">
                    {formatJson(resume.structuredJson)}
                  </pre>
                ) : (
                  <p className="mt-5 leading-7 text-white/80">
                    暂无结构化简历 JSON。点击结构化后会调用 AI 结构化网关。
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
