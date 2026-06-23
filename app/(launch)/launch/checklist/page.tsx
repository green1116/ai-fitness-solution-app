"use client";

import { useEffect, useState } from "react";

type Item = { id: string; category: string; label: string; status: string; detail?: string };

export default function LaunchChecklistPage() {
  const [items, setItems] = useState<Item[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/launch/checklist");
      const data = await res.json();
      if (data.ok) setItems(data.checklist.items);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Launch Checklist</h1>
      <ul className="space-y-2">
        {items.map((item) => (
          <li
            key={item.id}
            className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 text-sm"
          >
            <span>
              [{item.category}] {item.label}
            </span>
            <span
              className={
                item.status === "pass"
                  ? "text-emerald-400"
                  : item.status === "fail"
                    ? "text-red-400"
                    : "text-amber-400"
              }
            >
              {item.status}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
