"use client";

import { useEffect, useState } from "react";
import { DashboardNav } from "@/components/dashboard/DashboardNav";

type Baseline = {
  usage: { dau: number; wau: number; mau: number };
  funnel: { stage: string; count: number; rateFromRegister: number }[];
  trend: { date: string; activeUsers: number; events: number }[];
};

type Retention = {
  d1Retention: number;
  d7Retention: number;
  repeatUsageRate: number;
};

export default function GrowthDashboardPage() {
  const [baseline, setBaseline] = useState<Baseline | null>(null);
  const [retention, setRetention] = useState<Retention | null>(null);

  useEffect(() => {
    void Promise.all([fetch("/api/growth/baseline"), fetch("/api/growth/retention")]).then(
      async ([b, r]) => {
        const bd = await b.json();
        const rd = await r.json();
        if (bd.ok) setBaseline(bd.baseline);
        if (rd.ok) {
          setRetention({
            d1Retention: rd.d1Retention,
            d7Retention: rd.d7Retention,
            repeatUsageRate: rd.repeatUsageRate,
          });
        }
      },
    );
  }, []);

  if (!baseline || !retention) {
    return (
      <div className="space-y-6">
        <DashboardNav active="/growth" />
        <p className="animate-pulse text-zinc-400">加载增长基线…</p>
      </div>
    );
  }

  const maxTrend = Math.max(1, ...baseline.trend.map((t) => t.activeUsers));

  return (
    <div className="space-y-6">
      <DashboardNav active="/growth" />
      <div>
        <p className="text-xs uppercase tracking-widest text-violet-500">V63 P1 + P2</p>
        <h1 className="text-xl font-semibold text-white">Growth Baseline</h1>
      </div>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "DAU", value: baseline.usage.dau },
          { label: "WAU", value: baseline.usage.wau },
          { label: "MAU", value: baseline.usage.mau },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">{m.label}</p>
            <p className="mt-2 text-3xl font-semibold">{m.value}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {[
          { label: "D1 Retention", value: `${retention.d1Retention}%` },
          { label: "D7 Retention", value: `${retention.d7Retention}%` },
          { label: "Repeat Usage", value: `${retention.repeatUsageRate}%` },
        ].map((m) => (
          <div key={m.label} className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
            <p className="text-xs text-zinc-500">{m.label}</p>
            <p className="mt-2 text-3xl font-semibold">{m.value}</p>
          </div>
        ))}
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="font-medium">Activation Funnel</h2>
        <ul className="mt-3 space-y-2">
          {baseline.funnel.map((s) => (
            <li key={s.stage} className="flex justify-between text-sm text-zinc-400">
              <span className="capitalize">{s.stage}</span>
              <span>
                {s.count}
                <span className="ml-2 text-zinc-600">({s.rateFromRegister}%)</span>
              </span>
            </li>
          ))}
        </ul>
      </section>

      <section className="rounded-lg border border-zinc-800 bg-zinc-950 p-4">
        <h2 className="font-medium">7-Day Active Trend</h2>
        <div className="mt-4 space-y-2">
          {baseline.trend.map((t) => (
            <div key={t.date} className="flex items-center gap-3 text-sm">
              <span className="w-24 text-zinc-500">{t.date}</span>
              <div className="flex-1 h-2 rounded-full bg-zinc-800">
                <div
                  className="h-2 rounded-full bg-violet-600"
                  style={{ width: `${(t.activeUsers / maxTrend) * 100}%` }}
                />
              </div>
              <span className="w-16 text-right text-zinc-400">{t.activeUsers} users</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
