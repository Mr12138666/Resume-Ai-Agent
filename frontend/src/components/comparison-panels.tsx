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
    <section className="overflow-hidden border-2 border-[#171713] bg-[#fffaf0] shadow-[8px_8px_0_#171713]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b-2 border-[#171713] bg-white px-5 py-4">
        <div className="flex flex-wrap gap-3 font-mono text-xs font-black uppercase tracking-[0.16em]">
          <span className="border-2 border-[#171713] bg-[#b7d8f0] px-3 py-1">JD 关键词 {keywords.length}</span>
          <span className="border-2 border-[#171713] bg-[#d8e89b] px-3 py-1">简历命中 {matchCount}</span>
        </div>
        <p className="font-mono text-sm font-black uppercase tracking-[0.16em]">覆盖率 {matchRate}%</p>
      </div>
      <div className="grid min-h-[34rem] lg:grid-cols-2">
        <article className="border-b-2 border-[#171713] lg:border-b-0 lg:border-r-2">
          <div className="border-b-2 border-[#171713] bg-[#ebe4cf] px-5 py-3">
            <h3 className="font-mono text-sm font-black uppercase tracking-[0.18em]">目标 JD</h3>
          </div>
          <p className="panel-scroll max-h-[34rem] overflow-auto whitespace-pre-wrap p-5 text-sm leading-7">
            {highlightText(jobDescription, keywords)}
          </p>
        </article>
        <article>
          <div className="border-b-2 border-[#171713] bg-[#ebe4cf] px-5 py-3">
            <h3 className="font-mono text-sm font-black uppercase tracking-[0.18em]">简历命中预览</h3>
          </div>
          <p className="panel-scroll max-h-[34rem] overflow-auto whitespace-pre-wrap p-5 text-sm leading-7">
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
        <article className="border-2 border-[#171713] bg-[#fffaf0] p-4 shadow-[5px_5px_0_#171713]" key={label}>
          <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#6f746d]">{label}</p>
          <p className="mt-2 text-4xl font-black">{value}</p>
        </article>
      ))}
    </section>
  );
}

export function RewriteDiffPreview({ rewrite }: { rewrite: RewriteDraftResponse }) {
  return (
    <section className="overflow-hidden border-2 border-[#171713] bg-[#fffaf0] shadow-[8px_8px_0_#171713]">
      <div className="border-b-2 border-[#171713] bg-[#171713] px-5 py-4 text-white">
        <h2 className="font-mono text-lg font-black uppercase tracking-[0.18em]">Diff Preview</h2>
        <p className="mt-2 text-sm leading-6 text-white/75">左侧是原文，右侧是智能体根据岗位匹配结果生成的中文改写草稿。</p>
      </div>
      <div className="grid lg:grid-cols-2">
        <article className="border-b-2 border-[#171713] lg:border-b-0 lg:border-r-2">
          <div className="border-b-2 border-[#171713] bg-[#f2b8ad] px-5 py-3 font-mono text-sm font-black uppercase tracking-[0.18em]">原文</div>
          <pre className="panel-scroll max-h-[34rem] overflow-auto whitespace-pre-wrap p-5 text-sm leading-7">{rewrite.originalText}</pre>
        </article>
        <article>
          <div className="border-b-2 border-[#171713] bg-[#d8e89b] px-5 py-3 font-mono text-sm font-black uppercase tracking-[0.18em]">改写后</div>
          <pre className="panel-scroll max-h-[34rem] overflow-auto whitespace-pre-wrap p-5 text-sm leading-7">{rewrite.rewrittenText}</pre>
        </article>
      </div>
    </section>
  );
}
