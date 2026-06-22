import type { ReactNode } from "react";

export function Card({
  children,
  className = "",
  tone = "paper",
}: {
  children: ReactNode;
  className?: string;
  tone?: "paper" | "lime" | "ink" | "gold" | "sky";
}) {
  const tones = {
    paper: "border-[#171713] bg-[#fffaf0] text-[#171713] shadow-[#171713]",
    lime: "border-[#171713] bg-[#eef4dd] text-[#171713] shadow-[#95a36a]",
    ink: "border-[#171713] bg-[#171713] text-white shadow-[#95a36a]",
    gold: "border-[#171713] bg-[#f3cf5c] text-[#171713] shadow-[#171713]",
    sky: "border-[#171713] bg-[#ddecf5] text-[#171713] shadow-[#171713]",
  };

  return (
    <section className={`border-2 p-6 shadow-[8px_8px_0_var(--tw-shadow-color)] ${tones[tone]} ${className}`}>
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
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        {eyebrow ? (
          <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-[#6f746d]">{eyebrow}</p>
        ) : null}
        <h2 className="mt-2 text-2xl font-black leading-tight">{title}</h2>
        {description ? <p className="mt-2 max-w-2xl text-sm leading-6 text-[#424036]">{description}</p> : null}
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
  tone?: "paper" | "lime" | "ink" | "gold" | "sky";
}) {
  return (
    <Card className="p-5" tone={tone}>
      <p className="font-mono text-xs font-black uppercase tracking-[0.2em] text-[#6f746d]">{label}</p>
      <p className="mt-3 break-words text-4xl font-black leading-none">{value}</p>
      {helper ? <p className="mt-3 text-sm leading-6 text-[#424036]">{helper}</p> : null}
    </Card>
  );
}
