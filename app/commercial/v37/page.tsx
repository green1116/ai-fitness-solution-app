import Link from "next/link";
import { runCommercialProductFoundation } from "@/lib/commercialization/product";
import { runCommercialClosureFoundation } from "@/lib/commercialization/closure";

export const dynamic = "force-dynamic";

export default function CommercialV37Page() {
  const closure = runCommercialClosureFoundation({
    deploymentId: "v37-hub",
  });
  const product = runCommercialProductFoundation({
    deploymentId: "v37-hub",
    closure,
    tier: "enterprise",
  });

  return (
    <main className="mx-auto max-w-4xl px-6 py-10">
      <header className="mb-8 space-y-2">
        <p className="text-sm text-amber-400/90">V3.7 · Commercial Productization</p>
        <h1 className="text-3xl font-bold">Product Surface</h1>
        <p className="text-sm text-zinc-400">
          Selectable catalog, tier matrix, workspace entitlements — description only.
          V3.6 public surface remains sealed ({product.v36Sealed ? "yes" : "no"}).
          Portal, billing, and invoices are description-only — no payment, IdP, or billing engine.
        </p>
      </header>

      <section className="mb-6 rounded-xl border border-violet-800/60 bg-violet-950/30 p-4">
        <p className="mb-2 text-xs text-violet-300/90">Canonical readonly entry (stable)</p>
        <Link
          href="/commercial/v37/hub"
          className="inline-block rounded-lg border border-violet-600 bg-violet-900/50 px-5 py-2.5 text-sm font-bold text-violet-100 hover:bg-violet-800/50"
        >
          Open canonical commercial surface
        </Link>
        <p className="mt-2 text-xs text-zinc-500">
          <Link href="/commercial/v37/stabilization" className="text-emerald-500/80 underline">
            Final stabilization
          </Link>
          {" · "}
          Lifecycle map:{" "}
          <Link href="/commercial/v37/atlas" className="text-cyan-500/80 underline">
            atlas (compatibility)
          </Link>
        </p>
      </section>

      <section className="mb-8 flex flex-wrap gap-3">
        <Link
          href="/commercial/v37/products"
          className="rounded-lg border border-amber-800 bg-amber-950/40 px-4 py-2 text-sm text-amber-200 hover:bg-amber-900/40"
        >
          Product catalog
        </Link>
        <Link
          href="/commercial/v37/workspace"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
        >
          Workspaces
        </Link>
        <Link
          href="/commercial/v37/pricing"
          className="rounded-lg border border-amber-800 bg-amber-950/40 px-4 py-2 text-sm text-amber-200 hover:bg-amber-900/40"
        >
          Pricing
        </Link>
        <Link
          href="/commercial/v37/quote"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
        >
          Quote
        </Link>
        <Link
          href="/commercial/v37/terms"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:bg-zinc-800"
        >
          Terms
        </Link>
        <Link
          href="/commercial/v37/orders"
          className="rounded-lg border border-violet-800 bg-violet-950/40 px-4 py-2 text-sm text-violet-200 hover:bg-violet-900/40"
        >
          Orders
        </Link>
        <Link
          href="/commercial/v37/subscription"
          className="rounded-lg border border-violet-800 bg-violet-950/40 px-4 py-2 text-sm text-violet-200 hover:bg-violet-900/40"
        >
          Subscription
        </Link>
        <Link
          href="/commercial/v37/onboarding"
          className="rounded-lg border border-violet-800 bg-violet-950/40 px-4 py-2 text-sm text-violet-200 hover:bg-violet-900/40"
        >
          Onboarding
        </Link>
        <Link
          href="/commercial/v37/portal"
          className="rounded-lg border border-sky-800 bg-sky-950/40 px-4 py-2 text-sm text-sky-200 hover:bg-sky-900/40"
        >
          Customer portal
        </Link>
        <Link
          href="/commercial/v37/account"
          className="rounded-lg border border-sky-800 bg-sky-950/40 px-4 py-2 text-sm text-sky-200 hover:bg-sky-900/40"
        >
          Account
        </Link>
        <Link
          href="/commercial/v37/billing"
          className="rounded-lg border border-sky-800 bg-sky-950/40 px-4 py-2 text-sm text-sky-200 hover:bg-sky-900/40"
        >
          Billing
        </Link>
        <Link
          href="/commercial/v37/invoices"
          className="rounded-lg border border-sky-800 bg-sky-950/40 px-4 py-2 text-sm text-sky-200 hover:bg-sky-900/40"
        >
          Invoices
        </Link>
        <Link
          href="/commercial/v37/closure"
          className="rounded-lg border border-emerald-800 px-4 py-2 text-sm text-emerald-200 hover:bg-emerald-950/40"
        >
          V3.7 closure
        </Link>
        <Link
          href="/commercial/v37/support"
          className="rounded-lg border border-orange-800 bg-orange-950/40 px-4 py-2 text-sm text-orange-200 hover:bg-orange-900/40"
        >
          Support
        </Link>
        <Link
          href="/commercial/v37/success"
          className="rounded-lg border border-orange-800 bg-orange-950/40 px-4 py-2 text-sm text-orange-200 hover:bg-orange-900/40"
        >
          Success
        </Link>
        <Link
          href="/commercial/v37/governance"
          className="rounded-lg border border-orange-800 bg-orange-950/40 px-4 py-2 text-sm text-orange-200 hover:bg-orange-900/40"
        >
          Governance
        </Link>
        <Link
          href="/commercial/v37/final"
          className="rounded-lg border border-emerald-700 bg-emerald-950/50 px-4 py-2 text-sm font-medium text-emerald-200 hover:bg-emerald-900/50"
        >
          Final closure
        </Link>
        <Link
          href="/commercial/v37/phase-closure"
          className="rounded-lg border border-emerald-600 bg-emerald-950/60 px-4 py-2 text-sm font-bold text-emerald-100 hover:bg-emerald-900/60"
        >
          Phase locked
        </Link>
        <Link
          href="/commercial/v37/launch"
          className="rounded-lg border border-sky-700 bg-sky-950/50 px-4 py-2 text-sm font-medium text-sky-200 hover:bg-sky-900/50"
        >
          Launch candidate
        </Link>
        <Link
          href="/commercial/v37/operations"
          className="rounded-lg border border-violet-700 bg-violet-950/50 px-4 py-2 text-sm font-medium text-violet-200 hover:bg-violet-900/50"
        >
          Post-launch ops
        </Link>
        <Link
          href="/commercial/v37/sunset"
          className="rounded-lg border border-rose-800 bg-rose-950/50 px-4 py-2 text-sm font-medium text-rose-200 hover:bg-rose-900/50"
        >
          Sunset / exit
        </Link>
        <Link
          href="/commercial/v37/archive"
          className="rounded-lg border border-zinc-600 bg-zinc-900/60 px-4 py-2 text-sm font-medium text-zinc-300 hover:bg-zinc-800/60"
        >
          Historical archive
        </Link>
        <Link
          href="/commercial/v37/legacy"
          className="rounded-lg border border-amber-800/80 bg-amber-950/40 px-4 py-2 text-sm font-medium text-amber-200/90 hover:bg-amber-900/40"
        >
          Legacy / EOL
        </Link>
        <Link
          href="/commercial/v37/atlas"
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm text-zinc-400 hover:bg-zinc-800"
        >
          Lifecycle map (compat)
        </Link>
        <Link
          href="/commercial/v36/closure"
          className="rounded-lg border border-emerald-800/60 px-4 py-2 text-sm text-emerald-200/80 hover:bg-emerald-950/40"
        >
          V3.6 closure
        </Link>
      </section>

      <section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-900/50 p-5">
        <h2 className="mb-3 text-lg font-semibold">Status</h2>
        <ul className="space-y-1 text-sm text-zinc-300">
          <li>SKUs: {product.catalog.entries.length}</li>
          <li>Tiers: {product.tierMatrix.rows.length}</li>
          <li>Sample tier: {product.tier}</li>
          <li>Entitlement grants: {product.entitlements.sample.grants.length}</li>
          <li>Workspaces: {product.workspace.workspaces.length}</li>
          <li>Productized: {product.productized ? "yes" : "no"}</li>
        </ul>
      </section>

      <p className="font-mono text-xs text-zinc-600">{product.summary}</p>
    </main>
  );
}
