"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { EmptyState } from "@/components/workspace/EmptyState";
import { WorkspaceError } from "@/components/workspace/WorkspaceError";
import { WorkspaceLoading } from "@/components/workspace/WorkspaceLoading";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";

type ProjectItem = {
  id: string;
  name: string;
  clientName: string | null;
  quoteCount: number;
};

export default function ProjectsPage() {
  const { loading, error, organizationId, refresh, trackEvent } = useWorkspace();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [listLoading, setListLoading] = useState(true);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);

  const loadProjects = useCallback(async () => {
    if (!organizationId) return;
    setListLoading(true);
    try {
      const res = await fetch("/api/project/list", {
        headers: { "x-organization-id": organizationId },
      });
      const data = await res.json();
      if (data.ok) setProjects(data.projects);
    } finally {
      setListLoading(false);
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) void loadProjects();
  }, [organizationId, loadProjects]);

  if (loading) return <WorkspaceLoading />;
  if (error) return <WorkspaceError message={error} onRetry={() => void refresh()} />;

  async function handleCreate() {
    if (!name.trim() || !organizationId) return;
    setCreating(true);
    try {
      const res = await fetch("/api/project/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-organization-id": organizationId,
        },
        body: JSON.stringify({ name, organizationId }),
      });
      const data = await res.json();
      if (data.ok) {
        setName("");
        trackEvent("project_created", { projectId: data.project?.id });
        await loadProjects();
        await refresh();
      }
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Projects</h1>

      <section id="create" className="flex gap-3 rounded-2xl border border-zinc-800 bg-black/40 p-4">
        <input
          className="flex-1 rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2"
          placeholder="新项目名称"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          type="button"
          onClick={handleCreate}
          disabled={creating}
          className="rounded-lg bg-white px-4 py-2 font-semibold text-black disabled:opacity-50"
        >
          {creating ? "创建中…" : "Create First Project"}
        </button>
      </section>

      {listLoading ? (
        <WorkspaceLoading message="加载项目列表…" />
      ) : projects.length === 0 ? (
        <EmptyState
          title="还没有项目"
          description="在上方输入项目名称并创建，作为 Quote 与 Report 的统一来源。"
          actionLabel="Create First Project"
          actionHref="#create"
        />
      ) : (
        <ul className="space-y-3">
          {projects.map((p) => (
            <li key={p.id}>
              <Link
                href={`/projects/${p.id}`}
                className="block rounded-xl border border-zinc-800 bg-black/40 p-4 hover:border-zinc-600"
              >
                <div className="font-semibold">{p.name}</div>
                <div className="mt-1 text-xs text-zinc-400">
                  {p.clientName ?? "—"} · Quote {p.quoteCount}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
