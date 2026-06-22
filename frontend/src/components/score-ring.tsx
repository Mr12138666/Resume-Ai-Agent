import { scoreTone } from "@/lib/format";

const toneMap = {
  excellent: { stroke: "#4d7c2f", bg: "#d8e89b", label: "强匹配" },
  good: { stroke: "#3a70a8", bg: "#b7d8f0", label: "可投递" },
  warning: { stroke: "#a06f00", bg: "#f3cf5c", label: "需优化" },
  risk: { stroke: "#a34234", bg: "#f2b8ad", label: "风险高" },
};

export function ScoreRing({
  label,
  score,
  size = 132,
}: {
  label: string;
  score: number;
  size?: number;
}) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(score, 100)) / 100) * circumference;
  const tone = toneMap[scoreTone(score)];

  return (
    <div className="flex items-center gap-4 border-2 border-[#171713] bg-[#fffaf0] p-4">
      <div className="relative" style={{ height: size, width: size }}>
        <svg height={size} width={size}>
          <circle cx={size / 2} cy={size / 2} fill={tone.bg} r={radius} stroke="#171713" strokeWidth="2" />
          <circle
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            r={radius - 7}
            stroke="#ebe4cf"
            strokeWidth="10"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            r={radius - 7}
            stroke={tone.stroke}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="square"
            strokeWidth="10"
            style={{ transform: "rotate(-90deg)", transformOrigin: "50% 50%" }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-black leading-none">{score}</span>
          <span className="font-mono text-[10px] font-black uppercase tracking-[0.18em]">/100</span>
        </div>
      </div>
      <div>
        <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#6f746d]">{label}</p>
        <p className="mt-2 text-2xl font-black">{tone.label}</p>
        <p className="mt-2 max-w-44 text-sm leading-6 text-[#424036]">结合关键词覆盖、语义相关性与 ATS 可读性评估。</p>
      </div>
    </div>
  );
}
