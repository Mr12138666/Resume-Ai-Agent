import { AppShell } from "@/components/app-shell";
import { ButtonLink } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export default function HomePage() {
  return (
    <AppShell
      actions={
        <>
          <ButtonLink href="/dashboard" tone="default">进入工作台</ButtonLink>
          <ButtonLink href="/upload" tone="paper">开始 Tailor</ButtonLink>
        </>
      }
      description="尽可能复现 Resume-Matcher 的主流程体验：主简历、目标 JD、关键词命中、差异预览、智能体改写与导出，同时接入当前 Spring Boot、PGvector、MinIO、DeepSeek 后端。"
      eyebrow="Resume AI Agent"
      title="把简历优化做成一条可追踪的求职作战流水线。"
    >
      <section className="grid gap-5 md:grid-cols-3">
        {[
          ["主简历底座", "上传 PDF/DOCX/TXT，保存到 MinIO，使用 Tika 解析文本，并可调用模型生成结构化 Resume JSON。"],
          ["JD 匹配地图", "粘贴目标岗位，提取关键词、职责和能力要求，和简历内容进行证据级对照。"],
          ["Agent 改写闭环", "结合 RAG 规则、匹配证据和提示词工程生成中文改写草稿，并导出 Markdown。"],
        ].map(([title, body], index) => (
          <Card className="min-h-56" key={title} tone={index === 1 ? "panel" : "paper"}>
            <p className="font-mono text-xs font-bold uppercase tracking-wide text-[#1d4ed8]">0{index + 1}</p>
            <h2 className="mt-5 text-3xl font-black leading-tight">{title}</h2>
            <p className="mt-4 font-mono text-xs uppercase leading-5 text-[#6b7280]">{body}</p>
          </Card>
        ))}
      </section>

      <section className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <Card tone="ink">
          <p className="font-mono text-xs font-black uppercase tracking-[0.22em] text-white/60">Pipeline</p>
          <div className="mt-5 grid gap-3 md:grid-cols-4">
            {["上传简历", "粘贴 JD", "分析证据", "改写导出"].map((step, index) => (
              <div className="border border-white/80 bg-white/10 p-4" key={step}>
                <p className="font-mono text-xs text-white/60">STEP {index + 1}</p>
                <p className="mt-3 text-xl font-black">{step}</p>
              </div>
            ))}
          </div>
        </Card>
        <Card tone="sky">
          <h2 className="text-3xl font-black">不是“帮我润色一下”。</h2>
          <p className="mt-4 font-mono text-xs uppercase leading-5 text-[#6b7280]">
            平台会把每条建议和岗位要求、简历证据、RAG 规则关联起来，尽量避免虚构经历，适合项目展示和真实求职使用。
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <ButtonLink href="/knowledge" tone="paper">管理 RAG</ButtonLink>
            <ButtonLink href="/settings" tone="paper">检查配置</ButtonLink>
          </div>
        </Card>
      </section>
    </AppShell>
  );
}
