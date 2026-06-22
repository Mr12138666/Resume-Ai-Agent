"use client";

import { type FormEvent, useEffect, useState } from "react";
import { AppShell } from "@/components/app-shell";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  type KnowledgeDocumentResponse,
  type KnowledgeSearchResult,
  createKnowledgeDocument,
  deleteKnowledgeDocument,
  indexKnowledgeDocument,
  listKnowledgeDocuments,
  searchKnowledge,
  updateKnowledgeDocument,
} from "@/lib/api/client";
import { clampText } from "@/lib/format";

const starterContent = `简历优化规则：
- 项目经历要写清业务背景、采取的动作、技术范围和可验证结果。
- 只有当简历中有真实证据时，才复用 JD 中的关键技术词。
- 优先使用“搭建、优化、迁移、自动化、集成”等明确动作词，避免笼统表述。
- 每条经历要简洁、具体，并保持 ATS 可读。`;

const documentTypeOptions = [
  { label: "简历优化规则", value: "resume_rule", description: "通用简历写法、项目经历表达、ATS 可读性规则。" },
  { label: "岗位画像", value: "job_insight", description: "某类岗位看重的能力、职责和关键词。" },
  { label: "ATS 规则", value: "ats_rule", description: "关键词、格式、标题层级、机器筛选相关经验。" },
  { label: "面试/定位笔记", value: "interview_note", description: "求职定位、面试反馈、表达策略和复盘。" },
];

const sourceTypeOptions = [
  { label: "手动录入", value: "manual", description: "你自己整理或直接填写的规则。" },
  { label: "参考项目", value: "project_ref", description: "从参考项目或课程资料整理而来。" },
  { label: "岗位 JD 总结", value: "jd", description: "从某个岗位描述中抽取出的偏好。" },
  { label: "简历总结", value: "resume", description: "从个人简历内容里沉淀出的素材。" },
  { label: "网页资料", value: "web", description: "从网页、博客或公开资料整理而来。" },
];

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<KnowledgeDocumentResponse[]>([]);
  const [documentType, setDocumentType] = useState("resume_rule");
  const [sourceType, setSourceType] = useState("manual");
  const [title, setTitle] = useState("ATS 简历项目经历改写规则");
  const [content, setContent] = useState(starterContent);
  const [query, setQuery] = useState("后端工程师简历项目经历应该如何改写才能匹配 ATS？");
  const [results, setResults] = useState<KnowledgeSearchResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [indexingId, setIndexingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KnowledgeDocumentResponse | null>(null);
  const [editDraft, setEditDraft] = useState({
    documentType: "",
    sourceType: "",
    title: "",
    content: "",
  });
  const [isSearching, setIsSearching] = useState(false);

  async function refreshDocuments() {
    setIsLoading(true);
    setError(null);
    setNotice(null);
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
    setNotice(null);
    try {
      const created = await createKnowledgeDocument({
        documentType: documentType.trim(),
        sourceType: sourceType.trim() || "manual",
        title: title.trim(),
        content: content.trim(),
      });
      setDocuments((current) => [created, ...current]);
      setNotice(`已创建知识文档“${created.title}”，下一步可以索引到 PGvector。`);
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "知识文档创建失败。");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleIndex(documentId: string) {
    const target = documents.find((document) => document.id === documentId);
    setIndexingId(documentId);
    setError(null);
    setNotice(null);
    try {
      const indexed = await indexKnowledgeDocument(documentId);
      setDocuments((current) => current.map((document) => (document.id === documentId ? indexed : document)));
      setNotice(`“${indexed.title}”已${target?.status === "INDEXED" ? "重新" : ""}索引成功，可在下方检索验证。`);
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
    setNotice(null);
    setResults([]);
    try {
      setResults(await searchKnowledge({ query: query.trim(), topK: 5 }));
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "知识检索失败。");
    } finally {
      setIsSearching(false);
    }
  }

  function startEditing(document: KnowledgeDocumentResponse) {
    setEditingId(document.id);
    setNotice(null);
    setError(null);
    setEditDraft({
      documentType: document.documentType,
      sourceType: document.sourceType ?? "manual",
      title: document.title,
      content: document.content,
    });
  }

  function cancelEditing() {
    setEditingId(null);
    setEditDraft({
      documentType: "",
      sourceType: "",
      title: "",
      content: "",
    });
  }

  async function handleSaveEdit(documentId: string) {
    if (!editDraft.documentType.trim() || !editDraft.title.trim() || !editDraft.content.trim()) {
      setError("请填写文档类型、标题和内容。");
      return;
    }
    setSavingId(documentId);
    setError(null);
    setNotice(null);
    try {
      const updated = await updateKnowledgeDocument(documentId, {
        documentType: editDraft.documentType.trim(),
        sourceType: editDraft.sourceType.trim() || "manual",
        title: editDraft.title.trim(),
        content: editDraft.content.trim(),
      });
      setDocuments((current) => current.map((document) => (document.id === documentId ? updated : document)));
      setNotice(`“${updated.title}”已保存，旧索引已清理；请重新索引后再用于 RAG 检索。`);
      cancelEditing();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "知识文档保存失败。");
    } finally {
      setSavingId(null);
    }
  }

  async function handleDelete(document: KnowledgeDocumentResponse | null) {
    if (!document) {
      return;
    }
    setDeletingId(document.id);
    setError(null);
    setNotice(null);
    try {
      await deleteKnowledgeDocument(document.id);
      setDocuments((current) => current.filter((item) => item.id !== document.id));
      setResults((current) => current.filter((result) => result.metadata.knowledgeDocumentId !== document.id));
      setNotice(`“${document.title}”已删除，相关向量索引也已清理。`);
      setDeleteTarget(null);
      if (editingId === document.id) {
        cancelEditing();
      }
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "知识文档删除失败。");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <AppShell
      actions={
        <>
          <Button disabled={isLoading} onClick={refreshDocuments} tone="paper" type="button">{isLoading ? "加载中" : "刷新"}</Button>
          <ButtonLink href="/upload" tone="gold">回到定制</ButtonLink>
        </>
      }
      description="参考项目强调 Prompt 与配置能力；这里把 RAG 知识做成可创建、可索引、可检索的工具台，为分析和改写提供中文规则上下文。"
      eyebrow="RAG 知识库"
      title="给简历智能体一套可引用的规则库。"
    >
      {error ? <p className="mb-6 border border-black bg-[#dc2626] p-4 font-mono text-sm font-bold uppercase text-white shadow-sw-sm">{error}</p> : null}
      {notice ? <p className="mb-6 border border-black bg-[#15803d] p-4 font-mono text-sm font-bold text-white shadow-sw-sm">{notice}</p> : null}

      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <Card tone="paper">
          <CardHeader eyebrow="步骤 1" title="创建知识文档" description="保存简历规则、岗位画像、ATS 经验或面试定位笔记。" />
          <form className="mt-6 space-y-5" onSubmit={handleCreate}>
            <div className="grid gap-4 md:grid-cols-2">
              <SelectField label="文档类型" options={documentTypeOptions} value={documentType} onChange={setDocumentType} />
              <SelectField label="来源类型" options={sourceTypeOptions} value={sourceType} onChange={setSourceType} />
            </div>
            <Field label="标题" value={title} onChange={setTitle} />
            <label className="block font-mono text-xs font-black uppercase tracking-[0.18em]">
              内容
              <textarea className="panel-scroll mt-2 min-h-80 w-full rounded-none border border-black bg-[#f0f0e8] px-4 py-3 font-mono text-sm leading-6 outline-none focus:bg-[#e5e5e0] focus:ring-2 focus:ring-[#1d4ed8]" value={content} onChange={(event) => setContent(event.target.value)} />
            </label>
            <Button disabled={isCreating} tone="ink" type="submit">{isCreating ? "创建中" : "创建文档"}</Button>
          </form>
        </Card>

        <Card tone="lime">
          <CardHeader eyebrow="步骤 2" title="索引到 PGvector" description="已索引文档会成为分析报告和改写提示词可检索的 RAG 上下文。" />
          <div className="mt-5 space-y-3">
            {documents.length > 0 ? (
              documents.map((document) => {
                const isEditing = editingId === document.id;

                return (
                  <article className="border border-black bg-[#f0f0e8] p-4 shadow-sw-xs" key={document.id}>
                    {isEditing ? (
                      <div className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                          <SelectField label="文档类型" options={documentTypeOptions} value={editDraft.documentType} onChange={(value) => setEditDraft((current) => ({ ...current, documentType: value }))} />
                          <SelectField label="来源类型" options={sourceTypeOptions} value={editDraft.sourceType} onChange={(value) => setEditDraft((current) => ({ ...current, sourceType: value }))} />
                        </div>
                        <Field label="标题" value={editDraft.title} onChange={(value) => setEditDraft((current) => ({ ...current, title: value }))} />
                        <label className="block font-mono text-xs font-black uppercase tracking-[0.18em]">
                          内容
                          <textarea className="panel-scroll mt-2 min-h-64 w-full rounded-none border border-black bg-[#f0f0e8] px-4 py-3 font-mono text-sm leading-6 outline-none focus:bg-[#e5e5e0] focus:ring-2 focus:ring-[#1d4ed8]" value={editDraft.content} onChange={(event) => setEditDraft((current) => ({ ...current, content: event.target.value }))} />
                        </label>
                        <div className="flex flex-wrap gap-3">
                          <Button disabled={savingId === document.id} onClick={() => handleSaveEdit(document.id)} tone="success" type="button">
                            {savingId === document.id ? "保存中" : "保存修改"}
                          </Button>
                          <Button disabled={savingId === document.id} onClick={cancelEditing} tone="paper" type="button">取消</Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <p className="font-mono text-xs font-bold uppercase tracking-wide text-[#1d4ed8]">
                              {labelFor(documentTypeOptions, document.documentType)} · {labelFor(sourceTypeOptions, document.sourceType)}
                            </p>
                            <h3 className="mt-2 text-xl font-black">{document.title}</h3>
                            <p className="mt-1 font-mono text-xs font-black">状态：{document.status}</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Button disabled={indexingId === document.id || deletingId === document.id} onClick={() => handleIndex(document.id)} tone="ink" type="button">
                              {indexingId === document.id ? (document.status === "INDEXED" ? "重新索引中" : "索引中") : document.status === "INDEXED" ? "重新索引" : "索引"}
                            </Button>
                            <Button disabled={indexingId === document.id || deletingId === document.id} onClick={() => startEditing(document)} tone="paper" type="button">编辑</Button>
                            <Button disabled={deletingId === document.id || indexingId === document.id} onClick={() => setDeleteTarget(document)} tone="danger" type="button">
                              {deletingId === document.id ? "删除中" : "删除"}
                            </Button>
                          </div>
                        </div>
                        <p className="mt-4 font-mono text-xs uppercase leading-5 text-[#6b7280]">{clampText(document.content, 260)}</p>
                      </>
                    )}
                  </article>
                );
              })
            ) : (
              <p className="border border-dashed border-black bg-[#e5e5e0] p-5 font-mono text-xs uppercase leading-5 text-[#6b7280]">{isLoading ? "正在加载知识文档..." : "暂无知识文档。"}</p>
            )}
          </div>
        </Card>
      </section>

      <Card className="mt-6" tone="sky">
        <CardHeader eyebrow="步骤 3" title="检索 RAG 上下文" description="这里直接调用 PGvector 检索接口，确认知识能否被智能体取回。" />
        <form className="mt-5 flex flex-col gap-4 md:flex-row" onSubmit={handleSearch}>
          <input className="min-h-14 flex-1 rounded-none border border-black bg-[#f0f0e8] px-4 py-3 outline-none focus:bg-[#e5e5e0] focus:ring-2 focus:ring-[#1d4ed8]" value={query} onChange={(event) => setQuery(event.target.value)} />
          <Button disabled={isSearching} tone="ink" type="submit">{isSearching ? "检索中" : "检索"}</Button>
        </form>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {results.map((result) => (
            <article className="border border-black bg-[#f0f0e8] p-5 shadow-sw-xs" key={`${result.id}-${result.score ?? "fallback"}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <h3 className="text-xl font-black">{result.title || "未命名结果"}</h3>
                <span className="border border-black bg-[#15803d] px-2 py-1 font-mono text-xs font-bold text-white">
                  {typeof result.score === "number" ? result.score.toFixed(3) : "n/a"}
                </span>
              </div>
              <p className="mt-4 whitespace-pre-wrap font-mono text-xs uppercase leading-5 text-[#6b7280]">{result.content}</p>
              <pre className="mt-4 whitespace-pre-wrap border border-black bg-black p-3 font-mono text-xs leading-5 text-white">
                {JSON.stringify(result.metadata, null, 2)}
              </pre>
            </article>
          ))}
        </div>
      </Card>
      <ConfirmDialog
        description={`将删除“${deleteTarget?.title ?? "这份知识文档"}”；已写入 PGvector 的索引分块也会一起清理。`}
        isOpen={Boolean(deleteTarget)}
        isWorking={Boolean(deletingId)}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => void handleDelete(deleteTarget)}
        title="删除这份知识文档？"
      />
    </AppShell>
  );
}

function SelectField({
  label,
  onChange,
  options,
  value,
}: {
  label: string;
  onChange: (value: string) => void;
  options: Array<{ description: string; label: string; value: string }>;
  value: string;
}) {
  const selected = options.find((option) => option.value === value);

  return (
    <label className="block font-mono text-xs font-black uppercase tracking-[0.18em]">
      {label}
      <select
        className="mt-2 w-full rounded-none border border-black bg-[#f0f0e8] px-4 py-3 outline-none focus:bg-[#e5e5e0] focus:ring-2 focus:ring-[#1d4ed8]"
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {selected ? <span className="mt-2 block font-sans text-xs font-normal leading-5 tracking-normal text-[#6b7280]">{selected.description}</span> : null}
    </label>
  );
}

function Field({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="block font-mono text-xs font-black uppercase tracking-[0.18em]">
      {label}
      <input className="mt-2 w-full rounded-none border border-black bg-[#f0f0e8] px-4 py-3 outline-none focus:bg-[#e5e5e0] focus:ring-2 focus:ring-[#1d4ed8]" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function labelFor(options: Array<{ label: string; value: string }>, value: string | null) {
  if (!value) {
    return "未知来源";
  }
  return options.find((option) => option.value === value)?.label ?? value;
}
