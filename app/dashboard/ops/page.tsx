import Link from "next/link";
import { buildEnterpriseOpsOverview } from "@/lib/commercialization/portal/index";

export const dynamic = "force-dynamic";

export default function EnterpriseOpsPage() {
  const overview = buildEnterpriseOpsOverview({ deploymentId: "ops-page" });
  const { navigation, manifest, landing } = overview;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-sky-400/90">V3.7-H13 · Enterprise Ops Portal</p>
          <h1 className="text-3xl font-bold">Unified Ops Portal</h1>
          <p className="text-sm text-zinc-400">
            统一企业运维入口 — release / governance / audit / ledger / evidence 只读导航。
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-2 text-lg font-semibold">Ops</h2>
            <p className={manifest.readyForOps ? "text-emerald-400" : "text-amber-400"}>
              {manifest.readyForOps ? "Ready" : "Pending"}
            </p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-2 text-lg font-semibold">Governance</h2>
            <p className={manifest.readyForGovernance ? "text-emerald-400" : "text-amber-400"}>
              {manifest.readyForGovernance ? "Ready" : "Pending"}
            </p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-2 text-lg font-semibold">Release</h2>
            <p className={manifest.readyForRelease ? "text-emerald-400" : "text-amber-400"}>
              {manifest.readyForRelease ? "Ready" : "Pending"}
            </p>
          </article>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-3 text-lg font-semibold">Quick Links</h2>
          <div className="flex flex-wrap gap-2">
            {landing.quickLinks.map((link) => (
              <Link
                key={link.id}
                href={link.href}
                className="rounded-lg border border-zinc-700 px-3 py-2 text-sm text-zinc-200 hover:bg-zinc-800"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </section>

        <section className="grid gap-4 sm:grid-cols-2">
          {landing.landingSections.map((section) => (
            <article key={section.id} className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
              <h2 className="mb-3 text-lg font-semibold">{section.label}</h2>
              <ul className="space-y-2 text-sm">
                {section.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      className={link.accessible ? "text-sky-300 underline" : "text-zinc-500"}
                    >
                      {link.label}
                    </Link>
                    <p className="text-xs text-zinc-600">{link.summary}</p>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-sky-900/40 bg-sky-950/20 p-5 font-mono text-xs text-zinc-500">
          <p>entries={navigation.entries.length}</p>
          <p>governance={navigation.governanceEntries.length}</p>
          <p>audit={navigation.auditEntries.length}</p>
          <p>release={navigation.releaseEntries.length}</p>
          <Link href="/api/commercialization/ops-overview" className="mt-3 inline-block text-sky-300 underline">
            Open ops overview API (JSON)
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
