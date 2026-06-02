import Link from "next/link";
import { buildProductionGoLiveFoundation } from "@/lib/commercialization/go-live/index";

export const dynamic = "force-dynamic";

function statusLabel(status: string) {
  if (status === "complete") return "text-emerald-400";
  if (status === "optional") return "text-zinc-500";
  return "text-amber-400";
}

function readyLabel(ready: boolean) {
  return ready ? "text-emerald-400" : "text-amber-400";
}

export default function GoLivePage() {
  const goLive = buildProductionGoLiveFoundation({ deploymentId: "go-live-page" });
  const { checklist, freeze, manifest } = goLive;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-lime-400/90">V3.7-H20 · Production Go-Live</p>
          <h1 className="text-3xl font-bold">Go-Live Control & Launch Freeze</h1>
          <p className="text-sm text-zinc-400">
            Go-live readiness · launch freeze · approval gates · rollback awareness · operational handoff
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Go-Live", ready: freeze.readyForGoLive },
            { label: "Launch Frozen", ready: freeze.launchFrozen },
            { label: "Approvals", ready: freeze.approvalsReady },
            { label: "Rollback", ready: freeze.rollbackReady },
            { label: "Ops", ready: freeze.opsReady },
            { label: "Governance", ready: freeze.governanceReady },
            { label: "Freeze Gate", ready: manifest.readyForFreeze },
            { label: "Enterprise", ready: manifest.readyForEnterprise },
          ].map((item) => (
            <article key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="text-sm font-semibold text-zinc-400">{item.label}</h2>
              <p className={readyLabel(item.ready)}>{item.ready ? "Ready" : "Pending"}</p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-lime-900/30 bg-lime-950/10 p-5">
          <h2 className="mb-2 text-lg font-semibold">Launch Freeze Summary</h2>
          <p className="text-2xl font-bold text-lime-300">{freeze.confidenceScore}%</p>
          <p className="mt-1 font-mono text-xs text-zinc-500">{freeze.summary}</p>
          <p className="mt-2 font-mono text-xs text-zinc-600">{manifest.summary}</p>
        </section>

        <section className="space-y-4">
          {checklist.checklistGroups.map((group) => {
            const items = checklist.checklistItems.filter((i) => group.itemIds.includes(i.id));
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
                        <span className="ml-2 text-xs text-zinc-600">{item.category}</span>
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

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Approval Checks</h2>
            <ul className="space-y-1 font-mono text-xs text-zinc-600">
              {checklist.approvalChecks.map((c) => (
                <li key={c.id}>
                  [{c.status}] {c.label}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Rollback Checks</h2>
            <ul className="space-y-1 font-mono text-xs text-zinc-600">
              {checklist.rollbackChecks.map((c) => (
                <li key={c.id}>
                  [{c.status}] {c.label}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-xl border border-lime-900/40 bg-lime-950/20 p-5">
          <Link href="/api/commercialization/go-live" className="text-sm text-lime-300 underline">
            Open go-live API (JSON)
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{goLive.foundationSummary}</p>

        <div className="flex gap-4 text-sm">
          <Link href="/dashboard/rollout" className="text-zinc-400 underline hover:text-zinc-200">
            ← Launch Checklist
          </Link>
          <Link href="/dashboard/rollout-readiness" className="text-zinc-400 underline hover:text-zinc-200">
            Rollout Readiness
          </Link>
          <Link href="/dashboard" className="text-zinc-400 underline hover:text-zinc-200">
            控制台
          </Link>
        </div>
      </div>
    </main>
  );
}
