import Link from "next/link";
import { buildProductionReleaseLedgerFoundation } from "@/lib/commercialization/release-ledger";

export const dynamic = "force-dynamic";

export default function EvidenceExportPage() {
  const foundation = buildProductionReleaseLedgerFoundation({
    deploymentId: "evidence-export-page",
  });
  const { evidenceExport: exp, ledger } = foundation;
  const lineage = ledger.verificationLineage;

  const evidenceChain = [
    { label: "Build", value: exp.buildEvidence },
    { label: "TSC", value: lineage.tscEvidence },
    { label: "Verification", value: exp.verificationEvidence },
    { label: "Hardening", value: exp.hardeningEvidence },
    { label: "Observability", value: exp.observabilityEvidence },
    { label: "Dashboard", value: exp.dashboardEvidence },
    { label: "Audit", value: exp.auditEvidence },
    { label: "Release Ledger", value: ledger.ledgerSummary },
  ];

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-cyan-400/90">V3.7-H7 · Evidence Export</p>
          <h1 className="text-3xl font-bold">Evidence Export Review</h1>
          <p className="text-sm text-zinc-400">
            只读证据链摘要 — 供 audit replay、ops review 与 release governance 使用。无下载、无 IO。
          </p>
        </header>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-3 text-lg font-semibold">Export Identity</h2>
          <ul className="space-y-1 text-sm text-zinc-300">
            <li>Export ID: {exp.exportId}</li>
            <li>Release ID: {ledger.dto.releaseId}</li>
            <li>Bundle: {lineage.bundleId}</li>
            <li>Release ready: {ledger.dto.releaseReady ? "yes" : "no"}</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Evidence Chain</h2>
          {evidenceChain.map((item) => (
            <article
              key={item.label}
              className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4"
            >
              <h3 className="mb-2 text-sm font-semibold text-zinc-200">{item.label}</h3>
              <p className="font-mono text-xs leading-relaxed text-zinc-500">{item.value}</p>
            </article>
          ))}
        </section>

        <section className="rounded-xl border border-cyan-900/40 bg-cyan-950/20 p-5">
          <h2 className="mb-2 text-lg font-semibold">API Access</h2>
          <Link
            href="/api/commercialization/evidence-export"
            className="text-sm text-sky-300 underline"
          >
            Open readonly evidence export API (JSON)
          </Link>
          <span className="mx-2 text-zinc-600">·</span>
          <Link
            href="/dashboard/release-ledger"
            className="text-sm text-sky-300 underline"
          >
            Release ledger review
          </Link>
        </section>

        <p className="font-mono text-xs text-zinc-600">{exp.summary}</p>

        <Link href="/dashboard" className="text-sm text-zinc-400 underline hover:text-zinc-200">
          ← 返回控制台
        </Link>
      </div>
    </main>
  );
}
