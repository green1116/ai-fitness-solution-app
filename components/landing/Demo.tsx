"use client";

import { useState } from "react";
import Link from "next/link";
import type { DemoOrchestratorResult } from "@/lib/demo/demo.types";
import {
  trackDemoComplete,
  trackDemoStart,
  trackSignupClick,
} from "@/lib/landing/conversion/conversion.tracker";
import { trackFunnelStage } from "@/lib/landing/conversion/funnel.tracker";
import { resolveSignupRedirect } from "@/lib/landing/conversion/signup.redirect";

export function Demo() {
  const [companySize, setCompanySize] = useState("200-500人");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DemoOrchestratorResult | null>(null);

  async function onGenerate() {
    setLoading(true);
    const companyName = `体验企业（${companySize}）`;
    trackDemoStart({ companyName, sessionId: `landing-${Date.now()}` });
    trackFunnelStage("demo_click", { source: "landing-inline" });

    try {
      const res = await fetch("/api/demo/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, companySize, goal: "员工健康福利" }),
      });
      const data = await res.json();
      if (data.ok) {
        setResult(data.result);
        trackDemoComplete({
          sessionId: data.result.sessionId,
          hasQuote: true,
          hasBudget: true,
          hasTender: true,
        });
        trackFunnelStage("demo_result", { sessionId: data.result.sessionId });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <section
      id="demo-preview"
      className="rounded-3xl border-2 border-emerald-200 bg-gradient-to-b from-emerald-50 to-white px-8 py-12"
    >
      <div className="text-center">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-600">
          核心转化点
        </p>
        <h2 className="mt-2 text-2xl font-bold text-zinc-900 md:text-3xl">
          用户输入 → AI 实时生成
        </h2>
        <p className="mt-2 text-zinc-600">Quote · Budget · Tender 三合一预览</p>
      </div>

      <div className="mx-auto mt-8 flex max-w-xl flex-col gap-4 sm:flex-row sm:items-end">
        <label className="block flex-1 text-sm font-medium text-zinc-700">
          公司规模
          <select
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
            className="mt-1.5 w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 text-zinc-900"
          >
            <option>50-200人</option>
            <option>200-500人</option>
            <option>500人以上</option>
          </select>
        </label>
        <button
          type="button"
          onClick={onGenerate}
          disabled={loading}
          className="rounded-lg bg-emerald-600 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-60 sm:shrink-0"
        >
          {loading ? "AI 生成中…" : "Generate Demo"}
        </button>
      </div>

      {result ? (
        <div className="mt-10 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <PreviewCard
              title="Quote Preview"
              subtitle="方案"
              body={result.quote.summary}
              extra={result.quote.estimatedArea}
            />
            <PreviewCard
              title="Budget Preview"
              subtitle="预算"
              body={`总计 ¥${result.budget.total.toLocaleString()}`}
              extra={result.budget.breakdown[0] ? `${result.budget.breakdown[0].category} ¥${result.budget.breakdown[0].amount.toLocaleString()}` : undefined}
            />
            <PreviewCard
              title="Tender Preview"
              subtitle="标书"
              body={result.tender.preview}
              extra={`合规评分 ${result.tender.complianceScore}`}
            />
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-center">
            <p className="text-sm font-medium text-amber-900">注册解锁完整 PDF 与项目保存</p>
            <Link
              href={resolveSignupRedirect("landing-demo", result.sessionId)}
              onClick={() => trackSignupClick({ source: "landing-demo", cta: "register" })}
              className="mt-4 inline-block rounded-lg bg-zinc-900 px-6 py-2.5 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              立即注册 · 保存方案
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-3">
          <PlaceholderCard title="Quote Preview" desc="有氧区 · 力量区 · 面积规划" />
          <PlaceholderCard title="Budget Preview" desc="设备 / 安装 / 运维分项" />
          <PlaceholderCard title="Tender Preview" desc="合规评分 · 章节结构" />
        </div>
      )}
    </section>
  );
}

function PreviewCard({
  title,
  subtitle,
  body,
  extra,
}: {
  title: string;
  subtitle: string;
  body: string;
  extra?: string;
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">{title}</p>
      <p className="text-sm text-zinc-500">{subtitle}</p>
      <p className="mt-3 text-sm leading-relaxed text-zinc-800">{body}</p>
      {extra ? <p className="mt-2 text-xs text-zinc-500">{extra}</p> : null}
    </div>
  );
}

function PlaceholderCard({ title, desc }: { title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-zinc-300 bg-white/60 p-5 text-center">
      <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{title}</p>
      <p className="mt-2 text-sm text-zinc-500">{desc}</p>
      <p className="mt-4 text-xs text-emerald-600">点击 Generate Demo 预览</p>
    </div>
  );
}
