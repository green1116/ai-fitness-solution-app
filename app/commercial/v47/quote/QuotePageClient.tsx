"use client";

import { useState } from "react";
import Link from "next/link";
import type { QuoteResponse, SalesPortalView } from "@/lib/commercial-products/access-layer";
import type { ProductSku } from "@/lib/commercial-products/shared/constants";
import { QuoteForm } from "../components/QuoteForm";
import { QuoteResultCard } from "../components/QuoteResultCard";

export function QuotePageClient({
  portal,
  initialSku,
}: {
  portal: SalesPortalView;
  initialSku?: ProductSku;
}) {
  const [result, setResult] = useState<QuoteResponse | null>(null);

  return (
    <div className="space-y-6">
      <QuoteForm
        products={portal.products}
        quoteApiPath={portal.quoteApiPath}
        initialSku={initialSku}
        onQuoteResult={setResult}
      />

      {result ? <QuoteResultCard result={result} /> : null}

      <section className="rounded-xl border border-zinc-800 bg-zinc-950 p-5">
        <h2 className="mb-2 text-sm font-semibold text-zinc-300">交付下载（占位）</h2>
        <p className="mb-3 text-xs text-zinc-500">
          PDF 导出入口将在 Step 3 接入。当前路径：{portal.downloadApiPath}
        </p>
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-lg border border-zinc-800 px-4 py-2 text-sm text-zinc-600"
        >
          下载交付模板（即将开放）
        </button>
      </section>

      <Link href="/commercial/v47" className="text-sm text-sky-300 underline">
        ← 返回 Sales Portal
      </Link>
    </div>
  );
}
