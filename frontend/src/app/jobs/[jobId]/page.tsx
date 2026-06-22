"use client";

import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader, MetricCard } from "@/components/ui/card";
import {
  type AnalysisResponse,
  type JobDescriptionResponse,
  type ResumeResponse,
  createAnalysis,
  getJobDescription,
  listResumes,
  structureJob,
} from "@/lib/api/client";
import { formatDate, formatJson } from "@/lib/format";

export default function JobDetailPage({ params }: { params: Promise<{ jobId: string }> }) {
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
      const [loadedJob, loadedResumes] = await Promise.all([getJobDescription(jobId), listResumes()]);
      setJob(loadedJob);
      setResumes(loadedResumes);
      setSelectedResumeId((current) => current || loadedResumes[0]?.id || "");
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "岗位详情加载失败。");
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
      setError(structureError instanceof Error ? structureError.message : "岗位结构化失败。");
    } finally {
      setIsStructuring(false);
    }
  }

  async function handleCreateAnalysis() {
    if (!selectedResumeId) {
      setError("请先选择一份简历，再创建匹配分析。");
      return;
    }
    setIsAnalyzing(true);
    setError(null);
    setCreatedAnalysis(null);
    try {
      setCreatedAnalysis(await createAnalysis({ resumeId: selectedResumeId, jobId, useRag }));
    } catch (analysisError) {
      setError(analysisError instanceof Error ? analysisError.message : "匹配分析创建失败。");
    } finally {
      setIsAnalyzing(false);
    }
  }

  return (
    <AppShell
      actions={
        <>
          <ButtonLink href="/dashboard" tone="paper">工作台</ButtonLink>
          <ButtonLink href="/upload" tone="gold">新建 Tailor</ButtonLink>
        </>
      }
      description="岗位详情页用于查看 JD 原文、生成结构化 Job Requirement JSON，并快速选择简历创建匹配报告。"
      eyebrow="Job Description"
      title={job?.title || "目标岗位"}
    >
      {error ? <p className="mb-6 border border-black bg-[#dc2626] p-4 font-mono text-sm font-bold uppercase text-white shadow-sw-sm">{error}</p> : null}
      {isLoading ? <p className="border border-black bg-[#f0f0e8] p-6 font-mono font-bold uppercase shadow-sw-sm">正在加载岗位...</p> : null}

      {job ? (
        <div className="space-y-6">
          <section className="grid gap-4 md:grid-cols-4">
            <MetricCard label="状态" value={job.status} tone="lime" />
            <MetricCard label="公司" value={job.company || "未知"} tone="paper" />
            <MetricCard label="创建" value={formatDate(job.createdAt)} tone="sky" />
            <MetricCard label="更新" value={formatDate(job.updatedAt)} tone="gold" />
          </section>

          <Card tone="lime">
            <CardHeader
              action={
                <Button disabled={isStructuring} onClick={handleStructure} tone="ink" type="button">
                  {isStructuring ? "结构化中" : "生成 JD JSON"}
                </Button>
              }
              eyebrow="Create Analysis"
              title="基于该 JD 创建匹配分析"
              description="这条支线保留参考项目从岗位进入定制流程的能力。"
            />
            <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto]">
              <label className="block font-mono text-xs font-black uppercase tracking-[0.18em]">
                选择简历
                <select
                  className="mt-2 w-full rounded-none border border-black bg-[#f0f0e8] px-4 py-3 outline-none focus:bg-[#e5e5e0] focus:ring-2 focus:ring-[#1d4ed8]"
                  value={selectedResumeId}
                  onChange={(event) => setSelectedResumeId(event.target.value)}
                >
                  {resumes.length > 0 ? (
                    resumes.map((resume) => (
                      <option key={resume.id} value={resume.id}>{resume.title} · {resume.status}</option>
                    ))
                  ) : (
                    <option value="">暂无简历</option>
                  )}
                </select>
              </label>
              <div className="flex flex-col justify-end gap-3">
                <label className="flex items-center gap-2 font-mono text-xs font-black uppercase tracking-[0.16em]">
                  <input checked={useRag} className="h-4 w-4 accent-[#1d4ed8]" onChange={(event) => setUseRag(event.target.checked)} type="checkbox" />
                  使用 RAG
                </label>
                <Button disabled={isAnalyzing || !selectedResumeId} onClick={handleCreateAnalysis} tone="ink" type="button">
                  {isAnalyzing ? "分析中" : "创建分析"}
                </Button>
              </div>
            </div>
            {createdAnalysis ? (
              <div className="mt-5 border border-black bg-[#f0f0e8] p-5 shadow-sw-xs">
                <p className="font-mono text-xs font-bold uppercase tracking-wide text-[#1d4ed8]">分析已创建</p>
                <p className="mt-2 text-3xl font-black">综合得分 {createdAnalysis.overallScore}</p>
                <ButtonLink className="mt-4" href={`/analyses/${createdAnalysis.id}`} tone="ink">打开报告</ButtonLink>
              </div>
            ) : null}
          </Card>

          <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
            <Card tone="paper">
              <CardHeader eyebrow="JD Text" title="岗位原文" description="建议粘贴完整职责、任职要求和加分项，以便关键词提取更稳定。" />
              <pre className="panel-scroll mt-5 max-h-[42rem] overflow-auto whitespace-pre-wrap border border-black bg-[#e5e5e0] p-5 font-mono text-sm leading-7">
                {job.description}
              </pre>
            </Card>
            <Card tone="ink">
              <CardHeader eyebrow="Structured JSON" title="岗位结构化结果" description="结构化 JD 会帮助后续分析识别职责、技能和优先级。" />
              {job.structuredJson ? (
                <pre className="panel-scroll mt-5 max-h-[42rem] overflow-auto whitespace-pre-wrap border border-white/80 bg-white/10 p-5 font-mono text-xs leading-5 text-white">
                  {formatJson(job.structuredJson)}
                </pre>
              ) : (
                <p className="mt-5 border border-white/60 bg-white/10 p-5 font-mono text-xs uppercase leading-5 text-white/75">暂无结构化 JSON。点击按钮后调用中文 JD 解析提示词。</p>
              )}
            </Card>
          </section>
        </div>
      ) : null}
    </AppShell>
  );
}
