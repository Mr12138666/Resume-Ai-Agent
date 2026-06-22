"use client";

import { use, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { AnalysisPreviewStrip } from "@/components/comparison-panels";
import { EvidenceMatrix, KeywordCloud } from "@/components/keyword-panels";
import { ScoreRing } from "@/components/score-ring";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  type AnalysisResponse,
  type RewriteDraftResponse,
  createRewrite,
  getAnalysis,
} from "@/lib/api/client";
import { formatDateTime } from "@/lib/format";

export default function AnalysisDetailPage({ params }: { params: Promise<{ analysisId: string }> }) {
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
      setError(loadError instanceof Error ? loadError.message : "分析报告加载失败。");
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
      setRewrite(await createRewrite({ analysisId: analysis.id, sectionId: "analysis-report" }));
    } catch (rewriteError) {
      setError(rewriteError instanceof Error ? rewriteError.message : "改写生成失败。");
    } finally {
      setIsRewriting(false);
    }
  }

  return (
    <AppShell
      actions={
        <>
          <ButtonLink href="/dashboard" tone="paper">工作台</ButtonLink>
          <ButtonLink href="/upload" tone="gold">继续 Tailor</ButtonLink>
        </>
      }
      description="按照参考项目的报告视角，把分数、关键词缺口、证据链、RAG 建议和智能体改写动作放在同一张检查单里。"
      eyebrow="Analysis Report"
      title="匹配报告不是结论，是改写前的证据清单。"
    >
      {error ? <p className="mb-6 border-2 border-[#171713] bg-[#f2b8ad] p-4 font-bold">{error}</p> : null}
      {isLoading ? <p className="border-2 border-[#171713] bg-[#fffaf0] p-6 font-mono font-black">正在加载分析报告...</p> : null}

      {analysis ? (
        <div className="space-y-6">
          <section className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
            <Card tone="lime">
              <CardHeader
                action={<span className="border-2 border-[#171713] bg-white px-3 py-1 font-mono text-xs font-black">{analysis.status}</span>}
                eyebrow="Score"
                title="整体匹配"
                description={`创建时间：${formatDateTime(analysis.createdAt)}。分数来自关键词覆盖、语义相关性和 ATS 可读性。`}
              />
              <div className="mt-5">
                <ScoreRing label="综合得分" score={analysis.overallScore} />
              </div>
            </Card>
            <Card tone="paper">
              <CardHeader
                action={
                  <Button disabled={isRewriting} onClick={handleRewrite} tone="ink" type="button">
                    {isRewriting ? "改写中" : "创建改写"}
                  </Button>
                }
                eyebrow="Action"
                title="下一步：生成可确认的改写草稿"
                description="智能体会使用分析结果、缺失关键词和 RAG 建议生成中文段落改写，并附带事实校验 JSON。"
              />
              <div className="mt-5">
                <AnalysisPreviewStrip analysis={analysis} />
              </div>
              {rewrite ? (
                <div className="mt-5 border-2 border-[#171713] bg-[#d8e89b] p-4">
                  <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#6f746d]">草稿已生成</p>
                  <p className="mt-2 line-clamp-3 text-sm leading-6">{rewrite.rewrittenText}</p>
                  <ButtonLink className="mt-4" href={`/rewrites/${rewrite.id}`} tone="ink">打开草稿</ButtonLink>
                </div>
              ) : null}
            </Card>
          </section>

          <section className="grid gap-6 lg:grid-cols-2">
            <Card tone="paper">
              <CardHeader eyebrow="Matched" title="已匹配关键词" description="这些词在简历文本中有证据或高度相关表达。" />
              <div className="mt-5">
                <KeywordCloud keywords={analysis.report.matchedKeywords} tone="matched" />
              </div>
            </Card>
            <Card tone="gold">
              <CardHeader eyebrow="Missing" title="缺失关键词" description="优先判断是否有真实经历可补充，没有证据时只做表达重构，不编造。" />
              <div className="mt-5">
                <KeywordCloud keywords={analysis.report.missingKeywords} tone="missing" />
              </div>
            </Card>
          </section>

          <Card tone="paper">
            <CardHeader eyebrow="Suggestions" title="优化建议" description="建议会尽量保持中文、可执行、面向简历段落修改。" />
            <ol className="mt-5 grid gap-3 md:grid-cols-2">
              {analysis.report.suggestions.map((suggestion, index) => (
                <li className="border-2 border-[#171713] bg-[#f5f0df] p-4 text-sm leading-7" key={`${suggestion}-${index}`}>
                  <span className="mr-2 font-mono text-xs font-black">#{index + 1}</span>
                  {suggestion}
                </li>
              ))}
            </ol>
          </Card>

          <Card tone="sky">
            <CardHeader eyebrow="Evidence Map" title="证据映射" description="参考项目强调可预览差异，我们这里先把每个关键词和证据关系展开。" />
            <div className="mt-5">
              <EvidenceMatrix evidence={analysis.report.evidenceMap} />
            </div>
          </Card>

          <Card tone="ink">
            <CardHeader eyebrow="RAG" title="检索到的简历优化规则" description="这些内容来自 PGvector 知识库，会成为提示词上下文的一部分。" />
            <div className="mt-5 grid gap-3 md:grid-cols-2">
              {analysis.report.retrievedGuidance.length > 0 ? (
                analysis.report.retrievedGuidance.map((guidance, index) => (
                  <p className="border-2 border-white/80 bg-white/10 p-4 text-sm leading-6 text-white/80" key={`${guidance}-${index}`}>{guidance}</p>
                ))
              ) : (
                <p className="border-2 border-white/50 bg-white/10 p-5 text-sm leading-6 text-white/75">暂无 RAG 建议。可以先进入知识库创建并索引文档。</p>
              )}
            </div>
          </Card>
        </div>
      ) : null}
    </AppShell>
  );
}
