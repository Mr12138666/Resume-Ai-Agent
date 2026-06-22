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
    matched: "bg-[#d8e89b]",
    missing: "bg-[#f2b8ad]",
    neutral: "bg-[#fffaf0]",
  };

  if (keywords.length === 0) {
    return <p className="border-2 border-dashed border-[#171713] bg-white/60 p-4 text-sm leading-6 text-[#424036]">{emptyText}</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {keywords.map((keyword) => (
        <span className={`border-2 border-[#171713] px-2.5 py-1 font-mono text-xs font-black ${classes[tone]}`} key={keyword}>
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
    <article className="flex min-h-[28rem] flex-col overflow-hidden border-2 border-[#171713] bg-[#fffaf0]">
      <div className="border-b-2 border-[#171713] bg-[#ebe4cf] px-4 py-3">
        <h3 className="font-mono text-sm font-black uppercase tracking-[0.18em]">{title}</h3>
      </div>
      <div className="panel-scroll flex-1 overflow-auto p-5 text-sm leading-7">
        {text ? <p className="whitespace-pre-wrap">{highlightText(text, keywords)}</p> : <p className="text-[#6f746d]">{emptyText}</p>}
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
    return <p className="border-2 border-dashed border-[#171713] bg-white/60 p-5 text-sm leading-6 text-[#424036]">暂无证据映射。</p>;
  }

  return (
    <div className="grid gap-3 md:grid-cols-2">
      {evidence.map((item) => (
        <article className="border-2 border-[#171713] bg-[#fffaf0] p-4" key={`${item.keyword}-${item.evidence}`}>
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-mono text-sm font-black uppercase tracking-[0.14em]">{item.keyword}</h3>
            <span className={`border-2 border-[#171713] px-2 py-1 font-mono text-[10px] font-black uppercase tracking-[0.16em] ${item.matched ? "bg-[#d8e89b]" : "bg-[#f2b8ad]"}`}>
              {item.matched ? "已命中" : "缺证据"}
            </span>
          </div>
          <p className="mt-3 text-sm leading-6 text-[#424036]">{item.evidence || "简历中没有找到可引用证据。"}</p>
        </article>
      ))}
    </div>
  );
}
