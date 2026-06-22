"use client";

import { type FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import {
  type KnowledgeDocumentResponse,
  type KnowledgeSearchResult,
  createKnowledgeDocument,
  indexKnowledgeDocument,
  listKnowledgeDocuments,
  searchKnowledge,
} from "@/lib/api/client";
import { clampText } from "@/lib/format";

const starterContent = `简历优化规则：
- 项目经历要写清业务背景、采取的动作、技术范围和可验证结果。
- 只有当简历中有真实证据时，才复用 JD 中的关键技术词。
- 优先使用“搭建、优化、迁移、自动化、集成”等明确动作词，避免笼统表述。
- 每条经历要简洁、具体，并保持 ATS 可读。`;

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<KnowledgeDocumentResponse[]>([]);
  const [documentType, setDocumentType] = useState("resume_rule");
  const [sourceType, setSourceType] = useState("manual");
  const [title, setTitle] = useState("ATS 简历项目经历改写规则");
  const [content, setContent] = useState(starterContent);
  const [query, setQuery] = useState("后端工程师简历项目经历应该如何改写才能匹配 ATS？");
  const [results, setResults] = useState<KnowledgeSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [indexingId, setIndexingId] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  async function refreshDocuments() {
    setIsLoading(true);
    setError(null);
    try {
      setDocuments(await listKnowledgeDocuments());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "知识文档加载失败。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void refreshDocuments();
  }, []);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!documentType.trim() || !title.trim() || !content.trim()) {
      setError("请填写文档类型、标题和内容。");
      return;
    }
    setIsCreating(true);
    setError(null);
    try {
      const created = await createKnowledgeDocument({
        documentType: documentType.trim(),
        sourceType: sourceType.trim() || "manual",
        title: title.trim(),
        content: content.trim(),
      });
      setDocuments((current) => [created, ...current]);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "知识文档创建失败。");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleIndex(documentId: string) {
    setIndexingId(documentId);
    setError(null);
    try {
      const indexed = await indexKnowledgeDocument(documentId);
      setDocuments((current) => current.map((document) => (document.id === documentId ? indexed : document)));
    } catch (indexError) {
      setError(indexError instanceof Error ? indexError.message : "知识文档索引失败。");
    } finally {
      setIndexingId(null);
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) {
      setError("请输入检索问题。");
      return;
    }
    setIsSearching(true);
    setError(null);
    setResults([]);
    try {
      setResults(await searchKnowledge({ query: query.trim(), topK: 5 }));
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "知识检索失败。");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <AppShell
      actions={
        <>
          <Button disabled={isLoading} onClick={refreshDocuments} tone="paper" type="button">{isLoading ? "加载中" : "刷新"}</Button>
          <ButtonLink href="/upload" tone="gold">回到 Tailor</ButtonLink>
        </>
      }
      description="参考项目强调 Prompt 与配置能力；这里把 RAG 知识做成可创建、可索引、可检索的工具台，为分析和改写提供中文规则上下文。"
      eyebrow="RAG Knowledge"
      title="给简历智能体一套可引用的规则库。"
    >
      {error ? <p className="mb-6 border-2 border-[#171713] bg-[#f2b8ad] p-4 font-bold">{error}</p> : null}

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card tone="paper">
          <CardHeader eyebrow="Step 1" title="创建知识文档" description="保存简历规则、岗位画像、ATS 经验或面试定位笔记。" />
          <form className="mt-6 space-y-5" onSubmit={handleCreate}>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="文档类型" value={documentType} onChange={setDocumentType} />
              <Field label="来源类型" value={sourceType} onChange={setSourceType} />
            </div>
            <Field label="标题" value={title} onChange={setTitle} />
            <label className="block font-mono text-xs font-black uppercase tracking-[0.18em]">
              内容
              <textarea className="panel-scroll mt-2 min-h-80 w-full border-2 border-[#171713] bg-white px-4 py-3 text-base leading-7 outline-none focus:bg-[#fffaf0]" value={content} onChange={(event) => setContent(event.target.value)} />
            </label>
            <Button disabled={isCreating} tone="ink" type="submit">{isCreating ? "创建中" : "创建文档"}</Button>
          </form>
        </Card>

        <Card tone="lime">
          <CardHeader eyebrow="Step 2" title="索引到 PGvector" description="已索引文档会成为分析报告和改写提示词可检索的 RAG 上下文。" />
          <div className="mt-5 space-y-3">
            {documents.length > 0 ? (
              documents.map((document) => (
                <article className="border-2 border-[#171713] bg-[#fffaf0] p-4" key={document.id}>
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-mono text-xs font-black uppercase tracking-[0.18em] text-[#6f746d]">{document.documentType} · {document.sourceType || "未知来源"}</p>
                      <h3 className="mt-2 text-xl font-black">{document.title}</h3>
                      <p className="mt-1 font-mono text-xs font-black">状态：{document.status}</p>
                    </div>
                    <Button disabled={indexingId === document.id} onClick={() => handleIndex(document.id)} tone="ink" type="button">
                      {indexingId === document.id ? "索引中" : "索引"}
                    </Button>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-[#424036]">{clampText(document.content, 260)}</p>
                </article>
              ))
            ) : (
              <p className="border-2 border-dashed border-[#171713] bg-white/60 p-5 text-sm leading-6 text-[#424036]">{isLoading ? "正在加载知识文档..." : "暂无知识文档。"}</p>
            )}
          </div>
        </Card>
      </section>

      <Card className="mt-6" tone="sky">
        <CardHeader eyebrow="Step 3" title="检索 RAG 上下文" description="这里直接调用 PGvector 检索接口，确认知识能否被智能体取回。" />
        <form className="mt-5 flex flex-col gap-4 md:flex-row" onSubmit={handleSearch}>
          <input className="min-h-14 flex-1 border-2 border-[#171713] bg-white px-4 py-3 outline-none focus:bg-[#fffaf0]" value={query} onChange={(event) => setQuery(event.target.value)} />
          <Button disabled={isSearching} tone="ink" type="submit">{isSearching ? "检索中" : "检索"}</Button>
        </form>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {results.map((result) => (
            <article className="border-2 border-[#171713] bg-[#fffaf0] p-5" key={`${result.id}-${result.score ?? "fallback"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-xl font-black">{result.title || "未命名结果"}</h3>
                <span className="border-2 border-[#171713] bg-[#d8e89b] px-2 py-1 font-mono text-xs font-black">
                  {typeof result.score === "number" ? result.score.toFixed(3) : "n/a"}
                </span>
              </div>
              <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-[#424036]">{result.content}</p>
              <pre className="panel-scroll mt-4 max-h-40 overflow-auto whitespace-pre-wrap border-2 border-[#171713] bg-[#171713] p-3 text-xs leading-5 text-white">
                {JSON.stringify(result.metadata, null, 2)}
              </pre>
            </article>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}

function Field({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="block font-mono text-xs font-black uppercase tracking-[0.18em]">
      {label}
      <input className="mt-2 w-full border-2 border-[#171713] bg-white px-4 py-3 outline-none focus:bg-[#fffaf0]" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}
