import type { AnalysisResponse, RewriteDraftResponse } from "@/lib/api/client";
import { highlightText } from "@/lib/keywords";

export function JDResumeComparison({
  jobDescription,
  resumeText,
  keywords,
}: {
  jobDescription: string;
  resumeText: string;
  keywords: string[];
}) {
  const matchCount = keywords.filter((keyword) => resumeText.toLowerCase().includes(keyword.toLowerCase())).length;
  const matchRate = keywords.length > 0 ? Math.round((matchCount / keywords.length) * 100) : 0;

  return (
    <section className="overflow-hidden border border-black bg-[#f0f0e8] shadow-sw-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black bg-[#e5e5e0] px-5 py-4">
        <div className="flex flex-wrap gap-3 font-mono text-xs font-bold uppercase tracking-wide">
          <span className="border border-black bg-[#1d4ed8] px-3 py-1 text-white">JD 关键词 {keywords.length}</span>
          <span className="border border-black bg-[#15803d] px-3 py-1 text-white">简历命中 {matchCount}</span>
        </div>
        <p className="font-mono text-sm font-bold uppercase tracking-wide text-[#1d4ed8]">覆盖率 {matchRate}%</p>
      </div>
      <div className="grid min-h-[34rem] lg:grid-cols-2">
        <article className="border-b border-black lg:border-b-0 lg:border-r">
          <div className="border-b border-black bg-[#e5e5e0] px-5 py-3">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wide">目标 JD</h3>
          </div>
          <p className="panel-scroll max-h-[34rem] overflow-auto whitespace-pre-wrap p-5 font-mono text-sm leading-7">
            {highlightText(jobDescription, keywords)}
          </p>
        </article>
        <article>
          <div className="border-b border-black bg-[#e5e5e0] px-5 py-3">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wide">简历命中预览</h3>
          </div>
          <p className="panel-scroll max-h-[34rem] overflow-auto whitespace-pre-wrap p-5 font-mono text-sm leading-7">
            {resumeText ? highlightText(resumeText, keywords) : "上传简历后显示解析文本。"}
          </p>
        </article>
      </div>
    </section>
  );
}

export function AnalysisPreviewStrip({ analysis }: { analysis: AnalysisResponse }) {
  return (
    <section className="grid gap-3 md:grid-cols-4">
      {[
        ["综合", analysis.overallScore],
        ["关键词", analysis.keywordScore],
        ["语义", analysis.semanticScore],
        ["ATS", analysis.atsScore],
      ].map(([label, value]) => (
        <article className="border border-black bg-[#f0f0e8] p-4 shadow-sw-sm" key={label}>
          <p className="font-mono text-xs font-bold uppercase tracking-wide text-[#1d4ed8]">{label}</p>
          <p className="mt-2 font-mono text-4xl font-bold">{value}</p>
        </article>
      ))}
    </section>
  );
}

export function RewriteDiffPreview({ rewrite }: { rewrite: RewriteDraftResponse }) {
  return (
    <section className="overflow-hidden border border-black bg-[#f0f0e8] shadow-sw-card">
      <div className="border-b border-black bg-black px-5 py-4 text-white">
        <h2 className="font-mono text-lg font-bold uppercase tracking-wide">改写差异预览</h2>
        <p className="mt-2 text-sm leading-6 text-white/75">左侧是原文，右侧是智能体根据岗位匹配结果生成的中文改写草稿。</p>
      </div>
      <div className="grid lg:grid-cols-2">
        <article className="border-b border-black lg:border-b-0 lg:border-r">
          <div className="border-b border-black bg-[#dc2626] px-5 py-3 font-mono text-sm font-bold uppercase tracking-wide text-white">原文</div>
          <pre className="panel-scroll max-h-[34rem] overflow-auto whitespace-pre-wrap p-5 font-mono text-sm leading-7">{rewrite.originalText}</pre>
        </article>
        <article>
          <div className="border-b border-black bg-[#15803d] px-5 py-3 font-mono text-sm font-bold uppercase tracking-wide text-white">改写后</div>
          <pre className="panel-scroll max-h-[34rem] overflow-auto whitespace-pre-wrap p-5 font-mono text-sm leading-7">{rewrite.rewrittenText}</pre>
        </article>
      </div>
    </section>
  );
}
