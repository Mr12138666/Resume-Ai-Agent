import { highlightText } from "@/lib/keywords";

export function KeywordCloud({
  emptyText = "暂无关键词。",
  keywords,
  tone = "matched",
}: {
  emptyText?: string;
  keywords: string[];
  tone?: "matched" | "missing" | "neutral";
}) {
  const classes = {
    matched: "bg-[#15803d] text-white",
    missing: "bg-[#dc2626] text-white",
    neutral: "bg-[#f0f0e8] text-black",
  };

  if (keywords.length === 0) {
    return <p className="border border-dashed border-black bg-[#e5e5e0] p-4 font-mono text-xs leading-5 text-[#6b7280]">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword) => (
        <span className={`border border-black px-2.5 py-1 font-mono text-xs font-bold uppercase tracking-wide ${classes[tone]}`} key={keyword}>
          {keyword}
        </span>
      ))}
    </div>
  );
}

export function HighlightedTextPanel({
  emptyText = "暂无文本。",
  keywords,
  text,
  title,
}: {
  emptyText?: string;
  keywords: string[];
  text: string;
  title: string;
}) {
  return (
    <article className="flex min-h-[28rem] flex-col overflow-hidden border border-black bg-[#f0f0e8] shadow-sw-sm">
      <div className="border-b border-black bg-[#e5e5e0] px-4 py-3">
        <h3 className="font-mono text-sm font-bold uppercase tracking-wide">{title}</h3>
      </div>
      <div className="panel-scroll flex-1 overflow-auto p-5 font-mono text-sm leading-7">
        {text ? <p className="whitespace-pre-wrap">{highlightText(text, keywords)}</p> : <p className="text-[#6b7280]">{emptyText}</p>}
      </div>
    </article>
  );
}

export function EvidenceMatrix({
  evidence,
}: {
  evidence: Array<{ keyword: string; evidence: string; matched: boolean }>;
}) {
  if (evidence.length === 0) {
    return <p className="border border-dashed border-black bg-[#e5e5e0] p-5 font-mono text-xs leading-5 text-[#6b7280]">暂无证据映射。</p>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {evidence.map((item) => (
        <article className="border border-black bg-[#f0f0e8] p-4 shadow-sw-xs" key={`${item.keyword}-${item.evidence}`}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-mono text-sm font-bold uppercase tracking-wide">{item.keyword}</h3>
            <span className={`border border-black px-2 py-1 font-mono text-[10px] font-bold uppercase tracking-wide ${item.matched ? "bg-[#15803d] text-white" : "bg-[#dc2626] text-white"}`}>
              {item.matched ? "已命中" : "缺证据"}
            </span>
          </div>
          <p className="mt-3 font-mono text-xs leading-5 text-[#374151]">{item.evidence || "简历中没有找到可引用证据。"}</p>
        </article>
      ))}
    </div>
  );
}
