import Link from "next/link";
import { buildProductionRolloutFoundation } from "@/lib/commercialization/rollout/index";

export const dynamic = "force-dynamic";

function statusLabel(status: string) {
  if (status === "complete") return "text-emerald-400";
  if (status === "optional") return "text-zinc-500";
  return "text-amber-400";
}

function readyLabel(ready: boolean) {
  return ready ? "text-emerald-400" : "text-amber-400";
}

export default function RolloutLaunchPage() {
  const rollout = buildProductionRolloutFoundation({ deploymentId: "rollout-launch-page" });
  const { checklist, launch, handoff } = rollout;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-rose-400/90">V3.7-H19 · Production Rollout</p>
          <h1 className="text-3xl font-bold">Launch Checklist & Handoff</h1>
          <p className="text-sm text-zinc-400">
            Rollout documentation · launch summary · deployment guide · operational handoff · governance approval
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Launch", ready: handoff.readyForLaunch },
            { label: "Handoff", ready: handoff.readyForHandoff },
            { label: "Enterprise", ready: handoff.readyForEnterprise },
            { label: "Deployment", ready: launch.deploymentReady },
            { label: "Rollout", ready: launch.rolloutReady },
            { label: "Governance", ready: launch.governanceReady },
            { label: "Ops", ready: launch.opsReady },
            { label: "Release", ready: launch.releaseReady },
          ].map((item) => (
            <article key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="text-sm font-semibold text-zinc-400">{item.label}</h2>
              <p className={readyLabel(item.ready)}>{item.ready ? "Ready" : "Pending"}</p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-rose-900/30 bg-rose-950/10 p-5">
          <h2 className="mb-2 text-lg font-semibold">Launch Summary</h2>
          <p className="text-2xl font-bold text-rose-300">{launch.confidenceScore}%</p>
          <p className="mt-1 font-mono text-xs text-zinc-500">{launch.summary}</p>
          <p className="mt-2 font-mono text-xs text-zinc-600">{handoff.summary}</p>
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
                        <span className="ml-2 text-xs text-zinc-600">
                          {item.owner}
                          {item.required ? " · required" : " · optional"}
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

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-3 text-lg font-semibold">Required Checks</h2>
          <p className="mb-2 text-sm text-zinc-400">
            {checklist.requiredChecks.filter((c) => c.status === "complete").length} /{" "}
            {checklist.requiredChecks.length} complete
          </p>
          <ul className="space-y-1 font-mono text-xs text-zinc-600">
            {checklist.requiredChecks.map((c) => (
              <li key={c.id}>
                [{c.status}] {c.id} — {c.label}
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-rose-900/40 bg-rose-950/20 p-5">
          <Link href="/api/commercialization/rollout" className="text-sm text-rose-300 underline">
            Open production rollout API (JSON)
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{rollout.foundationSummary}</p>

        <div className="flex gap-4 text-sm">
          <Link href="/dashboard/rollout-readiness" className="text-zinc-400 underline hover:text-zinc-200">
            ← Rollout Readiness
          </Link>
          <Link href="/dashboard/enterprise-landing" className="text-zinc-400 underline hover:text-zinc-200">
            Enterprise Landing
          </Link>
          <Link href="/dashboard" className="text-zinc-400 underline hover:text-zinc-200">
            控制台
          </Link>
        </div>
      </div>
    </main>
  );
}
