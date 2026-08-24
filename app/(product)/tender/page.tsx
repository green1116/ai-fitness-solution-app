"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductIntelligenceExperience } from "@/app/(product)/ProductIntelligenceExperience";
import {
  pickOwnedProjectId,
  productHref,
  resolveClientProductContext,
  writeStoredProductContext,
} from "@/app/(product)/commercial-context";
import {
  loadTenderClientEntitlement,
  type TenderClientEntitlement,
} from "@/app/(product)/tender-entitlement-client";
import { TenderEnterpriseUpgradeCta } from "@/app/(product)/TenderEnterpriseUpgradeCta";
import { buildTenderUpgradeHref } from "@/app/(product)/tender-entitlement";

type OrgMe = { organizationId?: string | null };
type ProjectList = { ok?: boolean; projects?: Array<{ id: string }> };

async function resolveOrganizationId(): Promise<string> {
  const meRes = await fetch("/api/auth/me");
  const me = (await meRes.json()) as OrgMe;
  return typeof me.organizationId === "string" ? me.organizationId.trim() : "";
}

async function listOwnedProjectIds(organizationId: string): Promise<string[]> {
  const listRes = await fetch("/api/project/list", {
    headers: { "x-organization-id": organizationId },
  });
  const list = (await listRes.json()) as ProjectList;
  return list.ok === true ? (list.projects ?? []).map((p) => p.id).filter(Boolean) : [];
}

function TenderForm() {
  const searchParams = useSearchParams();
  const [projectId, setProjectId] = useState("");
  const [quoteId, setQuoteId] = useState("");
  const [budgetId, setBudgetId] = useState("");
  const [organizationId, setOrganizationId] = useState("");
  const [entitlement, setEntitlement] = useState<TenderClientEntitlement | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function hydrate() {
      const ctx = resolveClientProductContext(searchParams);
      const organizationId = await resolveOrganizationId();
      if (cancelled) return;
      setOrganizationId(organizationId);
      const [ownedIds, nextEntitlement] = await Promise.all([
        organizationId ? listOwnedProjectIds(organizationId) : Promise.resolve([] as string[]),
        loadTenderClientEntitlement(organizationId, {
          ...ctx,
          organizationId,
        }, { currentPath: "/tender" }),
      ]);
      if (cancelled) return;
      const ownedProjectId = pickOwnedProjectId(ctx.projectId, ownedIds);
      setProjectId(ownedProjectId);
      setQuoteId(ctx.quoteId ?? "");
      setBudgetId(ctx.budgetId ?? "");
      setEntitlement(nextEntitlement);
      writeStoredProductContext({
        ...ctx,
        organizationId,
        ...(ownedProjectId ? { projectId: ownedProjectId } : {}),
      });
    }
    void hydrate();
    return () => {
      cancelled = true;
    };
  }, [searchParams]);

  async function handleGenerate() {
    if (!entitlement?.canGenerateTender) {
      return;
    }
    if (!projectId || !quoteId) {
      alert("缺少方案/项目上下文，请先生成方案");
      return;
    }

    setLoading(true);
    setResult("");

    try {
      const organizationId = await resolveOrganizationId();
      setOrganizationId(organizationId);
      const [ownedIds, latest] = await Promise.all([
        organizationId ? listOwnedProjectIds(organizationId) : Promise.resolve([] as string[]),
        loadTenderClientEntitlement(organizationId, {
          organizationId,
          projectId,
          quoteId,
          budgetId,
        }, { currentPath: "/tender" }),
      ]);
      setEntitlement(latest);
      if (!latest.canGenerateTender) {
        return;
      }
      const ownedProjectId = pickOwnedProjectId(projectId, ownedIds);
      if (!ownedProjectId) {
        throw new Error("项目不属于当前组织");
      }

      const res = await fetch("/api/tender/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(organizationId ? { "x-organization-id": organizationId } : {}),
        },
        body: JSON.stringify({
          projectId: ownedProjectId,
          quoteId,
          ...(budgetId ? { budgetId } : {}),
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

  const missingContext = !projectId || !quoteId;
  const tenderLocked = entitlement !== null && !entitlement.canGenerateTender;
  const entitlementPending = entitlement === null;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">标书生成 Tender</h1>
      <p className="text-sm text-zinc-400">Budget + Quote → PDF Engine → 招标文件（核心商业点）</p>
      <ProductIntelligenceExperience />

      {tenderLocked ? (
        <section className="space-y-3 rounded-2xl border border-amber-700/60 bg-zinc-950 p-6 text-sm text-zinc-300">
          <p>标书生成为 Enterprise 功能。当前套餐：{entitlement.currentPlan}。</p>
          <p>升级到 {entitlement.recommendedPlan} 后即可生成标书，项目上下文会保留。</p>
          <TenderEnterpriseUpgradeCta
            href={
              entitlement.upgradeHref ||
              buildTenderUpgradeHref(
                { organizationId, projectId, quoteId, budgetId },
                { authenticated: Boolean(organizationId), currentPath: "/tender" },
              )
            }
            label={entitlement.upgradeCta}
          />
        </section>
      ) : missingContext ? (
        <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-300">
          <p>当前没有方案上下文。请先完成方案与预算，系统会自动带入 ID。</p>
          <Link
            href={productHref(quoteId ? "/budget" : "/quote", {
              organizationId,
              projectId,
              quoteId,
              budgetId,
            })}
            className="inline-block text-emerald-400 hover:underline"
          >
            {quoteId ? "前往计算预算" : "前往生成方案"}
          </Link>
        </section>
      ) : (
        <section className="space-y-4 rounded-2xl border border-zinc-800 bg-zinc-950 p-6">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || entitlementPending || !entitlement?.canGenerateTender}
            className="rounded-xl bg-emerald-400 px-6 py-3 font-semibold text-black disabled:opacity-50"
          >
            {loading ? "生成中…" : entitlementPending ? "校验套餐…" : "生成标书 PDF"}
          </button>
        </section>
      )}

      {result ? (
        <pre className="overflow-auto rounded-xl border border-zinc-800 bg-zinc-950 p-4 text-xs text-zinc-300">
          {result}
        </pre>
      ) : null}
    </div>
  );
}

export default function TenderPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">加载标书上下文…</p>}>
      <TenderForm />
    </Suspense>
  );
}
