"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";

import {
  productHref,
  resolveClientProductContext,
  type ProductCommercialContext,
} from "./commercial-context";
import { loadTenderClientEntitlement } from "./tender-entitlement-client";
import { TenderEnterpriseUpgradeCta } from "./TenderEnterpriseUpgradeCta";
import { buildTenderUpgradeHref } from "./tender-entitlement";

function resolveProUpgradeHref(ctx: ProductCommercialContext): string {
  if (ctx.projectId?.trim()) {
    return productHref("/quote", ctx);
  }
  return "/projects";
}

function NavLinks({
  ctx,
  canGenerateTender,
  currentPlan,
  upgradeCta,
  upgradeHref,
}: {
  ctx: ProductCommercialContext;
  canGenerateTender: boolean;
  /** Empty until entitlement resolves — avoid flashing BASIC→PRO for PRO/ENTERPRISE. */
  currentPlan: string;
  upgradeCta?: string;
  upgradeHref: string;
}) {
  const showBasicToProCta = currentPlan === "BASIC";

  return (
    <>
      <Link href="/projects" className="text-zinc-400 hover:text-white">
        项目
      </Link>
      <Link href={productHref("/quote", ctx)} className="text-zinc-400 hover:text-white">
        方案
      </Link>
      <Link href={productHref("/budget", ctx)} className="text-zinc-400 hover:text-white">
        预算
      </Link>
      {canGenerateTender ? (
        <Link href={productHref("/tender", ctx)} className="text-zinc-400 hover:text-white">
          投标
        </Link>
      ) : (
        <span className="inline-flex items-center gap-2 text-zinc-500">
          <span title="Enterprise 功能">投标（锁定）</span>
          <TenderEnterpriseUpgradeCta href={upgradeHref} label={upgradeCta} context={ctx} />
        </span>
      )}
      {showBasicToProCta ? (
        <Link
          href={resolveProUpgradeHref(ctx)}
          className="font-medium text-emerald-400 hover:text-emerald-300"
        >
          升级专业版
        </Link>
      ) : null}
    </>
  );
}

function ProductCommercialNavInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const ctx = useMemo(
    () => resolveClientProductContext(searchParams),
    [pathname, searchParams],
  );
  const [canGenerateTender, setCanGenerateTender] = useState(false);
  const [currentPlan, setCurrentPlan] = useState("");
  const [upgradeCta, setUpgradeCta] = useState("升级到 Enterprise 解锁投标");
  const [upgradeHref, setUpgradeHref] = useState(
    buildTenderUpgradeHref(ctx, { authenticated: false, currentPath: pathname }),
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const organizationId = ctx.organizationId?.trim() || "";
      let orgId = organizationId;
      if (!orgId) {
        const meRes = await fetch("/api/auth/me");
        const me = (await meRes.json().catch(() => ({}))) as { organizationId?: string | null };
        orgId = typeof me.organizationId === "string" ? me.organizationId.trim() : "";
      }
      const entitlement = await loadTenderClientEntitlement(orgId, {
        ...ctx,
        organizationId: orgId || ctx.organizationId,
      }, { currentPath: pathname });
      if (cancelled) return;
      setCanGenerateTender(entitlement.canGenerateTender);
      setCurrentPlan(String(entitlement.currentPlan || "").trim().toUpperCase());
      setUpgradeCta(entitlement.upgradeCta);
      setUpgradeHref(entitlement.upgradeHref);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [ctx.organizationId, pathname]);

  return (
    <NavLinks
      ctx={ctx}
      canGenerateTender={canGenerateTender}
      currentPlan={currentPlan}
      upgradeCta={upgradeCta}
      upgradeHref={upgradeHref}
    />
  );
}

export function ProductCommercialNav() {
  return (
    <nav className="mx-auto flex max-w-5xl items-center gap-6 text-sm">
      <Suspense
        fallback={
          <NavLinks
            ctx={{}}
            canGenerateTender={false}
            currentPlan=""
            upgradeHref={buildTenderUpgradeHref({}, { authenticated: false, currentPath: "/tender" })}
          />
        }
      >
        <ProductCommercialNavInner />
      </Suspense>
    </nav>
  );
}
