import Link from "next/link";
import { buildEnterpriseArchivalFoundation } from "@/lib/commercialization/archival/index";

export const dynamic = "force-dynamic";

function statusLabel(status: string) {
  return status === "archived" ? "text-emerald-400" : "text-amber-400";
}

function readyLabel(ready: boolean) {
  return ready ? "text-emerald-400" : "text-amber-400";
}

export default function ArchivalPage() {
  const archival = buildEnterpriseArchivalFoundation({ deploymentId: "archival-page" });
  const { checklist, preservation, manifest } = archival;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-indigo-400/90">V3.7-H22 · Enterprise Archival</p>
          <h1 className="text-3xl font-bold">Production Archival & Preservation</h1>
          <p className="text-sm text-zinc-400">
            Archival visibility · preservation continuity · governance / release / ops archival
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Archive", ready: preservation.readyForArchive },
            { label: "Preservation", ready: preservation.preservationCompleted },
            { label: "Release", ready: preservation.releaseArchived },
            { label: "Governance", ready: preservation.governanceArchived },
            { label: "Ops", ready: preservation.opsArchived },
            { label: "Audit", ready: preservation.auditArchived },
            { label: "Enterprise", ready: manifest.readyForEnterprise },
            { label: "Confidence", ready: preservation.confidenceScore >= 80 },
          ].map((item) => (
            <article key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="text-sm font-semibold text-zinc-400">{item.label}</h2>
              <p className={readyLabel(item.ready)}>
                {item.label === "Confidence" ? `${preservation.confidenceScore}%` : item.ready ? "Archived" : "Pending"}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-indigo-900/30 bg-indigo-950/10 p-5">
          <h2 className="mb-2 text-lg font-semibold">Preservation Summary</h2>
          <p className="font-mono text-xs text-zinc-500">{preservation.summary}</p>
          <p className="mt-2 font-mono text-xs text-zinc-600">{manifest.summary}</p>
        </section>

        <section className="space-y-4">
          {checklist.preservationGroups.map((group) => {
            const items = checklist.archivalItems.filter((i) => group.itemIds.includes(i.id));
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
            <h2 className="mb-3 text-lg font-semibold">Release Archivals</h2>
            <ul className="space-y-1 font-mono text-xs text-zinc-600">
              {checklist.releaseArchivals.map((c) => (
                <li key={c.id}>
                  [{c.status}] {c.label}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Governance Archivals</h2>
            <ul className="space-y-1 font-mono text-xs text-zinc-600">
              {checklist.governanceArchivals.map((c) => (
                <li key={c.id}>
                  [{c.status}] {c.label}
                </li>
              ))}
            </ul>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Ops Archivals</h2>
            <ul className="space-y-1 font-mono text-xs text-zinc-600">
              {checklist.opsArchivals.map((c) => (
                <li key={c.id}>
                  [{c.status}] {c.label}
                </li>
              ))}
            </ul>
          </article>
        </section>

        <section className="rounded-xl border border-indigo-900/40 bg-indigo-950/20 p-5">
          <Link href="/api/commercialization/archival" className="text-sm text-indigo-300 underline">
            Open archival API (JSON)
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{archival.foundationSummary}</p>

        <div className="flex gap-4 text-sm">
          <Link href="/dashboard/launch-closure" className="text-zinc-400 underline hover:text-zinc-200">
            ← Launch Closure
          </Link>
          <Link href="/dashboard/go-live" className="text-zinc-400 underline hover:text-zinc-200">
            Go-Live Control
          </Link>
          <Link href="/dashboard" className="text-zinc-400 underline hover:text-zinc-200">
            控制台
          </Link>
        </div>
      </div>
    </main>
  );
}
