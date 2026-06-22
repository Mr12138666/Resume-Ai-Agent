import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,#e7f0d2,transparent_28rem),linear-gradient(135deg,#f8f5eb,#dfe8df)] px-6 py-10 text-slate-950">
      <section className="mx-auto flex max-w-6xl flex-col gap-10">
        <div className="max-w-3xl">
          <p className="font-mono text-sm uppercase tracking-[0.35em] text-slate-600">
            Resume AI Agent
          </p>
          <h1 className="mt-6 text-5xl font-black leading-tight tracking-tight md:text-7xl">
            把简历和岗位描述放到同一张战术地图上。
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-700">
            上传原始简历，输入目标 JD，系统将解析文档、匹配岗位要求、发现差距，并用 RAG 与 Agent 工具链生成可信的修改建议和段落改写。
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ["结构化解析", "PDF/DOCX/TXT 转结构化 Resume JSON 与 Job Requirement JSON。"],
            ["RAG 匹配", "PGvector 检索简历优化规则、岗位能力画像和历史上下文。"],
            ["Agent 改写", "通过工具调用完成解析、检索、评分、改写与事实校验。"],
          ].map(([title, body]) => (
            <article key={title} className="border-2 border-slate-950 bg-white/70 p-6 shadow-[8px_8px_0_#0f172a]">
              <h2 className="font-mono text-xl font-bold">{title}</h2>
              <p className="mt-4 leading-7 text-slate-700">{body}</p>
            </article>
          ))}
        </div>

        <div className="flex flex-wrap gap-4">
          <Link
            className="w-fit border-2 border-slate-950 bg-white px-6 py-3 font-mono font-bold uppercase tracking-wider text-slate-950 shadow-[6px_6px_0_#0f172a]"
            href="/dashboard"
          >
            Open dashboard
          </Link>
          <Link
            className="w-fit border-2 border-slate-950 bg-[#f6d875] px-6 py-3 font-mono font-bold uppercase tracking-wider text-slate-950 shadow-[6px_6px_0_#0f172a]"
            href="/demo"
          >
            Run demo
          </Link>
          <Link
            className="w-fit border-2 border-slate-950 bg-slate-950 px-6 py-3 font-mono font-bold uppercase tracking-wider text-white shadow-[6px_6px_0_#95a36a]"
            href="/upload"
          >
            Start workflow
          </Link>
          <Link
            className="w-fit border-2 border-slate-950 bg-[#eef4dd] px-6 py-3 font-mono font-bold uppercase tracking-wider text-slate-950 shadow-[6px_6px_0_#0f172a]"
            href="/knowledge"
          >
            Open RAG workbench
          </Link>
          <Link
            className="w-fit border-2 border-slate-950 bg-white px-6 py-3 font-mono font-bold uppercase tracking-wider text-slate-950 shadow-[6px_6px_0_#0f172a]"
            href="/settings"
          >
            Settings
          </Link>
        </div>
      </section>
    </main>
  );
}
