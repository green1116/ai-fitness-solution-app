"use client";

import { useState } from "react";
import { ProductIntelligenceExperience } from "@/app/(product)/ProductIntelligenceExperience";

type OrgMe = { organizationId?: string | null };
type ProjectList = { ok?: boolean; projects?: Array<{ id: string }> };
type ProjectCreate = { ok?: boolean; project?: { id: string }; message?: string };

function orgHeaders(organizationId: string): HeadersInit {
  return {
    "Content-Type": "application/json",
    "x-organization-id": organizationId,
  };
}

async function resolveOrganizationId(): Promise<string> {
  const meRes = await fetch("/api/auth/me");
  const me = (await meRes.json()) as OrgMe;
  return typeof me.organizationId === "string" ? me.organizationId.trim() : "";
}

async function resolveOrgProject(
  organizationId: string,
  companyName: string,
): Promise<string> {
  const listRes = await fetch("/api/project/list", {
    headers: { "x-organization-id": organizationId },
  });
  const list = (await listRes.json()) as ProjectList;
  const existingId = list.projects?.[0]?.id?.trim();
  if (existingId) return existingId;

  const createRes = await fetch("/api/project/create", {
    method: "POST",
    headers: orgHeaders(organizationId),
    body: JSON.stringify({
      name: companyName,
      clientName: companyName,
      organizationId,
    }),
  });
  const created = (await createRes.json()) as ProjectCreate;
  const createdId = created.project?.id?.trim();
  if (!created.ok || !createdId) {
    throw new Error(created.message || "项目创建失败");
  }
  return createdId;
}

export default function QuotePage() {
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  async function handleGenerate() {
    if (!companyName) {
      alert("请填写企业名称");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const organizationId = await resolveOrganizationId();
      const projectId = organizationId
        ? await resolveOrgProject(organizationId, companyName)
        : "";

      const res = await fetch("/api/quote/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(organizationId ? { "x-organization-id": organizationId } : {}),
        },
        body: JSON.stringify({
          projectId,
          companyName,
          workspaceId: "ws-default",
          ...(organizationId ? { organizationId } : {}),
        }),
      });
      const data = await res.json();
      setResult(JSON.stringify(data, null, 2));
    } catch {
      setResult("请求失败");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">方案生成 Quote</h1>
      <p className="text-sm text-zinc-400">输入企业信息 → 调用 V58 Orchestrator → 返回 AI 方案</p>
      <ProductIntelligenceExperience />

      <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
        <input
          className="w-full rounded-lg border border-zinc-700 bg-black px-4 py-3"
          placeholder="企业名称"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
        />
        <button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
        >
          {loading ? "生成中…" : "生成方案"}
        </button>
      </section>

      {result ? (
        <pre className="overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300">
          {result}
        </pre>
      ) : null}
    </div>
  );
}
