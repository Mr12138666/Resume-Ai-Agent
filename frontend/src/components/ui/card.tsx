import type { ReactNode } from "react";

type Tone = "paper" | "lime" | "ink" | "gold" | "sky" | "panel";

export function Card({
  children,
  className = "",
  tone = "paper",
}: {
  children: ReactNode;
  className?: string;
  tone?: Tone;
}) {
  const tones: Record<Tone, string> = {
    paper: "bg-[#f0f0e8] text-black",
    panel: "bg-[#e5e5e0] text-black",
    lime: "bg-[#f0f0e8] text-black",
    ink: "bg-black text-white",
    gold: "bg-[#e5e5e0] text-black",
    sky: "bg-[#f0f0e8] text-black",
  };

  return (
    <section className={`rounded-none border border-black p-6 shadow-sw-card ${tones[tone]} ${className}`}>
      {children}
    </section>
  );
}

export function CardHeader({
  action,
  eyebrow,
  title,
  description,
}: {
  action?: ReactNode;
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? <p className="font-mono text-xs font-bold uppercase tracking-wide text-[#1d4ed8]">{eyebrow}</p> : null}
        <h2 className="mt-2 font-serif text-2xl font-semibold leading-none tracking-tight text-current">{title}</h2>
        {description ? <p className="mt-3 max-w-2xl font-mono text-sm leading-6 text-[#6b7280]">{description}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  tone = "paper",
}: {
  label: string;
  value: string | number;
  helper?: string;
  tone?: Tone;
}) {
  return (
    <Card className="p-5" tone={tone}>
      <p className="font-mono text-xs font-bold uppercase tracking-wide text-[#1d4ed8]">{label}</p>
      <p className="mt-3 break-words font-mono text-4xl font-bold leading-none">{value}</p>
      {helper ? <p className="mt-3 font-mono text-xs leading-5 text-[#6b7280]">{helper}</p> : null}
    </Card>
  );
}
