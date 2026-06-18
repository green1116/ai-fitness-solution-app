import Link from "next/link";
import { buildSalesPortalView } from "@/lib/commercial-products/access-layer";
import { ProductCard } from "./components/ProductCard";

export const dynamic = "force-dynamic";

export default function CommercialV47Page() {
  const portal = buildSalesPortalView();

  return (
    <main className="min-h-screen bg-black px-6 py-10 text-white">
      <div className="mx-auto max-w-5xl space-y-8">
        <header className="space-y-2">
          <p className="text-sm text-amber-400/90">V47 · Commercial Products · Sales Portal</p>
          <h1 className="text-3xl font-bold">Sales Portal</h1>
          <p className="text-sm text-zinc-400">
            产品目录 → 报价表单 → Quote API → 报价结果 → 交付下载（占位）
          </p>
        </header>

        <section className="flex flex-wrap gap-3">
          <Link
            href="/commercial/v47/quote"
            className="rounded-lg border border-amber-800 bg-amber-950/40 px-4 py-2 text-sm text-amber-200 hover:bg-amber-900/40"
          >
            打开报价表单
          </Link>
          <span className="rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-500">
            下载入口：{portal.downloadApiPath}（占位）
          </span>
        </section>

        <section className="grid gap-4 md:grid-cols-3">
          {portal.products.map((product) => (
            <ProductCard key={product.sku} product={product} />
          ))}
        </section>

        <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5 text-xs text-zinc-500">
          <p>Quote API: {portal.quoteApiPath}</p>
          <p>Portal ID: {portal.portalId}</p>
        </section>
      </div>
    </main>
  );
}
