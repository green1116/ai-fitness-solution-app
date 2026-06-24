"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { HealthBadge } from "@/components/intelligence/HealthBadge";
import { IntelligenceLoading } from "@/components/intelligence/IntelligenceLoading";
import { ReadinessBadge } from "@/components/intelligence/ReadinessBadge";
import { RiskBadge } from "@/components/intelligence/RiskBadge";
import type { HealthLevel } from "@/lib/portal/v59/scoring/health.engine";

type ProjectItem = {
  id: string;
  name: string;
  clientName: string | null;
  quotesCount: number;
  deliveriesCount: number;
  readiness: number;
  health: string;
  riskCount: number;
  lastActivity: string | null;
};

export default function ProjectsIntelligencePage() {
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<ProjectItem[]>([]);

  useEffect(() => {
    void (async () => {
      const res = await fetch("/api/intelligence/projects");
      const data = await res.json();
      if (data.ok) setProjects(data.projects);
      setLoading(false);
    })();
  }, []);

  if (loading) return <IntelligenceLoading message="加载项目智能…" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Project Intelligence</h1>
      {projects.length === 0 ? (
        <p className="text-sm text-zinc-500">暂无项目 — 请先创建项目</p>
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/intelligence/projects/${p.id}`}
                className="block rounded-xl border border-zinc-800 bg-black/40 p-5 hover:border-violet-800"
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-white">{p.name}</div>
                    <div className="mt-1 text-xs text-zinc-500">
                      {p.clientName ?? "—"} · {p.quotesCount} quotes · {p.deliveriesCount} deliveries
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <ReadinessBadge score={p.readiness} />
                    <HealthBadge level={p.health as HealthLevel} />
                    {p.riskCount > 0 ? <RiskBadge severity="high" label={`${p.riskCount} risks`} /> : null}
                  </div>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
