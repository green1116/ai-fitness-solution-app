import Link from "next/link";
import { buildProductionGovernanceFoundation } from "@/lib/commercialization/governance/index";

export const dynamic = "force-dynamic";

export default function GovernanceReviewPage() {
  const foundation = buildProductionGovernanceFoundation({ deploymentId: "governance-review-page" });
  const { governance, manifest, roleCatalog } = foundation;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-emerald-400/90">V3.7-H12 · Enterprise Governance</p>
          <h1 className="text-3xl font-bold">Governance Review</h1>
          <p className="text-sm text-zinc-400">
            只读企业治理摘要 — 供 governance review、权限复核与发布治理使用。
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Governance Readiness</h2>
            <ul className="space-y-1 text-sm text-zinc-300">
              <li>
                Ready for governance:{" "}
                <span className={manifest.readyForGovernance ? "text-emerald-400" : "text-amber-400"}>
                  {manifest.readyForGovernance ? "yes" : "no"}
                </span>
              </li>
              <li>
                Ready for ops:{" "}
                <span className={manifest.readyForOps ? "text-emerald-400" : "text-amber-400"}>
                  {manifest.readyForOps ? "yes" : "no"}
                </span>
              </li>
              <li>
                Ready for review:{" "}
                <span className={manifest.readyForReview ? "text-emerald-400" : "text-amber-400"}>
                  {manifest.readyForReview ? "yes" : "no"}
                </span>
              </li>
              <li>Roles in catalog: {roleCatalog.entries.length}</li>
            </ul>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Coverage</h2>
            <ul className="space-y-1 text-sm text-zinc-300">
              <li>
                Role coverage: {governance.roleCoverage.covered}/{governance.roleCoverage.total} (
                {governance.roleCoverage.ratio}%)
              </li>
              <li>
                Resource coverage: {governance.resourceCoverage.covered}/
                {governance.resourceCoverage.total} ({governance.resourceCoverage.ratio}%)
              </li>
              <li>
                Permission coverage: {governance.permissionCoverage.covered}/
                {governance.permissionCoverage.total} ({governance.permissionCoverage.ratio}%)
              </li>
              <li>
                Readonly coverage: {governance.readonlyAccessCoverage.ratio}%
              </li>
            </ul>
          </article>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Effective Governance</h2>
          {governance.effectiveGovernance.map((entry) => (
            <article
              key={`${entry.roleId}-${entry.resourceId}`}
              className="rounded-xl border border-emerald-900/30 bg-emerald-950/10 p-4"
            >
              <p className="text-sm text-zinc-200">
                <span className="font-mono text-emerald-400/90">{entry.roleId}</span>
                {" → "}
                <span className="font-mono text-emerald-400/90">{entry.resourceId}</span>
                <span className="ml-2 text-xs text-zinc-500">({entry.scope})</span>
              </p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5">
          <h2 className="mb-2 text-lg font-semibold">API Access</h2>
          <Link
            href="/api/commercialization/governance"
            className="text-sm text-sky-300 underline"
          >
            Open readonly governance API (JSON)
          </Link>
          <span className="mx-2 text-zinc-600">·</span>
          <Link href="/dashboard/permission-lineage" className="text-sm text-sky-300 underline">
            Permission lineage
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{foundation.summary}</p>

        <Link href="/dashboard" className="text-sm text-zinc-400 underline hover:text-zinc-200">
          ← 返回控制台
        </Link>
      </div>
    </main>
  );
}
