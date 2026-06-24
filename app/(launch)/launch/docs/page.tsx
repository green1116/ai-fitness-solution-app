"use client";

import { useEffect, useState } from "react";

type Doc = { id: string; title: string; bullets: string[] };

export default function LaunchDocsPage() {
  const [docs, setDocs] = useState<Doc[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/launch/documentation");
      const data = await res.json();
      if (data.ok) setDocs(data.documentation);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Launch Documentation</h1>
      {docs.map((d) => (
        <section key={d.id} className="rounded-xl border border-zinc-800 p-5">
          <h2 className="font-semibold">{d.title}</h2>
          <ul className="mt-2 list-disc pl-5 text-sm text-zinc-400">
            {d.bullets.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
