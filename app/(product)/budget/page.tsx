"use client";

import { useState } from "react";

export default function BudgetPage() {
  const [quoteId, setQuoteId] = useState("");
  const [companySize, setCompanySize] = useState("100");
  const [budgetTier, setBudgetTier] = useState<"low" | "mid" | "high">("mid");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  async function handleCalculate() {
    if (!quoteId) {
      alert("请填写 Quote ID");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const res = await fetch("/api/budget/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          quoteId,
          companySize: Number(companySize),
          budgetTier,
        }),
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
      <h1 className="text-2xl font-bold">预算计算 Budget</h1>
      <p className="text-sm text-zinc-400">根据 Quote → 成本模型 → 价格区间</p>

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <input
          className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
          placeholder="Quote ID"
          value={quoteId}
          onChange={(e) => setQuoteId(e.target.value)}
        />
        <input
          className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
          placeholder="企业规模 (人数)"
          value={companySize}
          onChange={(e) => setCompanySize(e.target.value)}
        />
        <select
          className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
          value={budgetTier}
          onChange={(e) => setBudgetTier(e.target.value as "low" | "mid" | "high")}
        >
          <option value="low">低档</option>
          <option value="mid">中档</option>
          <option value="high">高档</option>
        </select>
        <button
          type="button"
          onClick={handleCalculate}
          disabled={loading}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "计算中…" : "计算预算"}
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
