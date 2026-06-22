"use client";

import Link from "next/link";
import { type FormEvent, useEffect, useState } from "react";
import {
  type KnowledgeDocumentResponse,
  type KnowledgeSearchResult,
  createKnowledgeDocument,
  indexKnowledgeDocument,
  listKnowledgeDocuments,
  searchKnowledge,
} from "@/lib/api/client";

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
      setDocuments((current) =>
        current.map((document) => (document.id === documentId ? indexed : document)),
      );
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
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8f5eb,#edf3dc_55%,#d7e1d0)] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.35em] text-slate-600">RAG 知识库</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              为简历智能体建立可引用的知识记忆。
            </h1>
          </div>
          <Link
            className="border-2 border-slate-950 bg-white px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider shadow-[5px_5px_0_#0f172a]"
            href="/upload"
          >
            返回流程
          </Link>
        </div>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
          创建简历优化知识，索引到 PGvector，再像分析和改写流程一样检索可用建议。
        </p>

        {error ? (
          <p className="mt-6 border-2 border-red-900 bg-red-50 p-4 text-red-900">{error}</p>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            className="border-2 border-slate-950 bg-white p-8 shadow-[8px_8px_0_#0f172a]"
            onSubmit={handleCreate}
          >
            <h2 className="font-mono text-xl font-bold">1. 创建知识</h2>
            <p className="mt-4 leading-7 text-slate-700">
              先保存可复用的简历规则、岗位画像、ATS 经验或面试定位笔记，再进行向量索引。
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="block font-mono text-sm font-bold uppercase tracking-widest">
                文档类型
                <input
                  className="mt-3 w-full border-2 border-slate-950 px-4 py-3 font-serif text-base outline-none focus:bg-[#eef4dd]"
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value)}
                />
              </label>
              <label className="block font-mono text-sm font-bold uppercase tracking-widest">
                来源类型
                <input
                  className="mt-3 w-full border-2 border-slate-950 px-4 py-3 font-serif text-base outline-none focus:bg-[#eef4dd]"
                  value={sourceType}
                  onChange={(event) => setSourceType(event.target.value)}
                />
              </label>
            </div>

            <label className="mt-6 block font-mono text-sm font-bold uppercase tracking-widest">
              标题
              <input
                className="mt-3 w-full border-2 border-slate-950 px-4 py-3 font-serif text-base outline-none focus:bg-[#eef4dd]"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>

            <label className="mt-6 block font-mono text-sm font-bold uppercase tracking-widest">
              内容
              <textarea
                className="mt-3 min-h-72 w-full border-2 border-slate-950 px-4 py-3 font-serif text-base leading-7 outline-none focus:bg-[#eef4dd]"
                value={content}
                onChange={(event) => setContent(event.target.value)}
              />
            </label>

            <button
              className="mt-8 border-2 border-slate-950 bg-slate-950 px-6 py-3 font-mono font-bold uppercase tracking-wider text-white shadow-[6px_6px_0_#95a36a] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isCreating}
              type="submit"
            >
              {isCreating ? "创建中..." : "创建文档"}
            </button>
          </form>

          <section className="border-2 border-slate-950 bg-[#eef4dd] p-8 shadow-[8px_8px_0_#95a36a]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-mono text-xl font-bold">2. 索引文档</h2>
                <p className="mt-2 leading-7 text-slate-700">
                  已索引文档会成为匹配评分和改写提示词可检索的 RAG 上下文。
                </p>
              </div>
              <button
                className="border-2 border-slate-950 bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a] disabled:opacity-60"
                disabled={isLoading}
                onClick={refreshDocuments}
                type="button"
              >
                {isLoading ? "加载中..." : "刷新"}
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {documents.length > 0 ? (
                documents.map((document) => (
                  <article key={document.id} className="border-2 border-slate-950 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
                          {document.documentType} · {document.sourceType || "未知来源"}
                        </p>
                        <h3 className="mt-2 text-xl font-black">{document.title}</h3>
                        <p className="mt-1 font-mono text-xs text-slate-600">状态：{document.status}</p>
                      </div>
                      <button
                        className="border-2 border-slate-950 bg-slate-950 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[4px_4px_0_#95a36a] disabled:opacity-60"
                        disabled={indexingId === document.id}
                        onClick={() => handleIndex(document.id)}
                        type="button"
                      >
                        {indexingId === document.id ? "索引中..." : "索引"}
                      </button>
                    </div>
                    <p className="mt-4 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {document.content}
                    </p>
                  </article>
                ))
              ) : (
                <p className="border-2 border-dashed border-slate-950 bg-white/70 p-6 leading-7 text-slate-700">
                  {isLoading ? "正在加载知识文档..." : "暂无知识文档。请先在左侧创建一条。"}
                </p>
              )}
            </div>
          </section>
        </div>

        <form className="mt-8 border-2 border-slate-950 bg-white p-8 shadow-[8px_8px_0_#0f172a]" onSubmit={handleSearch}>
          <h2 className="font-mono text-xl font-bold">3. 检索 RAG 上下文</h2>
          <p className="mt-4 leading-7 text-slate-700">
            这里会调用 PGvector 检索接口，展示智能体可用于事实 grounding 的原始片段。
          </p>
          <div className="mt-6 flex flex-col gap-4 md:flex-row">
            <input
              className="min-h-14 flex-1 border-2 border-slate-950 px-4 py-3 font-serif text-base outline-none focus:bg-[#eef4dd]"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <button
              className="border-2 border-slate-950 bg-slate-950 px-6 py-3 font-mono font-bold uppercase tracking-wider text-white shadow-[6px_6px_0_#95a36a] disabled:cursor-not-allowed disabled:opacity-60"
              disabled={isSearching}
              type="submit"
            >
              {isSearching ? "检索中..." : "检索"}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {results.map((result) => (
              <article key={`${result.id}-${result.score ?? "fallback"}`} className="border-2 border-slate-950 bg-[#f8f5eb] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-xl font-black">{result.title || "未命名结果"}</h3>
                  <span className="border border-slate-950 bg-white px-2 py-1 font-mono text-xs">
                    分数 {typeof result.score === "number" ? result.score.toFixed(3) : "n/a"}
                  </span>
                </div>
                <p className="mt-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">{result.content}</p>
                <pre className="mt-4 max-h-40 overflow-auto whitespace-pre-wrap border-2 border-slate-950 bg-slate-950 p-3 text-xs leading-5 text-white">
                  {JSON.stringify(result.metadata, null, 2)}
                </pre>
              </article>
            ))}
          </div>
        </form>
      </section>
    </main>
  );
}
