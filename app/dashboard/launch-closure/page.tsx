import Link from "next/link";
import { buildEnterpriseLaunchClosureFoundation } from "@/lib/commercialization/launch-closure/index";

export const dynamic = "force-dynamic";

function statusLabel(status: string) {
  return status === "complete" ? "text-emerald-400" : "text-amber-400";
}

function readyLabel(ready: boolean) {
  return ready ? "text-emerald-400" : "text-amber-400";
}

export default function LaunchClosurePage() {
  const foundation = buildEnterpriseLaunchClosureFoundation({ deploymentId: "launch-closure-page" });
  const { checklist, closure, manifest } = foundation;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-teal-400/90">V3.7-H21 · Launch Closure</p>
          <h1 className="text-3xl font-bold">Enterprise Launch Closure</h1>
          <p className="text-sm text-zinc-400">
            Launch finalization · enterprise readiness closure · governance / ops / rollout completion
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Closure", ready: closure.readyForClosure },
            { label: "Rollout", ready: closure.rolloutCompleted },
            { label: "Governance", ready: closure.governanceCompleted },
            { label: "Ops", ready: closure.opsCompleted },
            { label: "Audit", ready: closure.auditCompleted },
            { label: "Release", ready: closure.releaseCompleted },
            { label: "Archive", ready: manifest.readyForArchive },
            { label: "Enterprise", ready: manifest.readyForEnterprise },
          ].map((item) => (
            <article key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="text-sm font-semibold text-zinc-400">{item.label}</h2>
              <p className={readyLabel(item.ready)}>{item.ready ? "Complete" : "Pending"}</p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-teal-900/30 bg-teal-950/10 p-5">
          <h2 className="mb-2 text-lg font-semibold">Readiness Closure Summary</h2>
          <p className="text-2xl font-bold text-teal-300">{closure.confidenceScore}%</p>
          <p className="mt-1 font-mono text-xs text-zinc-500">{closure.summary}</p>
          <p className="mt-2 font-mono text-xs text-zinc-600">{manifest.summary}</p>
        </section>

        <section className="space-y-4">
          {checklist.completionGroups.map((group) => {
            const items = checklist.closureItems.filter((i) => group.itemIds.includes(i.id));
            return (
              <article key={group.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
                <h2 className="mb-3 text-lg font-semibold">{group.label}</h2>
                <ul className="space-y-2 text-sm">
                  {items.map((item) => (
                    <li key={item.id} className="flex items-start justify-between gap-2">
                      <span className="text-zinc-300">
                        {item.href ? (
                          <Link href={item.href} className="underline hover:text-white">
                            {item.label}
                          </Link>
                        ) : (
                          item.label
                        )}
                        <span className="ml-2 text-xs text-zinc-600">
                          {item.group}
                          {item.required ? " · required" : ""}
                        </span>
                        <p className="text-xs text-zinc-600">{item.description}</p>
                      </span>
                      <span className={statusLabel(item.status)}>{item.status}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Rollout Completions</h2>
            <ul className="space-y-1 font-mono text-xs text-zinc-600">
              {checklist.rolloutCompletions.map((c) => (
                <li key={c.id}>
                  [{c.status}] {c.label}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Governance Completions</h2>
            <ul className="space-y-1 font-mono text-xs text-zinc-600">
              {checklist.governanceCompletions.map((c) => (
                <li key={c.id}>
                  [{c.status}] {c.label}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Ops Completions</h2>
            <ul className="space-y-1 font-mono text-xs text-zinc-600">
              {checklist.opsCompletions.map((c) => (
                <li key={c.id}>
                  [{c.status}] {c.label}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-xl border border-teal-900/40 bg-teal-950/20 p-5">
          <Link
            href="/api/commercialization/launch-closure"
            className="text-sm text-teal-300 underline"
          >
            Open launch closure API (JSON)
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{foundation.foundationSummary}</p>

        <div className="flex gap-4 text-sm">
          <Link href="/dashboard/go-live" className="text-zinc-400 underline hover:text-zinc-200">
            ← Go-Live Control
          </Link>
          <Link href="/dashboard/rollout" className="text-zinc-400 underline hover:text-zinc-200">
            Launch Checklist
          </Link>
          <Link href="/dashboard" className="text-zinc-400 underline hover:text-zinc-200">
            控制台
          </Link>
        </div>
      </div>
    </main>
  );
}
