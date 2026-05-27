import Link from "next/link";
import { buildAuditReviewSurface } from "@/lib/commercialization/audit/audit-review-surface";

export const dynamic = "force-dynamic";

export default function AuditReviewPage() {
  const review = buildAuditReviewSurface({ deploymentId: "audit-review-page" });
  const { releaseTrace, incidentTrace, readinessSummary, confidenceSummary } = review;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-emerald-400/90">V3.7-H5 · Production Audit Review</p>
          <h1 className="text-3xl font-bold">Release Review Surface</h1>
          <p className="text-sm text-zinc-400">
            只读静态审计摘要 — 供发布复盘、运维审查与 trace lookup 使用。
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Release Gate</h2>
            <ul className="space-y-1 text-sm text-zinc-300">
              <li>
                Release ready:{" "}
                <span className={readinessSummary.releaseReady ? "text-emerald-400" : "text-amber-400"}>
                  {readinessSummary.releaseReady ? "yes" : "no"}
                </span>
              </li>
              <li>
                Releasable:{" "}
                <span className={readinessSummary.releasable ? "text-emerald-400" : "text-amber-400"}>
                  {readinessSummary.releasable ? "yes" : "no"}
                </span>
              </li>
              <li>Confidence: {confidenceSummary.releaseConfidence}%</li>
              <li>Incident level: {confidenceSummary.incidentLevel}</li>
              <li>Risk level: {confidenceSummary.riskLevel}</li>
            </ul>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Trace Versions</h2>
            <ul className="space-y-1 font-mono text-xs text-zinc-400">
              <li>freeze: {releaseTrace.BUILD_FREEZE_VERSION}</li>
              <li>hardening: {releaseTrace.HARDENING_VERSION}</li>
              <li>observability: {releaseTrace.OBSERVABILITY_VERSION}</li>
              <li>dashboard: {releaseTrace.DASHBOARD_VERSION}</li>
              <li>audit: {releaseTrace.AUDIT_VERSION}</li>
            </ul>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Readiness</h2>
            <ul className="space-y-1 text-sm text-zinc-300">
              <li>Hardening: {readinessSummary.hardeningReady ? "ready" : "pending"}</li>
              <li>Observability: {readinessSummary.observabilityReady ? "ready" : "pending"}</li>
              <li>Dashboard: {readinessSummary.dashboardReady ? "ready" : "pending"}</li>
              <li>Freeze intact: {readinessSummary.freezeIntact ? "yes" : "no"}</li>
              <li>Blocked: {readinessSummary.blocked ? "yes" : "no"}</li>
            </ul>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Incident Trace</h2>
            <ul className="space-y-1 text-sm text-zinc-300">
              <li>ID: {incidentTrace.incidentId}</li>
              <li>Level: {incidentTrace.incidentLevel}</li>
              <li>State: {incidentTrace.resolutionState}</li>
              <li>Signals: {incidentTrace.signalCount}</li>
            </ul>
            <p className="mt-2 text-xs text-zinc-500">{incidentTrace.incidentReason}</p>
          </article>
        </section>

        <section className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5">
          <h2 className="mb-2 text-lg font-semibold">Verification Lineage</h2>
          <p className="font-mono text-xs text-zinc-500">{review.verificationLineage.bundleId}</p>
          <ul className="mt-3 space-y-1 font-mono text-xs text-zinc-600">
            <li>{review.verificationLineage.buildEvidence.slice(0, 120)}…</li>
            <li>{review.verificationLineage.verifyEvidence.slice(0, 120)}…</li>
          </ul>
          <Link
            href="/api/commercialization/audit"
            className="mt-4 inline-block text-sm text-sky-300 underline"
          >
            Open readonly audit API (JSON)
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{review.auditSummary}</p>

        <Link href="/dashboard" className="text-sm text-zinc-400 underline hover:text-zinc-200">
          ← 返回控制台
        </Link>
      </div>
    </main>
  );
}
