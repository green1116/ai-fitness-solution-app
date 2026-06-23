"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { HealthBadge } from "@/components/intelligence/HealthBadge";
import { IntelligenceLoading } from "@/components/intelligence/IntelligenceLoading";
import { ReadinessBadge } from "@/components/intelligence/ReadinessBadge";
import { RecommendationPanel } from "@/components/intelligence/RecommendationPanel";
import { RiskBadge } from "@/components/intelligence/RiskBadge";
import type { ProjectIntelligenceDetail } from "@/lib/portal/v59/aggregation/project.intelligence";

export default function ProjectIntelligenceDetailPage() {
  const params = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [project, setProject] = useState<ProjectIntelligenceDetail | null>(null);

  useEffect(() => {
    if (!params.id) return;
    void (async () => {
      const res = await fetch(`/api/intelligence/projects?projectId=${params.id}`);
      const data = await res.json();
      if (data.ok) setProject(data.project);
      setLoading(false);
    })();
  }, [params.id]);

  if (loading) return <IntelligenceLoading />;
  if (!project) return <p className="text-zinc-500">项目不存在</p>;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/intelligence/projects" className="text-sm text-zinc-400 hover:text-white">
          ← 项目列表
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{project.name}</h1>
        <div className="mt-3 flex flex-wrap gap-2">
          <ReadinessBadge score={project.readinessScore} label="Overall" />
          <HealthBadge level={project.health.level} score={project.health.score} />
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-4">
        {project.readiness.dimensions.map((d) => (
          <div key={d.key} className="rounded-xl border border-zinc-800 bg-black/40 p-4">
            <p className="text-xs text-zinc-500">{d.label}</p>
            <p className="mt-2 text-2xl font-bold">{d.score}%</p>
          </div>
        ))}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Risks</h2>
        {project.risks.length === 0 ? (
          <p className="text-sm text-zinc-500">无风险项</p>
        ) : (
          <ul className="space-y-2">
            {project.risks.map((r) => (
              <li key={r.id} className="flex items-center justify-between rounded-lg border border-zinc-800 px-4 py-3 text-sm">
                <span>{r.title}</span>
                <RiskBadge severity={r.severity} />
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="mb-4 text-lg font-semibold">Version Intelligence</h2>
        {project.versionComparisons.length === 0 ? (
          <p className="text-sm text-zinc-500">暂无版本对比数据</p>
        ) : (
          <ul className="space-y-3 text-sm">
            {project.versionComparisons.map((v, i) => (
              <li key={i} className="rounded-xl border border-zinc-800 p-4">
                <div className="font-medium">
                  {v.artifactType}: {v.fromLabel} → {v.toLabel}
                </div>
                <ul className="mt-2 space-y-1 text-xs text-zinc-500">
                  {v.diffs.map((d, j) => (
                    <li key={j}>
                      {d.changeType}: {d.field} {d.from} → {d.to}
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        )}
      </section>

      <RecommendationPanel recommendations={project.recommendations} />

      <div className="flex flex-wrap gap-3">
        <Link href={`/documents/projects/${project.id}`} className="rounded-xl border border-zinc-700 px-4 py-2 text-sm">
          Tender Pack Center
        </Link>
        <Link href={`/projects/${project.id}`} className="rounded-xl border border-zinc-700 px-4 py-2 text-sm">
          Workspace Project
        </Link>
      </div>
    </div>
  );
}
