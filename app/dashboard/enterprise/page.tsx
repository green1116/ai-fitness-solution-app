import Link from "next/link";
import { buildUnifiedDashboardOverview } from "@/lib/commercialization/dashboard-integration/index";

export const dynamic = "force-dynamic";

function statusClass(status: string) {
  if (status === "pass") return "text-emerald-400";
  if (status === "warn") return "text-amber-400";
  return "text-rose-400";
}

export default function EnterpriseDashboardPage() {
  const overview = buildUnifiedDashboardOverview({ deploymentId: "enterprise-dashboard-page" });
  const { integration, manifest, summaries } = overview;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-cyan-400/90">V3.7-H14 · Enterprise Dashboard</p>
          <h1 className="text-3xl font-bold">Unified Enterprise Dashboard</h1>
          <p className="text-sm text-zinc-400">
            统一企业仪表盘 — governance / audit / release / ops 只读整合视图。
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-sm font-semibold text-zinc-400">Dashboard</h2>
            <p className={manifest.readyForDashboard ? "text-emerald-400" : "text-amber-400"}>
              {manifest.readyForDashboard ? "Ready" : "Pending"}
            </p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-sm font-semibold text-zinc-400">Governance</h2>
            <p className={manifest.readyForGovernance ? "text-emerald-400" : "text-amber-400"}>
              {manifest.readyForGovernance ? "Ready" : "Pending"}
            </p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-sm font-semibold text-zinc-400">Audit</h2>
            <p className={manifest.readyForAudit ? "text-emerald-400" : "text-amber-400"}>
              {manifest.readyForAudit ? "Ready" : "Pending"}
            </p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-sm font-semibold text-zinc-400">Release</h2>
            <p className={manifest.readyForRelease ? "text-emerald-400" : "text-amber-400"}>
              {manifest.readyForRelease ? "Ready" : "Pending"}
            </p>
          </article>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-3 text-lg font-semibold">Unified Summaries</h2>
          <ul className="space-y-2 font-mono text-xs text-zinc-500">
            <li>{summaries.opsSummary}</li>
            <li>{summaries.governanceSummary}</li>
            <li>{summaries.auditSummary.slice(0, 120)}…</li>
            <li>{summaries.releaseSummary}</li>
            <li>{summaries.observabilitySummary}</li>
          </ul>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {integration.sections.map((section) => (
            <article key={section.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="mb-3 text-lg font-semibold">{section.label}</h2>
              <ul className="space-y-2 text-sm">
                {section.widgets.map((widget) => (
                  <li key={widget.id}>
                    <Link href={widget.href} className="text-sky-300 underline">
                      {widget.label}
                    </Link>
                    <span className={`ml-2 text-xs ${statusClass(widget.status)}`}>{widget.status}</span>
                    <p className="text-xs text-zinc-600">{widget.summary}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-5">
          <Link href="/api/commercialization/dashboard-overview" className="text-sm text-sky-300 underline">
            Open dashboard overview API (JSON)
          </Link>
          <span className="mx-2 text-zinc-600">·</span>
          <Link href="/dashboard/ops" className="text-sm text-sky-300 underline">
            Enterprise ops portal
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{overview.summary}</p>

        <Link href="/dashboard" className="text-sm text-zinc-400 underline hover:text-zinc-200">
          ← 返回控制台
        </Link>
      </div>
    </main>
  );
}
