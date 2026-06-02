import Link from "next/link";
import { buildReleaseLedger } from "@/lib/commercialization/release-ledger";

export const dynamic = "force-dynamic";

export default function ReleaseLedgerPage() {
  const ledger = buildReleaseLedger({ deploymentId: "release-ledger-page" });
  const { dto, releaseTrace, readiness, confidence, incident } = ledger;

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-violet-400/90">V3.7-H7 · Release Ledger</p>
          <h1 className="text-3xl font-bold">Release Ledger Review</h1>
          <p className="text-sm text-zinc-400">
            只读发布台账摘要 — 供 SaaS 部署、企业运维与 release governance 使用。
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Release Gate</h2>
            <ul className="space-y-1 text-sm text-zinc-300">
              <li>
                Release ready:{" "}
                <span className={dto.releaseReady ? "text-emerald-400" : "text-amber-400"}>
                  {dto.releaseReady ? "yes" : "no"}
                </span>
              </li>
              <li>
                Releasable:{" "}
                <span className={dto.releasable ? "text-emerald-400" : "text-amber-400"}>
                  {dto.releasable ? "yes" : "no"}
                </span>
              </li>
              <li>Confidence: {dto.confidenceScore}%</li>
              <li>Incident level: {dto.incidentLevel}</li>
              <li>Risk level: {confidence.riskLevel}</li>
            </ul>
            <p className="mt-3 text-xs text-zinc-500">{dto.gateReason}</p>
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
            <p className="mt-3 font-mono text-xs text-zinc-600">{releaseTrace.manifestId}</p>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Status Matrix</h2>
            <ul className="space-y-1 text-sm text-zinc-300">
              <li>Build: {dto.buildStatus}</li>
              <li>TSC: {dto.tscStatus}</li>
              <li>Verification: {dto.verificationStatus}</li>
              <li>Hardening: {dto.hardeningStatus}</li>
              <li>Observability: {dto.observabilityStatus}</li>
              <li>Dashboard: {dto.dashboardStatus}</li>
              <li>Audit: {dto.auditStatus}</li>
            </ul>
          </article>

          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
            <h2 className="mb-3 text-lg font-semibold">Readiness & Incident</h2>
            <ul className="space-y-1 text-sm text-zinc-300">
              <li>Hardening: {readiness.hardeningReady ? "ready" : "pending"}</li>
              <li>Observability: {readiness.observabilityReady ? "ready" : "pending"}</li>
              <li>Dashboard: {readiness.dashboardReady ? "ready" : "pending"}</li>
              <li>Blocked: {readiness.blocked ? "yes" : "no"}</li>
              <li>Incident: {incident.incidentId}</li>
              <li>State: {incident.resolutionState}</li>
            </ul>
          </article>
        </section>

        <section className="rounded-xl border border-violet-900/40 bg-violet-950/20 p-5">
          <h2 className="mb-2 text-lg font-semibold">API Access</h2>
          <Link
            href="/api/commercialization/release-ledger"
            className="text-sm text-sky-300 underline"
          >
            Open readonly release ledger API (JSON)
          </Link>
          <span className="mx-2 text-zinc-600">·</span>
          <Link
            href="/dashboard/evidence-export"
            className="text-sm text-sky-300 underline"
          >
            Evidence export review
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{ledger.ledgerSummary}</p>

        <Link href="/dashboard" className="text-sm text-zinc-400 underline hover:text-zinc-200">
          ← 返回控制台
        </Link>
      </div>
    </main>
  );
}
