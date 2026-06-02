import Link from "next/link";
import { buildEnterpriseLifecycleFoundation } from "@/lib/commercialization/lifecycle/index";

export const dynamic = "force-dynamic";

function readyLabel(ready: boolean) {
  return ready ? "text-emerald-400" : "text-amber-400";
}

export default function LifecyclePage() {
  const lifecycle = buildEnterpriseLifecycleFoundation({ deploymentId: "lifecycle-page" });
  const { continuity, completion, manifest } = lifecycle;

  const stageSections = [
    { title: "Lifecycle Stages", stages: continuity.lifecycleStages },
    { title: "Continuity Stages", stages: continuity.continuityStages },
    { title: "Governance Continuity", stages: continuity.governanceStages },
    { title: "Operational Continuity", stages: continuity.operationalStages },
  ];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-emerald-400/90">V3.7-H24 · Enterprise Lifecycle</p>
          <h1 className="text-3xl font-bold">Lifecycle Continuity & Completion</h1>
          <p className="text-sm text-zinc-400">
            Lifecycle continuity · production / governance / operational completion · archival & retention
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Lifecycle", ready: completion.lifecycleReady },
            { label: "Continuity", ready: completion.continuityReady },
            { label: "Governance", ready: completion.governanceContinuityReady },
            { label: "Operational", ready: completion.operationalContinuityReady },
            { label: "Archival", ready: completion.archivalContinuityReady },
            { label: "Preservation", ready: completion.preservationContinuityReady },
            { label: "Enterprise", ready: manifest.readyForEnterprise },
            { label: "Confidence", ready: completion.confidenceScore >= 80 },
          ].map((item) => (
            <article key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="text-sm font-semibold text-zinc-400">{item.label}</h2>
              <p className={readyLabel(item.ready)}>
                {item.label === "Confidence" ? `${completion.confidenceScore}%` : item.ready ? "Complete" : "Pending"}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-5">
          <h2 className="mb-2 text-lg font-semibold">Lifecycle Completion Summary</h2>
          <p className="font-mono text-xs text-zinc-500">{completion.summary}</p>
          <p className="mt-2 font-mono text-xs text-zinc-600">{manifest.summary}</p>
        </section>

        <section className="space-y-4">
          {stageSections.map((section) => (
            <article key={section.title} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="mb-3 text-lg font-semibold">{section.title}</h2>
              <ul className="space-y-2 text-sm">
                {section.stages.map((stage) => (
                  <li key={stage.id} className="flex items-start justify-between gap-2">
                    <span className="text-zinc-300">
                      {stage.href ? (
                        <Link href={stage.href} className="underline hover:text-white">
                          {stage.label}
                        </Link>
                      ) : (
                        stage.label
                      )}
                      <span className="ml-2 text-xs text-zinc-600">{stage.phase}</span>
                      <p className="text-xs text-zinc-600">{stage.description}</p>
                    </span>
                    <span className={readyLabel(stage.ready)}>{stage.ready ? "Ready" : "Pending"}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Archival Continuity</h2>
            <p className="mb-2 text-sm text-zinc-400">{continuity.archivalStages.length} archival stages</p>
            <ul className="space-y-1 font-mono text-xs text-zinc-600">
              {continuity.archivalStages.slice(0, 6).map((s) => (
                <li key={s.id}>
                  [{s.ready ? "ready" : "pending"}] {s.label}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Preservation Continuity</h2>
            <p className="mb-2 text-sm text-zinc-400">{continuity.preservationStages.length} preservation stages</p>
            <ul className="space-y-1 font-mono text-xs text-zinc-600">
              {continuity.preservationStages.slice(0, 6).map((s) => (
                <li key={s.id}>
                  [{s.ready ? "ready" : "pending"}] {s.label}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5">
          <Link href="/api/commercialization/lifecycle" className="text-sm text-emerald-300 underline">
            Open lifecycle API (JSON)
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{lifecycle.foundationSummary}</p>

        <div className="flex gap-4 text-sm">
          <Link href="/dashboard/archive-access" className="text-zinc-400 underline hover:text-zinc-200">
            ← Retention Review
          </Link>
          <Link href="/dashboard/archival" className="text-zinc-400 underline hover:text-zinc-200">
            Enterprise Archival
          </Link>
          <Link href="/dashboard" className="text-zinc-400 underline hover:text-zinc-200">
            控制台
          </Link>
        </div>
      </div>
    </main>
  );
}
