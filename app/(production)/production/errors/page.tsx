"use client";

import { useEffect, useState } from "react";
import { ProductionLoading } from "@/components/production/ProductionLoading";

export default function ErrorsPage() {
  const [loading, setLoading] = useState(true);
  const [top, setTop] = useState<{ category: string; code: string; count: number; endpoint?: string }[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/production/errors");
      const data = await res.json();
      if (data.ok) setTop(data.errors.topErrors);
      setLoading(false);
    })();
  }, []);

  if (loading) return <ProductionLoading />;
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Error Intelligence</h1>
      {top.length === 0 ? (
        <p className="text-sm text-zinc-500">暂无聚合错误</p>
      ) : (
        <ul className="space-y-2 text-sm">
          {top.map((e, i) => (
            <li key={i} className="flex justify-between rounded-lg border border-zinc-800 px-4 py-3">
              <span>
                [{e.category}] {e.code} {e.endpoint ? `· ${e.endpoint}` : ""}
              </span>
              <span className="text-amber-300">{e.count}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
