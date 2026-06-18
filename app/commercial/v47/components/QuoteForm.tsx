"use client";

import { useMemo, useState } from "react";
import type { QuoteResponse, SalesPortalProductCard } from "@/lib/commercial-products/access-layer";
import type { ProductSku, ProjectComplexity, SlaTier } from "@/lib/commercial-products/shared/constants";
import { PRODUCT_SKU, PROJECT_COMPLEXITY, SLA_TIER } from "@/lib/commercial-products/shared/constants";

type QuoteFormProps = {
  products: SalesPortalProductCard[];
  quoteApiPath: string;
  initialSku?: ProductSku;
  onQuoteResult: (result: QuoteResponse) => void;
};

export function QuoteForm({ products, quoteApiPath, initialSku, onQuoteResult }: QuoteFormProps) {
  const defaultSku = initialSku && PRODUCT_SKU.includes(initialSku) ? initialSku : products[0]?.sku ?? "kickstart-package";

  const [sku, setSku] = useState<ProductSku>(defaultSku);
  const [projectName, setProjectName] = useState("School Gym Project");
  const [areaSqm, setAreaSqm] = useState("320");
  const [headcount, setHeadcount] = useState("180");
  const [budgetCny, setBudgetCny] = useState("650000");
  const [complexity, setComplexity] = useState<ProjectComplexity>("medium");
  const [slaTier, setSlaTier] = useState<SlaTier>("7d");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => products.find((product) => product.sku === sku),
    [products, sku],
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(quoteApiPath, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          projectName: projectName.trim(),
          areaSqm: Number(areaSqm),
          headcount: Number(headcount),
          budgetCny: Number(budgetCny),
          complexity,
          slaTier,
        }),
      });

      const payload = await response.json();
      if (!response.ok || payload.ok === false) {
        throw new Error(payload.message ?? "quote request failed");
      }

      onQuoteResult(payload as QuoteResponse);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "quote request failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-950 p-5">
      <div>
        <label className="mb-1 block text-sm text-zinc-400">产品 SKU</label>
        <select
          value={sku}
          onChange={(event) => {
            const nextSku = event.target.value as ProductSku;
            setSku(nextSku);
            const product = products.find((item) => item.sku === nextSku);
            if (product) setSlaTier(product.defaultSla);
          }}
          className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
        >
          {products.map((product) => (
            <option key={product.sku} value={product.sku}>
              {product.name}
            </option>
          ))}
        </select>
      </div>

      {selectedProduct ? (
        <p className="text-xs text-zinc-500">
          {selectedProduct.description} · 交付物 {selectedProduct.deliverableCount} 项
        </p>
      ) : null}

      <div>
        <label className="mb-1 block text-sm text-zinc-400">项目名称</label>
        <input
          value={projectName}
          onChange={(event) => setProjectName(event.target.value)}
          className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
          required
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="mb-1 block text-sm text-zinc-400">面积 (㎡)</label>
          <input
            value={areaSqm}
            onChange={(event) => setAreaSqm(event.target.value)}
            type="number"
            min={1}
            className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">人数</label>
          <input
            value={headcount}
            onChange={(event) => setHeadcount(event.target.value)}
            type="number"
            min={1}
            className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
            required
          />
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">预算 (CNY)</label>
          <input
            value={budgetCny}
            onChange={(event) => setBudgetCny(event.target.value)}
            type="number"
            min={1}
            className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
            required
          />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1 block text-sm text-zinc-400">复杂度</label>
          <select
            value={complexity}
            onChange={(event) => setComplexity(event.target.value as ProjectComplexity)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
          >
            {PROJECT_COMPLEXITY.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-sm text-zinc-400">SLA</label>
          <select
            value={slaTier}
            onChange={(event) => setSlaTier(event.target.value as SlaTier)}
            className="w-full rounded-lg border border-zinc-700 bg-black px-3 py-2 text-sm text-white"
          >
            {SLA_TIER.map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}

      <button
        type="submit"
        disabled={loading}
        className="rounded-lg border border-amber-800 bg-amber-950/40 px-4 py-2 text-sm text-amber-200 hover:bg-amber-900/40 disabled:opacity-50"
      >
        {loading ? "报价中..." : "提交报价"}
      </button>
    </form>
  );
}
