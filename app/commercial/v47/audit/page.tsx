import Link from "next/link";
import { CP_AUDIT_API_PATH, CP_AUDIT_PAGE_PATH } from "@/lib/commercial-products/audit/audit-types";
import { AuditService } from "@/lib/commercial-products/audit/audit-service";
import { createQuote } from "@/lib/commercial-products/access-layer/quote/quote-service";
import { registerQuoteSnapshot } from "@/lib/commercial-products/access-layer/pdf/quote-snapshot-registry";
import { syncWorkspaceFromQuote } from "@/lib/commercial-products/workspace/workspace-service";
import { recordAuditEvent } from "@/lib/commercial-products/audit/audit-runtime";

export const dynamic = "force-dynamic";

const WORKSPACE_ID = "default-customer";

export default function CommercialV47AuditPage() {
  const quote = createQuote({
    sku: "kickstart-package",
    projectName: "School Gym Project",
    areaSqm: 320,
    headcount: 180,
    budgetCny: 650_000,
    complexity: "medium",
    slaTier: "7d",
  });
  registerQuoteSnapshot(quote.snapshot);

  syncWorkspaceFromQuote({
    customerId: WORKSPACE_ID,
    customerName: "Demo Customer",
    quoteId: quote.snapshot.quoteId,
    projectName: quote.snapshot.inputs.projectName,
    sku: quote.snapshot.sku,
    suggestedPriceCny: quote.snapshot.price,
    sla: quote.snapshot.sla,
  });

  recordAuditEvent({
    eventType: "workspace_created",
    workspaceId: WORKSPACE_ID,
    quoteId: quote.snapshot.quoteId,
    actorType: "system",
    title: "Workspace created",
  });
  recordAuditEvent({
    eventType: "quote_created",
    workspaceId: WORKSPACE_ID,
    quoteId: quote.snapshot.quoteId,
    projectId: `ws-project-${quote.snapshot.quoteId}`,
    actorType: "customer",
    actorName: "Demo Customer",
    title: "Quote created",
  });
  recordAuditEvent({
    eventType: "approval_approved",
    workspaceId: WORKSPACE_ID,
    quoteId: quote.snapshot.quoteId,
    approvalId: `ap-${quote.snapshot.quoteId}`,
    actorType: "admin",
    actorName: "Compliance Admin",
    title: "Approval approved",
  });
  recordAuditEvent({
    eventType: "download_completed",
    workspaceId: WORKSPACE_ID,
    quoteId: quote.snapshot.quoteId,
    actorType: "customer",
    title: "Download completed",
  });

  const audit = AuditService.listByQuote(quote.snapshot.quoteId);

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-amber-400/90">V47 · Audit & Compliance</p>
          <h1 className="text-3xl font-bold">Audit Overview</h1>
          <p className="text-sm text-zinc-400">
            谁创建 · 谁审批 · 谁下载 · 谁交付 · 何时发生 · 关联 quote / project / workspace / package / delivery
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-sm text-zinc-500">Events</h2>
            <p className="text-2xl font-semibold">{audit.events.length}</p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-sm text-zinc-500">Compliance</h2>
            <p className="text-2xl font-semibold text-emerald-400">
              {audit.compliance?.status ?? "pass"}
            </p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-sm text-zinc-500">Trace Quote</h2>
            <p className="truncate text-xs text-zinc-400">{quote.snapshot.quoteId}</p>
          </article>
        </section>

        {audit.compliance ? (
          <section className="rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-5">
            <h2 className="mb-3 text-lg font-semibold">Compliance Snapshot</h2>
            <ul className="space-y-2 text-sm">
              {audit.compliance.rules.map((rule) => (
                <li key={rule.ruleId} className="flex justify-between gap-4">
                  <span>{rule.name}</span>
                  <span className={rule.passed ? "text-emerald-400" : "text-rose-400"}>
                    {rule.passed ? "pass" : "fail"}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-4 text-lg font-semibold">Event Timeline</h2>
          <ul className="space-y-3">
            {audit.events.map((event) => (
              <li key={event.auditId} className="rounded-lg border border-zinc-800 px-4 py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">{event.title}</p>
                  <span className="text-xs text-amber-300/80">{event.eventType}</span>
                </div>
                <p className="text-xs text-zinc-500">
                  {event.actorType}
                  {event.actorName ? ` · ${event.actorName}` : ""} ·{" "}
                  {new Date(event.createdAt).toLocaleString("zh-CN")}
                </p>
                <p className="text-xs text-zinc-600">
                  quote={event.quoteId ?? "-"} approval={event.approvalId ?? "-"} delivery=
                  {event.deliveryId ?? "-"}
                </p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-xs text-zinc-500">
          <p>Audit API: {CP_AUDIT_API_PATH}</p>
          <p>Audit Page: {CP_AUDIT_PAGE_PATH}</p>
        </section>

        <div className="flex flex-wrap gap-4">
          <Link href="/commercial/v47/workspace" className="text-sm text-sky-300 underline">
            Workspace
          </Link>
          <Link href="/commercial/v47" className="text-sm text-sky-300 underline">
            ← Sales Portal
          </Link>
        </div>
      </div>
    </main>
  );
}
