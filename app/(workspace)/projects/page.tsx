"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ProductIntelligenceExperience } from "@/app/(product)/ProductIntelligenceExperience";

type ProjectItem = {
  id: string;
  name: string;
  clientName: string | null;
  city: string | null;
  quoteCount: number;
  tenderCount: number;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadProjects() {
    const res = await fetch("/api/project/list");
    const data = await res.json();
    if (data.ok) setProjects(data.projects);
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  async function handleCreate() {
    if (!name.trim()) return;
    setLoading(true);
    try {
      const res = await fetch("/api/project/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (data.ok) {
        setName("");
        await loadProjects();
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">项目 Workspace</h1>
      <ProductIntelligenceExperience />

      <section className="flex gap-3 rounded-2xl border border-zinc-800 bg-black p-4">
        <input
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2"
          placeholder="新项目名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={loading}
          className="rounded-lg bg-white px-4 py-2 font-semibold text-black"
        >
          创建
        </button>
      </section>

      <ul className="space-y-3">
        {projects.map((p) => (
          <li key={p.id}>
            <Link
              href={`/projects/${p.id}`}
              className="block rounded-xl border border-zinc-800 bg-black p-4 hover:border-zinc-600"
            >
              <div className="font-semibold">{p.name}</div>
              <div className="mt-1 text-xs text-zinc-400">
                {p.clientName ?? "—"} · Quote {p.quoteCount} · Tender {p.tenderCount}
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
