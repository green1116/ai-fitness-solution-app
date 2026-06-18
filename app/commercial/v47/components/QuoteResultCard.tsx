import type { QuoteResponse } from "@/lib/commercial-products/access-layer";

function formatCny(value: number) {
  return `¥${value.toLocaleString("zh-CN")}`;
}

export function QuoteResultCard({ result }: { result: QuoteResponse }) {
  const { snapshot, pricing, sla } = result;

  return (
    <article className="rounded-xl border border-emerald-900/60 bg-emerald-950/20 p-5">
      <h2 className="mb-4 text-lg font-semibold text-emerald-300">报价结果</h2>
      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">建议价格</dt>
          <dd className="font-semibold text-white">{formatCny(pricing.suggestedPriceCny)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">价格区间</dt>
          <dd className="text-zinc-200">
            {formatCny(snapshot.priceBand.min)} – {formatCny(snapshot.priceBand.max)}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">SLA</dt>
          <dd className="text-zinc-200">
            {sla.tier} · {sla.definition.label}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Eligibility</dt>
          <dd className={snapshot.eligible ? "text-emerald-400" : "text-amber-400"}>
            {snapshot.eligible ? "通过" : "未通过"}
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">Quote ID</dt>
          <dd className="font-mono text-xs text-zinc-300">{snapshot.quoteId}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-zinc-500">创建时间</dt>
          <dd className="text-zinc-300">{new Date(snapshot.createdAt).toLocaleString("zh-CN")}</dd>
        </div>
      </dl>

      {!snapshot.eligible && snapshot.reasons.length > 0 ? (
        <ul className="mt-4 space-y-1 text-xs text-amber-300/90">
          {snapshot.reasons.map((reason) => (
            <li key={reason}>• {reason}</li>
          ))}
        </ul>
      ) : null}
    </article>
  );
}
