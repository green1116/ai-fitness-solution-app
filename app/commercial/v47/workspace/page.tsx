import Link from "next/link";
import { runWorkspaceRuntime } from "@/lib/commercial-products/workspace/workspace-runtime";
import { syncWorkspaceFromQuote } from "@/lib/commercial-products/workspace/workspace-service";
import { createQuote } from "@/lib/commercial-products/access-layer/quote/quote-service";
import { registerQuoteSnapshot } from "@/lib/commercial-products/access-layer/pdf/quote-snapshot-registry";
import {
  CP_WORKSPACE_API_PATH,
  CP_WORKSPACE_BASE_PATH,
} from "@/lib/commercial-products/workspace/workspace-types";

export const dynamic = "force-dynamic";

const CUSTOMER_ID = "default-customer";

function formatCny(value: number) {
  return `¥${value.toLocaleString("zh-CN")}`;
}

export default function CommercialV47WorkspacePage() {
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
    customerId: CUSTOMER_ID,
    customerName: "Demo Customer",
    quoteId: quote.snapshot.quoteId,
    projectName: quote.snapshot.inputs.projectName,
    sku: quote.snapshot.sku,
    suggestedPriceCny: quote.snapshot.price,
    sla: quote.snapshot.sla,
  });

  const { workspace } = runWorkspaceRuntime({
    customerId: CUSTOMER_ID,
    customerName: "Demo Customer",
  });

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-amber-400/90">V47 · Customer Workspace</p>
          <h1 className="text-3xl font-bold">Customer Workspace</h1>
          <p className="text-sm text-zinc-400">
            客户 · 项目 · 报价 · 交付包 · 历史记录 · 下载中心
          </p>
        </header>

        <section className="grid gap-4 sm:grid-cols-3">
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-sm text-zinc-500">Customer</h2>
            <p className="text-lg font-semibold">{workspace.customerName}</p>
            <p className="text-xs text-zinc-600">{workspace.customerId}</p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-sm text-zinc-500">Projects</h2>
            <p className="text-lg font-semibold">{workspace.projects.length}</p>
          </article>
          <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-4">
            <h2 className="text-sm text-zinc-500">History</h2>
            <p className="text-lg font-semibold">{workspace.history.length}</p>
          </article>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-4 text-lg font-semibold">Projects</h2>
          <div className="space-y-4">
            {workspace.projects.map((project) => (
              <article key={project.projectId} className="rounded-lg border border-zinc-800 p-4">
                <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-semibold">{project.projectName}</p>
                    <p className="text-xs text-zinc-500">{project.sku} · {project.quoteId}</p>
                  </div>
                  <span className="rounded-full border border-emerald-900/60 px-3 py-1 text-xs text-emerald-400">
                    {project.status}
                  </span>
                </div>
                <p className="text-sm text-zinc-400">
                  {formatCny(project.suggestedPriceCny)} · SLA {project.sla}
                </p>
              </article>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-4 text-lg font-semibold">Download Center</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {workspace.projects[0]?.downloadLinks.map((link) => (
              <a
                key={link.apiPath}
                href={link.apiPath}
                className="rounded-lg border border-amber-900/50 bg-amber-950/20 px-4 py-3 text-sm text-amber-200 hover:bg-amber-900/20"
              >
                {link.label}
              </a>
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
          <h2 className="mb-4 text-lg font-semibold">History</h2>
          <ul className="space-y-2 text-sm">
            {workspace.history.map((item) => (
              <li key={item.historyId} className="rounded-lg border border-zinc-800 px-4 py-3">
                <p className="font-medium">{item.action}</p>
                <p className="text-xs text-zinc-500">{item.projectName} · {item.quoteId}</p>
                <p className="text-xs text-zinc-600">{item.summary}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-xs text-zinc-500">
          <p>Workspace API: {CP_WORKSPACE_API_PATH}</p>
          <p>Workspace ID: {workspace.workspaceId}</p>
          <p>Path: {CP_WORKSPACE_BASE_PATH}</p>
        </section>

        <Link href="/commercial/v47" className="text-sm text-sky-300 underline">
          ← 返回 Sales Portal
        </Link>
      </div>
    </main>
  );
}
