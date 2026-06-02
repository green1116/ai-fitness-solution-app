import Link from "next/link";
import { buildProductionCommandCenterFoundation } from "@/lib/commercialization/command-center/index";

export const dynamic = "force-dynamic";

function readyLabel(ready: boolean) {
  return ready ? "text-emerald-400" : "text-amber-400";
}

export default function CommandCenterPage() {
  const center = buildProductionCommandCenterFoundation({ deploymentId: "command-center-page" });
  const { config, summary, manifest } = center;
  const readiness = summary.readinessSummary;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-amber-400/90">V3.7-H15 · Enterprise Command Center</p>
          <h1 className="text-3xl font-bold">Unified Command Center</h1>
          <p className="text-sm text-zinc-400">
            企业总控台 — governance / audit / release / ops 一站式只读入口与状态概览。
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Command Center", ready: manifest.readyForCommandCenter },
            { label: "Ops", ready: readiness.readyForOps },
            { label: "Dashboard", ready: readiness.readyForDashboard },
            { label: "Governance", ready: readiness.readyForGovernance },
            { label: "Audit", ready: readiness.readyForAudit },
            { label: "Release", ready: readiness.readyForRelease },
            { label: "Access", ready: readiness.readyForAccess },
            { label: "Observability", ready: readiness.readyForObservability },
          ].map((item) => (
            <article key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="text-sm font-semibold text-zinc-400">{item.label}</h2>
              <p className={readyLabel(item.ready)}>{item.ready ? "Ready" : "Pending"}</p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-3 text-lg font-semibold">Readiness Summary</h2>
          <p className="font-mono text-xs text-zinc-500">{readiness.summary}</p>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-3 text-lg font-semibold">Unified Summaries</h2>
          <ul className="space-y-1 font-mono text-xs text-zinc-600">
            <li>{summary.opsSummary}</li>
            <li>{summary.dashboardSummary}</li>
            <li>{summary.releaseSummary}</li>
            <li>{summary.governanceSummary}</li>
            <li>{summary.accessSummary}</li>
            <li>{summary.observabilitySummary.slice(0, 100)}…</li>
          </ul>
        </section>

        <section className="rounded-xl border border-amber-900/30 bg-amber-950/10 p-5">
          <h2 className="mb-3 text-lg font-semibold">Shortcuts</h2>
          <div className="flex flex-wrap gap-2">
            {config.shortcuts.map((shortcut) => (
              <Link
                key={shortcut.id}
                href={shortcut.href}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
              >
                {shortcut.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {config.sections.map((section) => (
            <article key={section.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="mb-3 text-lg font-semibold">{section.label}</h2>
              <ul className="space-y-2 text-sm">
                {section.modules.map((mod) => (
                  <li key={mod.id}>
                    <Link href={mod.href} className="text-sky-300 underline">
                      {mod.label}
                    </Link>
                    <p className="text-xs text-zinc-600">{mod.description}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-amber-900/40 bg-amber-950/20 p-5">
          <Link href="/api/commercialization/command-center" className="text-sm text-sky-300 underline">
            Open command center API (JSON)
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{center.foundationSummary}</p>

        <Link href="/dashboard" className="text-sm text-zinc-400 underline hover:text-zinc-200">
          ← 返回控制台
        </Link>
      </div>
    </main>
  );
}
