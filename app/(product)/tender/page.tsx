"use client";

import Link from "next/link";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
import { downloadTenderPack } from "@/components/documents/downloadTenderPack";

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
  const [message, setMessage] = useState("");
  const [downloadReady, setDownloadReady] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [packDownloaded, setPackDownloaded] = useState(false);

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
      setMessage("当前套餐无法生成投标文件");
      setDownloadReady(false);
      return;
    }
    if (!projectId || !quoteId) {
      alert("请先完成方案与预算");
      return;
    }

    setLoading(true);
    setMessage("");
    setDownloadReady(false);
    setPackDownloaded(false);

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
        setMessage("当前套餐无法生成投标文件");
        return;
      }
      const ownedProjectId = pickOwnedProjectId(projectId, ownedIds);
      if (!ownedProjectId) {
        setMessage("无法确认当前项目，请返回方案页重试");
        return;
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
      const data = (await res.json().catch(() => null)) as {
        ok?: boolean;
      } | null;
      if (!res.ok || data?.ok !== true) {
        setMessage("投标文件生成失败，请稍后重试");
        return;
      }
      setProjectId(ownedProjectId);
      setMessage("投标文件已生成");
      setDownloadReady(true);
    } catch {
      setMessage("投标文件生成失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  async function handleDownloadPack() {
    if (!projectId || downloading) return;
    setDownloading(true);
    setMessage("投标文件已生成");
    try {
      await downloadTenderPack(projectId);
      setPackDownloaded(true);
    } catch {
      setMessage("交付文件下载失败，请稍后重试");
    } finally {
      setDownloading(false);
    }
  }

  const missingContext = !projectId || !quoteId;
  const tenderLocked = entitlement !== null && !entitlement.canGenerateTender;
  const entitlementPending = entitlement === null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs text-emerald-400">交付路径：项目 → 方案 → 预算 → 投标 → 下载</p>
        <h1 className="mt-1 text-2xl font-bold">当前：投标</h1>
        <p className="text-sm text-zinc-400">
          {downloadReady
            ? "投标文件已就绪。主要下一步：下载交付文件。"
            : "根据方案与预算生成投标交付文件。"}
        </p>
      </div>

      {tenderLocked ? (
        <section className="space-y-3 rounded-2xl border border-amber-700/60 bg-zinc-950 p-6 text-sm text-zinc-300">
          <p>投标文件生成为 Enterprise 功能。当前套餐：{entitlement.currentPlan}。</p>
          <p>升级到 {entitlement.recommendedPlan} 后即可生成投标文件，当前项目进度会保留。</p>
          <TenderEnterpriseUpgradeCta
            href={
              entitlement.upgradeHref ||
              buildTenderUpgradeHref(
                { organizationId, projectId, quoteId, budgetId },
                { authenticated: Boolean(organizationId), currentPath: "/tender" },
              )
            }
            label={entitlement.upgradeCta}
            context={{ organizationId, projectId, quoteId, budgetId }}
          />
        </section>
      ) : missingContext ? (
        <section className="space-y-3 rounded-2xl border border-zinc-800 bg-zinc-950 p-6 text-sm text-zinc-300">
          <p>当前缺少方案信息。请先完成方案与预算。</p>
          <Link
            href={productHref(quoteId ? "/budget" : "/quote", {
              organizationId,
              projectId,
              quoteId,
              budgetId,
            })}
            className="inline-block rounded-xl bg-white px-6 py-3 font-semibold text-black"
          >
            {quoteId ? "下一步：前往计算预算" : "下一步：前往生成方案"}
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
            {loading ? "生成中…" : entitlementPending ? "准备中…" : "生成投标文件"}
          </button>
        </section>
      )}

      {message ? (
        <div className="space-y-3">
          <p
            className={
              message === "投标文件已生成" || message === "标书已生成"
                ? "rounded-xl border border-emerald-900/50 bg-emerald-950/20 p-4 text-sm text-emerald-300"
                : "rounded-xl border border-rose-900/50 bg-rose-950/20 p-4 text-sm text-rose-300"
            }
          >
            {message === "标书已生成" ? "投标文件已生成" : message}
          </p>
          {downloadReady && projectId ? (
            <button
              type="button"
              onClick={() => {
                void handleDownloadPack();
              }}
              disabled={downloading}
              className="rounded-xl bg-white px-6 py-3 font-semibold text-black disabled:opacity-50"
            >
              {downloading ? "下载中…" : "下载交付文件"}
            </button>
          ) : null}
          {packDownloaded ? (
            <div className="space-y-2 rounded-xl border border-emerald-900/40 bg-emerald-950/10 p-4 text-sm text-emerald-200">
              <p>交付文件已下载。正式项目交付路径已完成。</p>
              <Link
                href={projectId ? `/projects/${encodeURIComponent(projectId)}` : "/projects"}
                className="inline-block underline hover:text-emerald-100"
              >
                返回项目
              </Link>
            </div>
          ) : null}
          {message === "当前套餐无法生成标书" || message === "当前套餐无法生成投标文件" ? (
            <TenderEnterpriseUpgradeCta
              href={
                entitlement?.upgradeHref ||
                buildTenderUpgradeHref(
                  { organizationId, projectId, quoteId, budgetId },
                  { authenticated: Boolean(organizationId), currentPath: "/tender" },
                )
              }
              label={entitlement?.upgradeCta}
              context={{ organizationId, projectId, quoteId, budgetId }}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function TenderPage() {
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">加载中…</p>}>
      <TenderForm />
    </Suspense>
  );
}
