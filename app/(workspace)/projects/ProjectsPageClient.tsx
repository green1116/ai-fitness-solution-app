"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  DEFAULT_PROJECT_INTAKE,
  PROJECT_BUDGET_OPTIONS,
  PROJECT_GOAL_OPTIONS,
  PROJECT_SCENARIO_OPTIONS,
  type ProjectIntakeForm,
  projectIntakeToCreatePayload,
} from "@/lib/project/project-intake";

const VISIBLE_PROJECTS = 5;

type ProjectItem = {
  id: string;
  name: string;
  clientName: string | null;
  city: string | null;
  quoteCount: number;
  tenderCount: number;
};

const INPUT_CLS =
  "w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2 text-sm";

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
        className="block cursor-pointer rounded-xl border border-zinc-800 bg-black p-4 transition hover:border-zinc-600 hover:bg-zinc-950"
      >
        <div className="font-semibold text-white hover:underline">{project.name}</div>
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
  const [form, setForm] = useState<ProjectIntakeForm>(DEFAULT_PROJECT_INTAKE);
  const [loading, setLoading] = useState(false);
  const [listLoading, setListLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [createError, setCreateError] = useState("");

  function updateField<K extends keyof ProjectIntakeForm>(key: K, value: ProjectIntakeForm[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function loadProjects() {
    setListLoading(true);
    try {
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
      else setProjects([]);
    } catch {
      setProjects([]);
    } finally {
      setListLoading(false);
    }
  }

  useEffect(() => {
    void loadProjects();
  }, []);

  async function handleCreate() {
    setCreateError("");
    if (!form.name.trim()) {
      setCreateError("请填写项目名称");
      return;
    }
    if (!form.companySize.trim() || Number(form.companySize) <= 0) {
      setCreateError("请填写有效员工人数");
      return;
    }
    if (!form.area.trim() || Number(form.area) <= 0) {
      setCreateError("请填写有效场地面积（㎡）");
      return;
    }

    setLoading(true);
    try {
      const organizationId = await resolveOrganizationId();
      if (!organizationId) {
        setCreateError("请先登录后再创建项目");
        return;
      }
      const payload = projectIntakeToCreatePayload(form);
      const res = await fetch("/api/project/create", {
        method: "POST",
        headers: orgHeaders(organizationId),
        body: JSON.stringify({ ...payload, organizationId }),
      });
      const data = await res.json();
      if (data.ok) {
        setForm(DEFAULT_PROJECT_INTAKE);
        await loadProjects();
      } else {
        setCreateError(typeof data.message === "string" ? data.message : "项目创建失败");
      }
    } finally {
      setLoading(false);
    }
  }

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredProjects = normalizedQuery
    ? projects.filter((project) => {
        const name = project.name.toLowerCase();
        const clientName = (project.clientName ?? "").toLowerCase();
        return name.includes(normalizedQuery) || clientName.includes(normalizedQuery);
      })
    : projects;
  const visibleProjects = filteredProjects.slice(0, VISIBLE_PROJECTS);
  const tailProjects = filteredProjects.slice(VISIBLE_PROJECTS);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">项目 Workspace</h1>

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-black p-4">
        <div>
          <p className="text-sm font-medium text-zinc-200">新建项目</p>
          <p className="mt-1 text-xs text-zinc-500">填写真实业务参数后再生成方案</p>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <input
            className={INPUT_CLS}
            placeholder="项目名称（必填）"
            value={form.name}
            onChange={(e) => updateField("name", e.target.value)}
          />
          <input
            className={INPUT_CLS}
            placeholder="企业/客户名称"
            value={form.clientName}
            onChange={(e) => updateField("clientName", e.target.value)}
          />
          <input
            className={INPUT_CLS}
            placeholder="员工人数（必填）"
            type="number"
            min={1}
            value={form.companySize}
            onChange={(e) => updateField("companySize", e.target.value)}
          />
          <input
            className={INPUT_CLS}
            placeholder="场地面积 ㎡（必填）"
            type="number"
            min={1}
            value={form.area}
            onChange={(e) => updateField("area", e.target.value)}
          />
          <input
            className={INPUT_CLS}
            placeholder="城市"
            value={form.city}
            onChange={(e) => updateField("city", e.target.value)}
          />
          <input
            className={INPUT_CLS}
            placeholder="行业（可选，默认用场景）"
            value={form.industry}
            onChange={(e) => updateField("industry", e.target.value)}
          />
          <select
            className={INPUT_CLS}
            value={form.scenario}
            onChange={(e) => updateField("scenario", e.target.value)}
          >
            {PROJECT_SCENARIO_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className={INPUT_CLS}
            value={form.goal}
            onChange={(e) => updateField("goal", e.target.value)}
          >
            {PROJECT_GOAL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <select
            className={INPUT_CLS}
            value={form.budget}
            onChange={(e) => updateField("budget", e.target.value)}
          >
            {PROJECT_BUDGET_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <input
            className={`${INPUT_CLS} md:col-span-2`}
            placeholder="备注（可选）"
            value={form.notes}
            onChange={(e) => updateField("notes", e.target.value)}
          />
        </div>
        {createError ? (
          <p className="text-sm text-rose-300">{createError}</p>
        ) : null}
        <button
          type="button"
          onClick={handleCreate}
          disabled={loading}
          className="rounded-lg bg-white px-4 py-2 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "创建中…" : "创建"}
        </button>
      </section>

      {!listLoading && projects.length > 0 ? (
        <input
          className={INPUT_CLS}
          placeholder="搜索项目或企业名称"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      ) : null}

      {listLoading ? (
        <p className="text-sm text-zinc-500">项目加载中...</p>
      ) : projects.length === 0 ? (
        <p className="text-sm text-zinc-500">暂无项目</p>
      ) : filteredProjects.length === 0 ? (
        <p className="text-sm text-zinc-500">无匹配项目</p>
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
