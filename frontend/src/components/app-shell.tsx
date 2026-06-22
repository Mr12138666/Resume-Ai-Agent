"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const navItems = [
  { href: "/dashboard", label: "工作台" },
  { href: "/upload", label: "Tailor" },
  { href: "/knowledge", label: "RAG 知识库" },
  { href: "/demo", label: "演示" },
  { href: "/settings", label: "设置" },
];

export function AppShell({
  actions,
  children,
  description,
  eyebrow,
  title,
}: {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  eyebrow: string;
  title: string;
}) {
  const pathname = usePathname();

  return (
    <main className="swiss-grid min-h-screen px-4 py-5 text-[#171713] md:px-8 md:py-8">
      <div className="mx-auto max-w-7xl">
        <header className="border-2 border-[#171713] bg-[#fffaf0]/95 p-4 shadow-[8px_8px_0_#171713]">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b-2 border-[#171713] pb-4">
            <Link className="font-mono text-lg font-black uppercase tracking-[0.18em]" href="/">
              Resume AI
            </Link>
            <nav className="flex flex-wrap gap-2">
              {navItems.map((item) => {
                const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                return (
                  <Link
                    className={`border-2 border-[#171713] px-3 py-2 font-mono text-xs font-black uppercase tracking-[0.14em] transition hover:-translate-y-0.5 ${
                      active ? "bg-[#171713] text-white" : "bg-[#fffaf0] text-[#171713]"
                    }`}
                    href={item.href}
                    key={item.href}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="grid gap-6 pt-6 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="font-mono text-xs font-black uppercase tracking-[0.32em] text-[#6f746d]">{eyebrow}</p>
              <h1 className="mt-4 max-w-5xl text-4xl font-black leading-[0.95] tracking-[-0.04em] md:text-6xl lg:text-7xl">
                {title}
              </h1>
              {description ? <p className="mt-5 max-w-3xl text-base leading-8 text-[#424036] md:text-lg">{description}</p> : null}
            </div>
            {actions ? <div className="flex flex-wrap gap-3 lg:justify-end">{actions}</div> : null}
          </div>
        </header>
        <div className="mt-8">{children}</div>
      </div>
    </main>
  );
}
