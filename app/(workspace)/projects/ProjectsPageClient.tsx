"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const VISIBLE_PROJECTS = 5;

type ProjectItem = {
  id: string;
  name: string;
  clientName: string | null;
  city: string | null;
  quoteCount: number;
  tenderCount: number;
};

async function resolveOrganizationId(): Promise<string> {
  const meRes = await fetch("/api/auth/me");
  const me = (await meRes.json()) as { organizationId?: string | null };
  return typeof me.organizationId === "string" ? me.organizationId.trim() : "";
}

function orgHeaders(organizationId: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-organization-id": organizationId,
  };
}

function ProjectRow({ project }: { project: ProjectItem }) {
  return (
    <li>
      <Link
        href={`/projects/${project.id}`}
        className="block rounded-xl border border-zinc-800 bg-black p-4 hover:border-zinc-600"
      >
        <div className="font-semibold">{project.name}</div>
        <div className="mt-1 text-xs text-zinc-400">
          {project.clientName ?? "—"} · Quote {project.quoteCount} · Tender{" "}
          {project.tenderCount}
        </div>
      </Link>
    </li>
  );
}

export function ProjectsPageClient() {
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  async function loadProjects() {
    const organizationId = await resolveOrganizationId();
    if (!organizationId) {
      setProjects([]);
      return;
    }
    const res = await fetch("/api/project/list", {
      headers: { "x-organization-id": organizationId },
    });
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
      const organizationId = await resolveOrganizationId();
      if (!organizationId) return;
      const res = await fetch("/api/project/create", {
        method: "POST",
        headers: orgHeaders(organizationId),
        body: JSON.stringify({ name, organizationId }),
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

  const visibleProjects = projects.slice(0, VISIBLE_PROJECTS);
  const tailProjects = projects.slice(VISIBLE_PROJECTS);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">项目 Workspace</h1>

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

      {visibleProjects.length > 0 ? (
        <ul className="space-y-3">
          {visibleProjects.map((project) => (
            <ProjectRow key={project.id} project={project} />
          ))}
        </ul>
      ) : null}
      {tailProjects.length > 0 ? (
        <details>
          <summary className="cursor-pointer text-sm text-zinc-500">
            + {tailProjects.length} more projects
          </summary>
          <ul className="mt-3 space-y-3">
            {tailProjects.map((project) => (
              <ProjectRow key={project.id} project={project} />
            ))}
          </ul>
        </details>
      ) : null}
    </div>
  );
}
