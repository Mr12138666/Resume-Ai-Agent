import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "ink" | "paper" | "lime" | "gold" | "sky" | "danger";

const toneClasses: Record<Tone, string> = {
  ink: "border-[#171713] bg-[#171713] text-white shadow-[#d8e89b]",
  paper: "border-[#171713] bg-[#fffaf0] text-[#171713] shadow-[#171713]",
  lime: "border-[#171713] bg-[#d8e89b] text-[#171713] shadow-[#171713]",
  gold: "border-[#171713] bg-[#f3cf5c] text-[#171713] shadow-[#171713]",
  sky: "border-[#171713] bg-[#b7d8f0] text-[#171713] shadow-[#171713]",
  danger: "border-[#171713] bg-[#f2b8ad] text-[#171713] shadow-[#171713]",
};

const baseClass =
  "inline-flex items-center justify-center gap-2 border-2 px-5 py-3 font-mono text-xs font-black uppercase tracking-[0.16em] shadow-[5px_5px_0_var(--tw-shadow-color)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:opacity-55";

export function Button({
  children,
  className = "",
  tone = "paper",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { tone?: Tone; children: ReactNode }) {
  return (
    <button className={`${baseClass} ${toneClasses[tone]} ${className}`} {...props}>
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  className = "",
  tone = "paper",
  ...props
}: AnchorHTMLAttributes<HTMLAnchorElement> & { href: string; tone?: Tone; children: ReactNode }) {
  return (
    <Link className={`${baseClass} ${toneClasses[tone]} ${className}`} {...props}>
      {children}
    </Link>
  );
}
