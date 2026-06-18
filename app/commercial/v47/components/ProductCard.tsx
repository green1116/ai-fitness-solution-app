import Link from "next/link";
import type { SalesPortalProductCard } from "@/lib/commercial-products/access-layer";

function formatCny(value: number) {
  return `¥${value.toLocaleString("zh-CN")}`;
}

export function ProductCard({ product }: { product: SalesPortalProductCard }) {
  return (
    <article className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <p className="mb-1 font-mono text-xs text-amber-400/90">{product.sku}</p>
      <h2 className="mb-2 text-lg font-semibold text-white">{product.name}</h2>
      <p className="mb-4 text-sm text-zinc-400">{product.description}</p>
      <dl className="mb-4 space-y-1 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">价格区间</dt>
          <dd className="text-zinc-200">
            {formatCny(product.priceMinCny)} – {formatCny(product.priceMaxCny)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">默认 SLA</dt>
          <dd className="text-zinc-200">{product.defaultSla}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">交付物</dt>
          <dd className="text-zinc-200">{product.deliverableCount} 项</dd>
        </div>
      </dl>
      <Link
        href={`/commercial/v47/quote?sku=${encodeURIComponent(product.sku)}`}
        className="inline-block rounded-lg border border-amber-800 bg-amber-950/40 px-4 py-2 text-sm text-amber-200 hover:bg-amber-900/40"
      >
        获取报价
      </Link>
    </article>
  );
}
