import Link from "next/link";
import { buildEnterprisePreservationClosureFoundation } from "@/lib/commercialization/preservation-closure/index";

export const dynamic = "force-dynamic";

function readyLabel(ready: boolean) {
  return ready ? "text-emerald-400" : "text-amber-400";
}

export default function PreservationClosurePage() {
  const foundation = buildEnterprisePreservationClosureFoundation({
    deploymentId: "preservation-closure-page",
  });
  const { closure, summary, manifest } = foundation;

  const stageSections = [
    { title: "Preservation Stages", stages: closure.preservationStages },
    { title: "Closure Stages", stages: closure.closureStages },
    { title: "Governance Closure", stages: closure.governanceClosureStages },
    { title: "Operational Closure", stages: closure.operationalClosureStages },
    { title: "Lifecycle Closure", stages: closure.lifecycleClosureStages },
  ];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-fuchsia-400/90">V3.7-H25 · Preservation Closure</p>
          <h1 className="text-3xl font-bold">Enterprise Preservation Closure</h1>
          <p className="text-sm text-zinc-400">
            Lifecycle archival closure · governance / audit / operational preservation · enterprise finalization
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Preservation", ready: summary.preservationReady },
            { label: "Closure", ready: summary.closureReady },
            { label: "Governance", ready: summary.governanceClosureReady },
            { label: "Operational", ready: summary.operationalClosureReady },
            { label: "Archival", ready: summary.archivalClosureReady },
            { label: "Lifecycle", ready: summary.lifecycleClosureReady },
            { label: "Enterprise", ready: manifest.readyForEnterprise },
            { label: "Confidence", ready: summary.confidenceScore >= 80 },
          ].map((item) => (
            <article key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="text-sm font-semibold text-zinc-400">{item.label}</h2>
              <p className={readyLabel(item.ready)}>
                {item.label === "Confidence" ? `${summary.confidenceScore}%` : item.ready ? "Closed" : "Pending"}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-fuchsia-900/30 bg-fuchsia-950/10 p-5">
          <h2 className="mb-2 text-lg font-semibold">Preservation Closure Summary</h2>
          <p className="font-mono text-xs text-zinc-500">{summary.summary}</p>
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
                      <span className="ml-2 text-xs text-zinc-600">{stage.category}</span>
                      <p className="text-xs text-zinc-600">{stage.description}</p>
                    </span>
                    <span className={readyLabel(stage.ready)}>{stage.ready ? "Ready" : "Pending"}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-3 text-lg font-semibold">Archival Closure</h2>
          <p className="mb-2 text-sm text-zinc-400">{closure.archivalClosureStages.length} archival closure stages</p>
          <ul className="space-y-1 font-mono text-xs text-zinc-600">
            {closure.archivalClosureStages.slice(0, 8).map((s) => (
              <li key={s.id}>
                [{s.ready ? "closed" : "pending"}] {s.label}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-fuchsia-900/40 bg-fuchsia-950/20 p-5">
          <Link
            href="/api/commercialization/preservation-closure"
            className="text-sm text-fuchsia-300 underline"
          >
            Open preservation closure API (JSON)
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{foundation.foundationSummary}</p>

        <div className="flex gap-4 text-sm">
          <Link href="/dashboard/lifecycle" className="text-zinc-400 underline hover:text-zinc-200">
            ← Lifecycle Continuity
          </Link>
          <Link href="/dashboard/archive-access" className="text-zinc-400 underline hover:text-zinc-200">
            Retention Review
          </Link>
          <Link href="/dashboard" className="text-zinc-400 underline hover:text-zinc-200">
            控制台
          </Link>
        </div>
      </div>
    </main>
  );
}
