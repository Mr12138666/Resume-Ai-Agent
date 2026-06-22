import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Tone = "default" | "ink" | "paper" | "lime" | "gold" | "sky" | "danger" | "success" | "warning";

const toneClasses: Record<Tone, string> = {
  default: "border-black bg-[#1d4ed8] text-white hover:bg-blue-800",
  ink: "border-black bg-black text-white hover:bg-[#1d4ed8]",
  paper: "border-black bg-[#f0f0e8] text-black hover:bg-[#e5e5e0]",
  lime: "border-black bg-[#15803d] text-white hover:bg-green-800",
  gold: "border-black bg-[#f97316] text-white hover:bg-orange-600",
  sky: "border-black bg-[#1d4ed8] text-white hover:bg-blue-800",
  danger: "border-black bg-[#dc2626] text-white hover:bg-red-700",
  success: "border-black bg-[#15803d] text-white hover:bg-green-800",
  warning: "border-black bg-[#f97316] text-white hover:bg-orange-600",
};

const baseClass =
  "relative inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-none border px-6 py-2 font-mono text-sm font-bold uppercase tracking-wide shadow-sw-sm transition-[transform,box-shadow,background-color,color] duration-100 ease-out hover:translate-x-[1px] hover:translate-y-[1px] hover:shadow-none active:translate-x-[2px] active:translate-y-[2px] disabled:pointer-events-none disabled:opacity-50";

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
