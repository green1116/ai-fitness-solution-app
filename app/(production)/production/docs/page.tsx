"use client";

import { useEffect, useState } from "react";
import { ProductionLoading } from "@/components/production/ProductionLoading";

type Doc = { id: string; title: string; summary: string; bullets: string[] };

export default function ProductionDocsPage() {
  const [loading, setLoading] = useState(true);
  const [docs, setDocs] = useState<Doc[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/production/documentation");
      const data = await res.json();
      if (data.ok) setDocs(data.documentation);
      setLoading(false);
    })();
  }, []);

  if (loading) return <ProductionLoading />;
  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Production Documentation</h1>
      {docs.map((d) => (
        <section key={d.id} className="rounded-2xl border border-zinc-800 bg-black/40 p-6">
          <h2 className="text-lg font-semibold">{d.title}</h2>
          <p className="mt-1 text-sm text-zinc-400">{d.summary}</p>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-zinc-300">
            {d.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
