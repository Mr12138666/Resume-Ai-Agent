import type { AnalysisResponse, RewriteDraftResponse } from "@/lib/api/client";
import { highlightText } from "@/lib/keywords";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

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
          <p className="whitespace-pre-wrap p-5 font-mono text-sm leading-7">
            {highlightText(jobDescription, keywords)}
          </p>
        </article>
        <article>
          <div className="border-b border-black bg-[#e5e5e0] px-5 py-3">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wide">简历命中预览</h3>
          </div>
          <p className="whitespace-pre-wrap p-5 font-mono text-sm leading-7">
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
  const diff = buildSideBySideDiff(rewrite.originalText, rewrite.rewrittenText);

  return (
    <section className="overflow-hidden border border-black bg-[#f0f0e8] shadow-sw-card">
      <div className="border-b border-black bg-black px-5 py-4 text-white">
        <h2 className="font-mono text-lg font-bold uppercase tracking-wide">改写差异预览</h2>
        <p className="mt-2 text-sm leading-6 text-white/75">左右两侧保留原始换行和排版；红色标记被删除或替换的原文，绿色标记新增或强化后的表达。</p>
      </div>
      <div className="grid lg:grid-cols-2">
        <article className="border-b border-black lg:border-b-0 lg:border-r">
          <div className="border-b border-black bg-[#dc2626] px-5 py-3 font-mono text-sm font-bold uppercase tracking-wide text-white">原文</div>
          <pre className="whitespace-pre-wrap p-5 font-mono text-sm leading-7">{diff.left}</pre>
        </article>
        <article>
          <div className="border-b border-black bg-[#15803d] px-5 py-3 font-mono text-sm font-bold uppercase tracking-wide text-white">改写后</div>
          <pre className="whitespace-pre-wrap p-5 font-mono text-sm leading-7">{diff.right}</pre>
        </article>
      </div>
    </section>
  );
}

export function EditableRewriteDiffPreview({
  rewrite,
  onSave,
}: {
  rewrite: RewriteDraftResponse;
  onSave: (newRewrittenText: string) => Promise<void>;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(rewrite.rewrittenText);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setEditText(rewrite.rewrittenText);
  }, [rewrite.rewrittenText]);

  const displayText = isEditing ? editText : rewrite.rewrittenText;
  const diff = buildSideBySideDiff(rewrite.originalText, displayText);

  async function handleSave() {
    setIsSaving(true);
    try {
      await onSave(editText);
      setIsEditing(false);
    } finally {
      setIsSaving(false);
    }
  }

  function handleCancel() {
    setEditText(rewrite.rewrittenText);
    setIsEditing(false);
  }

  return (
    <section className="overflow-hidden border border-black bg-[#f0f0e8] shadow-sw-card">
      <div className="border-b border-black bg-black px-5 py-4 text-white">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-mono text-lg font-bold uppercase tracking-wide">改写差异预览</h2>
            <p className="mt-2 text-sm leading-6 text-white/75">
              {isEditing
                ? "编辑右侧改写内容，左侧差异将实时更新。"
                : "左右两侧保留原始换行和排版；红色标记被删除或替换的原文，绿色标记新增或强化后的表达。"}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {isEditing ? (
              <>
                <Button disabled={isSaving} onClick={handleSave} tone="lime" type="button">
                  {isSaving ? "保存中..." : "保存修改"}
                </Button>
                <Button disabled={isSaving} onClick={handleCancel} tone="paper" type="button">
                  取消
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} tone="default" type="button">
                手动编辑
              </Button>
            )}
          </div>
        </div>
      </div>
      <div className="grid lg:grid-cols-2">
        <article className="border-b border-black lg:border-b-0 lg:border-r">
          <div className="border-b border-black bg-[#dc2626] px-5 py-3 font-mono text-sm font-bold uppercase tracking-wide text-white">原文</div>
          <pre className="whitespace-pre-wrap p-5 font-mono text-sm leading-7">{diff.left}</pre>
        </article>
        <article>
          <div className="border-b border-black bg-[#15803d] px-5 py-3 font-mono text-sm font-bold uppercase tracking-wide text-white">
            {isEditing ? "编辑中" : "改写后"}
          </div>
          {isEditing ? (
            <textarea
              className="panel-scroll h-96 w-full resize-y whitespace-pre-wrap border-0 bg-[#f0f0e8] p-5 font-mono text-sm leading-7 text-black focus:outline-none focus:ring-2 focus:ring-[#1d4ed8] focus:ring-inset"
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
            />
          ) : (
            <pre className="whitespace-pre-wrap p-5 font-mono text-sm leading-7">{diff.right}</pre>
          )}
        </article>
      </div>
    </section>
  );
}

type DiffPart = {
  text: string;
  type: "same" | "removed" | "added";
};

function buildSideBySideDiff(originalText: string, rewrittenText: string) {
  const originalTokens = tokenizeForDiff(originalText);
  const rewrittenTokens = tokenizeForDiff(rewrittenText);
  const rows = Array.from({ length: originalTokens.length + 1 }, () => Array(rewrittenTokens.length + 1).fill(0) as number[]);

  for (let i = originalTokens.length - 1; i >= 0; i -= 1) {
    for (let j = rewrittenTokens.length - 1; j >= 0; j -= 1) {
      rows[i][j] = originalTokens[i] === rewrittenTokens[j] ? rows[i + 1][j + 1] + 1 : Math.max(rows[i + 1][j], rows[i][j + 1]);
    }
  }

  const left: DiffPart[] = [];
  const right: DiffPart[] = [];
  let i = 0;
  let j = 0;

  while (i < originalTokens.length && j < rewrittenTokens.length) {
    if (originalTokens[i] === rewrittenTokens[j]) {
      left.push({ text: originalTokens[i], type: "same" });
      right.push({ text: rewrittenTokens[j], type: "same" });
      i += 1;
      j += 1;
    } else if (rows[i + 1][j] >= rows[i][j + 1]) {
      left.push({ text: originalTokens[i], type: "removed" });
      i += 1;
    } else {
      right.push({ text: rewrittenTokens[j], type: "added" });
      j += 1;
    }
  }

  while (i < originalTokens.length) {
    left.push({ text: originalTokens[i], type: "removed" });
    i += 1;
  }
  while (j < rewrittenTokens.length) {
    right.push({ text: rewrittenTokens[j], type: "added" });
    j += 1;
  }

  return {
    left: renderDiffParts(left, "removed"),
    right: renderDiffParts(right, "added"),
  };
}

function tokenizeForDiff(text: string) {
  return text.match(/\s+|[A-Za-z0-9_@./:+#-]+|[\u4e00-\u9fff]|[^\s]/g) ?? [];
}

function renderDiffParts(parts: DiffPart[], tone: "removed" | "added") {
  return parts.map((part, index) => {
    if (part.type === "same") {
      return part.text;
    }
    const className = tone === "removed"
      ? "bg-[#fecaca] text-[#7f1d1d] line-through decoration-[#dc2626] decoration-2"
      : "bg-[#bbf7d0] text-[#14532d] underline decoration-[#15803d] decoration-2";
    return (
      <mark className={`${className} px-0.5`} key={`${part.type}-${index}`}>
        {part.text}
      </mark>
    );
  });
}
