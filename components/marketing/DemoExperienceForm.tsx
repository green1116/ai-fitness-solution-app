"use client";

import { useState } from "react";
import Link from "next/link";
import type { DemoOrchestratorResult } from "@/lib/demo/demo.types";
import { trackSignupClick } from "@/lib/landing/conversion/conversion.tracker";
import { resolveSignupRedirect } from "@/lib/landing/conversion/signup.redirect";

export function DemoExperienceForm() {
  const [companyName, setCompanyName] = useState("");
  const [companySize, setCompanySize] = useState("200-500人");
  const [goal, setGoal] = useState("员工健康福利");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DemoOrchestratorResult | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/demo/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyName, companySize, goal }),
      });
      const data = await res.json();
      if (data.ok) setResult(data.result);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-8">
      <form onSubmit={onSubmit} className="grid gap-4 rounded-2xl border border-zinc-200 p-6 md:grid-cols-2">
        <label className="block text-sm">
          企业名称
          <input
            required
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
            placeholder="例如：星河科技园区"
          />
        </label>
        <label className="block text-sm">
          企业规模
          <select
            value={companySize}
            onChange={(e) => setCompanySize(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          >
            <option>50-200人</option>
            <option>200-500人</option>
            <option>500人以上</option>
          </select>
        </label>
        <label className="block text-sm md:col-span-2">
          项目目标
          <input
            value={goal}
            onChange={(e) => setGoal(e.target.value)}
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2"
          />
        </label>
        <button
          type="submit"
          disabled={loading}
          className="md:col-span-2 rounded-lg bg-emerald-600 py-3 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-60"
        >
          {loading ? "生成中…" : "生成体验方案"}
        </button>
      </form>

      {result ? (
        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <PreviewCard
              title="方案"
              body={result.quote.title}
              extra={`${result.quote.summary} · ${result.quote.estimatedArea}`}
            />
            <PreviewCard title="预算" body={`总计 ¥${result.budget.total.toLocaleString()}`} />
            <PreviewCard title="投标" body={result.tender.preview} extra={`合规 ${result.tender.complianceScore}`} />
          </div>

          {result.quote.solutionPreview ? (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-zinc-200 p-4">
                <p className="text-xs font-medium uppercase text-emerald-600">规划依据</p>
                <ul className="mt-3 list-disc space-y-2 pl-4 text-sm text-zinc-700">
                  {result.quote.solutionPreview.rationale.map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-zinc-200 p-4">
                <p className="text-xs font-medium uppercase text-emerald-600">功能分区</p>
                <ul className="mt-3 flex flex-wrap gap-2 text-sm text-zinc-700">
                  {result.quote.solutionPreview.zones.map((zone) => (
                    <li
                      key={zone}
                      className="rounded-md border border-zinc-200 bg-zinc-50 px-2.5 py-1"
                    >
                      {zone}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-zinc-200 p-4">
                <p className="text-xs font-medium uppercase text-emerald-600">配置逻辑</p>
                <ul className="mt-3 space-y-3 text-sm text-zinc-700">
                  {result.quote.solutionPreview.equipmentRationale.map((item) => (
                    <li key={`${item.zone}-${item.name}`}>
                      <p className="font-medium text-zinc-900">
                        {item.name}
                        <span className="ml-1 text-xs font-normal text-zinc-500">
                          · {item.zone} ×{item.qty}
                        </span>
                      </p>
                      <p className="mt-1 text-zinc-600">{item.rationale}</p>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-zinc-200 p-4">
                <p className="text-xs font-medium uppercase text-emerald-600">实施建议</p>
                <ol className="mt-3 list-decimal space-y-3 pl-4 text-sm text-zinc-700">
                  {result.quote.solutionPreview.implementation.map((step) => (
                    <li key={step.name}>
                      <p className="font-medium text-zinc-900">
                        {step.name}
                        <span className="ml-1 text-xs font-normal text-zinc-500">
                          · {step.duration}
                        </span>
                      </p>
                      <p className="mt-1 text-zinc-600">{step.desc}</p>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-zinc-200 p-4">
              <p className="text-xs font-medium uppercase text-emerald-600">设备清单预览</p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                {result.quote.equipment.map((item) => (
                  <li key={`${item.zone}-${item.name}`} className="flex justify-between gap-3">
                    <span>
                      {item.name}
                      <span className="ml-1 text-xs text-zinc-500">· {item.zone}</span>
                    </span>
                    <span className="shrink-0 text-zinc-500">×{item.qty}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-zinc-200 p-4">
              <p className="text-xs font-medium uppercase text-emerald-600">预算分项预览</p>
              <ul className="mt-3 space-y-2 text-sm text-zinc-700">
                {result.budget.breakdown.map((row) => (
                  <li key={row.category} className="flex justify-between gap-3">
                    <span>{row.category}</span>
                    <span className="shrink-0">¥{row.amount.toLocaleString()}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-zinc-200 p-4">
              <p className="text-xs font-medium uppercase text-emerald-600">标书结构预览</p>
              <ol className="mt-3 list-decimal space-y-2 pl-4 text-sm text-zinc-700">
                {result.tender.sections.map((section) => (
                  <li key={section}>{section}</li>
                ))}
              </ol>
            </div>
          </div>

          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-medium text-amber-900">注册解锁完整能力</p>
            <ul className="mt-2 space-y-1 text-sm text-amber-800">
              {result.upsellPrompts.map((p) => (
                <li key={p}>→ {p}</li>
              ))}
            </ul>
            <Link
              href={resolveSignupRedirect("demo", result.sessionId)}
              onClick={() => trackSignupClick({ source: "demo", cta: "register" })}
              className="mt-4 inline-block rounded-lg bg-black px-5 py-2 text-sm font-semibold text-white"
            >
              立即注册 · 保存项目
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function PreviewCard({ title, body, extra }: { title: string; body: string; extra?: string }) {
  return (
    <div className="rounded-xl border border-zinc-200 p-4">
      <p className="text-xs font-medium uppercase text-emerald-600">{title}</p>
      <p className="mt-2 text-sm text-zinc-700">{body}</p>
      {extra ? <p className="mt-1 text-xs text-zinc-500">{extra}</p> : null}
    </div>
  );
}
