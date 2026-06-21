"use client";

import { useState } from "react";

export default function QuotePage() {
  const [projectId, setProjectId] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  async function handleGenerate() {
    if (!projectId || !companyName) {
      alert("请填写项目 ID 与企业名称");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/quote/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, companyName, workspaceId: "ws-default" }),
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
      <h1 className="text-2xl font-bold">方案生成 Quote</h1>
      <p className="text-sm text-zinc-400">输入企业信息 → 调用 V58 Orchestrator → 返回 AI 方案</p>

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <input
          className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
          placeholder="项目 ID (projectId)"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
          placeholder="企业名称"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "生成中…" : "生成方案"}
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
