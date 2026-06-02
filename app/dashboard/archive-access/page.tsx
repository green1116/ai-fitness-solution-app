import Link from "next/link";
import { buildEnterpriseRetentionFoundation } from "@/lib/commercialization/retention/index";

export const dynamic = "force-dynamic";

function readyLabel(ready: boolean) {
  return ready ? "text-emerald-400" : "text-amber-400";
}

export default function ArchiveAccessPage() {
  const retention = buildEnterpriseRetentionFoundation({ deploymentId: "archive-access-page" });
  const { policies, access, manifest } = retention;

  const policySections = [
    { title: "Retention Policies", items: policies.retentionPolicies },
    { title: "Lifecycle Policies", items: policies.lifecyclePolicies },
    { title: "Governance Policies", items: policies.governancePolicies },
    { title: "Review Policies", items: policies.reviewPolicies },
    { title: "Readonly Policies", items: policies.readonlyPolicies },
  ];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-cyan-400/90">V3.7-H23 · Archive Access & Retention</p>
          <h1 className="text-3xl font-bold">Archive Access & Retention Review</h1>
          <p className="text-sm text-zinc-400">
            Archive access · retention lifecycle · governance / audit preservation review
          </p>
        </header>

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: "Accessible", ready: access.archiveAccessible },
            { label: "Retention", ready: access.retentionReady },
            { label: "Governance", ready: access.governanceRetentionReady },
            { label: "Audit", ready: access.auditRetentionReady },
            { label: "Preservation", ready: access.preservationReady },
            { label: "Lifecycle", ready: access.lifecycleReady },
            { label: "Enterprise", ready: manifest.readyForEnterprise },
            { label: "Confidence", ready: access.confidenceScore >= 80 },
          ].map((item) => (
            <article key={item.label} className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
              <h2 className="text-sm font-semibold text-zinc-400">{item.label}</h2>
              <p className={readyLabel(item.ready)}>
                {item.label === "Confidence" ? `${access.confidenceScore}%` : item.ready ? "Ready" : "Pending"}
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-cyan-900/30 bg-cyan-950/10 p-5">
          <h2 className="mb-2 text-lg font-semibold">Archive Access Summary</h2>
          <p className="font-mono text-xs text-zinc-500">{access.summary}</p>
          <p className="mt-2 font-mono text-xs text-zinc-600">{manifest.summary}</p>
        </section>

        <section className="space-y-4">
          {policySections.map((section) => (
            <article key={section.title} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="mb-3 text-lg font-semibold">{section.title}</h2>
              <ul className="space-y-2 text-sm">
                {section.items.map((item) => (
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
                        {item.category}
                        {item.readonly ? " · readonly" : ""}
                        {item.reviewRequired ? " · review" : ""}
                      </span>
                      <p className="text-xs text-zinc-600">{item.description}</p>
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-3 text-lg font-semibold">Archival Policies</h2>
          <p className="mb-2 text-sm text-zinc-400">{policies.archivalPolicies.length} items from archival checklist</p>
          <ul className="space-y-1 font-mono text-xs text-zinc-600">
            {policies.archivalPolicies.slice(0, 8).map((item) => (
              <li key={item.id}>
                {item.id} — {item.label}
              </li>
            ))}
            {policies.archivalPolicies.length > 8 && (
              <li>… +{policies.archivalPolicies.length - 8} more</li>
            )}
          </ul>
        </section>

        <section className="rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-5">
          <Link href="/api/commercialization/archive-access" className="text-sm text-cyan-300 underline">
            Open archive access API (JSON)
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{retention.foundationSummary}</p>

        <div className="flex gap-4 text-sm">
          <Link href="/dashboard/archival" className="text-zinc-400 underline hover:text-zinc-200">
            ← Enterprise Archival
          </Link>
          <Link href="/dashboard/launch-closure" className="text-zinc-400 underline hover:text-zinc-200">
            Launch Closure
          </Link>
          <Link href="/dashboard" className="text-zinc-400 underline hover:text-zinc-200">
            控制台
          </Link>
        </div>
      </div>
    </main>
  );
}
