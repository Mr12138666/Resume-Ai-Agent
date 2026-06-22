import { scoreTone } from "@/lib/format";

const toneMap = {
  excellent: { stroke: "#15803d", bg: "#f0f0e8", label: "强匹配" },
  good: { stroke: "#1d4ed8", bg: "#f0f0e8", label: "可投递" },
  warning: { stroke: "#f97316", bg: "#f0f0e8", label: "需优化" },
  risk: { stroke: "#dc2626", bg: "#f0f0e8", label: "风险高" },
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
    <div className="flex items-center gap-4 border border-black bg-[#f0f0e8] p-4 shadow-sw-sm">
      <div className="relative" style={{ height: size, width: size }}>
        <svg height={size} width={size}>
          <circle cx={size / 2} cy={size / 2} fill={tone.bg} r={radius} stroke="#000000" strokeWidth="1" />
          <circle
            cx={size / 2}
            cy={size / 2}
            fill="transparent"
            r={radius - 7}
            stroke="#d8d8d2"
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
        <p className="font-mono text-xs font-bold uppercase tracking-wide text-[#1d4ed8]">{label}</p>
        <p className="mt-2 font-serif text-2xl font-semibold">{tone.label}</p>
        <p className="mt-2 max-w-44 font-mono text-xs leading-5 text-[#6b7280]">结合关键词覆盖、语义相关性与 ATS 可读性评估。</p>
      </div>
    </div>
  );
}
