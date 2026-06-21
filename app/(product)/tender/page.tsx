"use client";

import { useState } from "react";

export default function TenderPage() {
  const [projectId, setProjectId] = useState("");
  const [quoteId, setQuoteId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function handleGenerate() {
    if (!projectId || !quoteId) {
      alert("请填写 Project ID 与 Quote ID");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/tender/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, quoteId }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch {
      setResult("请求失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">标书生成 Tender</h1>
      <p className="text-sm text-zinc-400">Budget + Quote → PDF Engine → 招标文件（核心商业点）</p>

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <input
          className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
          placeholder="Project ID"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
          placeholder="Quote ID"
          value={quoteId}
          onChange={(e) => setQuoteId(e.target.value)}
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "生成中…" : "生成标书 PDF"}
        </button>
      </section>

      {result ? (
        <pre className="overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300">
          {result}
        </pre>
      ) : null}
    </div>
  );
}
