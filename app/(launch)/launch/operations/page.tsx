"use client";

import { useEffect, useState } from "react";

export default function LaunchOperationsPage() {
  const [ops, setOps] = useState<{
    stats: { usersEstimate: number; projects: number; quotes: number; deliveries: number; downloads: number };
    recentActivities: { event: string; timestamp: string }[];
  } | null>(null);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/launch/operations");
      const data = await res.json();
      if (data.ok) setOps(data.operations);
    })();
  }, []);

  if (!ops) return <p className="text-zinc-400">加载运营数据…</p>;

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Operational Dashboard</h1>
      <div className="grid gap-4 sm:grid-cols-5">
        {Object.entries(ops.stats).map(([k, v]) => (
          <div key={k} className="rounded-xl border border-zinc-800 p-4 text-center">
            <p className="text-xs text-zinc-500">{k}</p>
            <p className="text-2xl font-bold">{v}</p>
          </div>
        ))}
      </div>
      <section>
        <h2 className="mb-3 font-semibold">Recent Activities</h2>
        <ul className="space-y-1 text-sm text-zinc-400">
          {ops.recentActivities.map((a, i) => (
            <li key={i}>
              {a.event} · {new Date(a.timestamp).toLocaleString()}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
