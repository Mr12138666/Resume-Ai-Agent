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

const starterContent = `Resume optimization rules:
- Lead bullets with measurable impact, business context, and the action taken.
- Mirror critical JD keywords only when the resume has truthful evidence.
- Prefer "built, optimized, migrated, automated" verbs over vague ownership language.
- Keep each bullet concise, concrete, and ATS-readable.`;

export default function KnowledgePage() {
  const [documents, setDocuments] = useState<KnowledgeDocumentResponse[]>([]);
  const [documentType, setDocumentType] = useState("resume_rule");
  const [sourceType, setSourceType] = useState("manual");
  const [title, setTitle] = useState("ATS bullet rewriting rules");
  const [content, setContent] = useState(starterContent);
  const [query, setQuery] = useState("How should I rewrite backend engineering resume bullets for ATS?");
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
      setError(loadError instanceof Error ? loadError.message : "Failed to load knowledge documents.");
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
      setError("Document type, title, and content are required.");
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
      setError(createError instanceof Error ? createError.message : "Failed to create knowledge document.");
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
      setError(indexError instanceof Error ? indexError.message : "Failed to index knowledge document.");
    } finally {
      setIndexingId(null);
    }
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!query.trim()) {
      setError("Search query is required.");
      return;
    }

    setIsSearching(true);
    setError(null);
    setResults([]);
    try {
      setResults(await searchKnowledge({ query: query.trim(), topK: 5 }));
    } catch (searchError) {
      setError(searchError instanceof Error ? searchError.message : "Knowledge search failed.");
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <main className="min-h-screen bg-[linear-gradient(135deg,#f8f5eb,#edf3dc_55%,#d7e1d0)] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.35em] text-slate-600">RAG Workbench</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              Build the memory your resume agent can cite.
            </h1>
          </div>
          <Link
            className="border-2 border-slate-950 bg-white px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider shadow-[5px_5px_0_#0f172a]"
            href="/upload"
          >
            Back to workflow
          </Link>
        </div>

        <p className="mt-6 max-w-3xl text-lg leading-8 text-slate-700">
          Create resume optimization knowledge, index it into PGvector, then search it the same way the analysis and rewrite pipeline will retrieve guidance.
        </p>

        {error ? (
          <p className="mt-6 border-2 border-red-900 bg-red-50 p-4 text-red-900">{error}</p>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <form
            className="border-2 border-slate-950 bg-white p-8 shadow-[8px_8px_0_#0f172a]"
            onSubmit={handleCreate}
          >
            <h2 className="font-mono text-xl font-bold">1. Create knowledge</h2>
            <p className="mt-4 leading-7 text-slate-700">
              Store reusable rules, role rubrics, ATS heuristics, or interview-positioning notes before vector indexing.
            </p>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              <label className="block font-mono text-sm font-bold uppercase tracking-widest">
                Document type
                <input
                  className="mt-3 w-full border-2 border-slate-950 px-4 py-3 font-serif text-base outline-none focus:bg-[#eef4dd]"
                  value={documentType}
                  onChange={(event) => setDocumentType(event.target.value)}
                />
              </label>
              <label className="block font-mono text-sm font-bold uppercase tracking-widest">
                Source type
                <input
                  className="mt-3 w-full border-2 border-slate-950 px-4 py-3 font-serif text-base outline-none focus:bg-[#eef4dd]"
                  value={sourceType}
                  onChange={(event) => setSourceType(event.target.value)}
                />
              </label>
            </div>

            <label className="mt-6 block font-mono text-sm font-bold uppercase tracking-widest">
              Title
              <input
                className="mt-3 w-full border-2 border-slate-950 px-4 py-3 font-serif text-base outline-none focus:bg-[#eef4dd]"
                value={title}
                onChange={(event) => setTitle(event.target.value)}
              />
            </label>

            <label className="mt-6 block font-mono text-sm font-bold uppercase tracking-widest">
              Content
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
              {isCreating ? "Creating..." : "Create document"}
            </button>
          </form>

          <section className="border-2 border-slate-950 bg-[#eef4dd] p-8 shadow-[8px_8px_0_#95a36a]">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-mono text-xl font-bold">2. Index documents</h2>
                <p className="mt-2 leading-7 text-slate-700">
                  Indexed documents become retrievable context for RAG scoring and rewrite prompts.
                </p>
              </div>
              <button
                className="border-2 border-slate-950 bg-white px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider shadow-[4px_4px_0_#0f172a] disabled:opacity-60"
                disabled={isLoading}
                onClick={refreshDocuments}
                type="button"
              >
                {isLoading ? "Loading..." : "Refresh"}
              </button>
            </div>

            <div className="mt-6 space-y-4">
              {documents.length > 0 ? (
                documents.map((document) => (
                  <article key={document.id} className="border-2 border-slate-950 bg-white p-4">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="font-mono text-xs uppercase tracking-widest text-slate-600">
                          {document.documentType} · {document.sourceType || "unknown"}
                        </p>
                        <h3 className="mt-2 text-xl font-black">{document.title}</h3>
                        <p className="mt-1 font-mono text-xs text-slate-600">Status: {document.status}</p>
                      </div>
                      <button
                        className="border-2 border-slate-950 bg-slate-950 px-4 py-2 font-mono text-xs font-bold uppercase tracking-wider text-white shadow-[4px_4px_0_#95a36a] disabled:opacity-60"
                        disabled={indexingId === document.id}
                        onClick={() => handleIndex(document.id)}
                        type="button"
                      >
                        {indexingId === document.id ? "Indexing..." : "Index"}
                      </button>
                    </div>
                    <p className="mt-4 line-clamp-4 whitespace-pre-wrap text-sm leading-6 text-slate-700">
                      {document.content}
                    </p>
                  </article>
                ))
              ) : (
                <p className="border-2 border-dashed border-slate-950 bg-white/70 p-6 leading-7 text-slate-700">
                  {isLoading ? "Loading knowledge documents..." : "No knowledge documents yet. Create one on the left."}
                </p>
              )}
            </div>
          </section>
        </div>

        <form className="mt-8 border-2 border-slate-950 bg-white p-8 shadow-[8px_8px_0_#0f172a]" onSubmit={handleSearch}>
          <h2 className="font-mono text-xl font-bold">3. Search RAG context</h2>
          <p className="mt-4 leading-7 text-slate-700">
            This calls the PGvector-backed search endpoint and shows the exact snippets the agent can use as grounding.
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
              {isSearching ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {results.map((result) => (
              <article key={`${result.id}-${result.score ?? "fallback"}`} className="border-2 border-slate-950 bg-[#f8f5eb] p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <h3 className="text-xl font-black">{result.title || "Untitled result"}</h3>
                  <span className="border border-slate-950 bg-white px-2 py-1 font-mono text-xs">
                    score {typeof result.score === "number" ? result.score.toFixed(3) : "n/a"}
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
