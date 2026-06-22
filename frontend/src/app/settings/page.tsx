"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { type SettingsResponse, type SystemStatusResponse, getSettings, getSystemStatus } from "@/lib/api/client";

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsResponse | null>(null);
  const [status, setStatus] = useState<SystemStatusResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  async function loadSettings() {
    setIsLoading(true);
    setError(null);
    try {
      const [loadedSettings, loadedStatus] = await Promise.all([
        getSettings(),
        getSystemStatus(),
      ]);
      setSettings(loadedSettings);
      setStatus(loadedStatus);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "系统配置加载失败。");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void loadSettings();
  }, []);

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_20%_12%,#dce8c4,transparent_24rem),linear-gradient(135deg,#f8f5eb,#e7eee0)] px-6 py-10 text-slate-950">
      <section className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="font-mono text-sm uppercase tracking-[0.35em] text-slate-600">系统配置</p>
            <h1 className="mt-4 max-w-4xl text-4xl font-black leading-tight md:text-6xl">
              查看模型、RAG、存储和运行状态，不暴露任何密钥。
            </h1>
          </div>
          <button
            className="border-2 border-slate-950 bg-white px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider shadow-[5px_5px_0_#0f172a] disabled:opacity-60"
            disabled={isLoading}
            onClick={loadSettings}
            type="button"
          >
            {isLoading ? "加载中..." : "刷新"}
          </button>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link className="border-2 border-slate-950 bg-slate-950 px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider text-white shadow-[5px_5px_0_#95a36a]" href="/dashboard">
            工作台
          </Link>
          <Link className="border-2 border-slate-950 bg-white px-5 py-3 font-mono text-sm font-bold uppercase tracking-wider shadow-[5px_5px_0_#0f172a]" href="/demo">
            演示
          </Link>
        </div>

        {error ? (
          <p className="mt-6 border-2 border-red-900 bg-red-50 p-4 text-red-900">{error}</p>
        ) : null}

        {settings ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-2">
            <SettingsCard
              rows={[
                ["模型提供方", settings.ai.provider],
                ["Spring 聊天模式", settings.ai.springChatModel],
                ["Spring 向量模式", settings.ai.springEmbeddingModel],
                ["OpenAI 兼容地址", settings.ai.openAiBaseUrl],
                ["聊天模型", settings.ai.openAiChatModel],
                ["向量模型", settings.ai.openAiEmbeddingModel],
                ["API Key", settings.ai.openAiApiKeyConfigured ? "已配置" : "未配置"],
                ["Ollama 地址", settings.ai.ollamaBaseUrl],
                ["Ollama 聊天模型", settings.ai.ollamaChatModel],
                ["Ollama 向量模型", settings.ai.ollamaEmbeddingModel],
              ]}
              title="AI 模型"
            />
            <SettingsCard
              rows={[
                ["向量维度", String(settings.rag.embeddingDimensions)],
                ["Top K", String(settings.rag.topK)],
                ["相似度阈值", String(settings.rag.similarityThreshold)],
              ]}
              title="RAG and PGvector"
            />
            <SettingsCard
              rows={[
                ["服务地址", settings.storage.endpoint],
                ["Bucket", settings.storage.bucket],
                ["Access Key", settings.storage.accessKeyConfigured ? "已配置" : "未配置"],
                ["Secret Key", settings.storage.secretKeyConfigured ? "已配置" : "未配置"],
              ]}
              title="MinIO storage"
            />
            <SettingsCard
              rows={[
                ["启用", settings.redis.enabled ? "是" : "否"],
                ["主机", settings.redis.host],
                ["端口", String(settings.redis.port)],
                ["密码", settings.redis.passwordConfigured ? "已配置" : "未配置"],
              ]}
              title="Redis"
            />
          </div>
        ) : null}

        {status ? (
          <section className="mt-8 border-2 border-slate-950 bg-[#eef4dd] p-6 shadow-[8px_8px_0_#95a36a]">
            <h2 className="font-mono text-xl font-bold">运行状态</h2>
            <div className="mt-5 grid gap-3 md:grid-cols-3">
              {status.components.map((component) => (
                <article key={component.name} className="border-2 border-slate-950 bg-white p-4">
                  <p className="font-mono text-xs uppercase tracking-widest text-slate-600">{component.name}</p>
                  <p className="mt-2 font-black">{component.status}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-700">{component.detail}</p>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </section>
    </main>
  );
}

function SettingsCard({
  rows,
  title,
}: {
  rows: Array<[string, string]>;
  title: string;
}) {
  return (
    <section className="border-2 border-slate-950 bg-white p-6 shadow-[8px_8px_0_#0f172a]">
      <h2 className="font-mono text-xl font-bold">{title}</h2>
      <dl className="mt-5 space-y-3">
        {rows.map(([label, value]) => (
          <div className="grid gap-2 border-b border-slate-200 pb-3 md:grid-cols-[0.6fr_1fr]" key={label}>
            <dt className="font-mono text-xs uppercase tracking-widest text-slate-600">{label}</dt>
            <dd className="break-all font-bold">{value || "未配置"}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
