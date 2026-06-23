"use client";

import { useEffect, useState } from "react";
import { ProductionLoading } from "@/components/production/ProductionLoading";

type DebtItem = {
  id: string;
  title: string;
  severity: string;
  impact: string;
  recommendation: string;
};

export default function TechnicalDebtPage() {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<DebtItem[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/production/technical-debt");
      const data = await res.json();
      if (data.ok) setItems(data.debt.items);
      setLoading(false);
    })();
  }, []);

  if (loading) return <ProductionLoading />;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Technical Debt Registry</h1>
      <ul className="space-y-4">
        {items.map((item) => (
          <li key={item.id} className="rounded-xl border border-zinc-800 bg-black/40 p-5">
            <div className="flex justify-between gap-2">
              <span className="font-semibold">{item.title}</span>
              <span className="text-xs uppercase text-amber-400">{item.severity}</span>
            </div>
            <p className="mt-2 text-sm text-zinc-400">{item.impact}</p>
            <p className="mt-2 text-xs text-zinc-500">建议：{item.recommendation}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
