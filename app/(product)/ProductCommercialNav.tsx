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

function planIdentityLabel(plan: string): string {
  const p = plan.trim().toUpperCase();
  if (p === "PRO") return "当前套餐：PRO";
  if (p === "ENTERPRISE") return "当前套餐：ENTERPRISE";
  if (p === "BASIC") return "当前套餐：BASIC";
  return "";
}

function NavLinks({
  ctx,
  canGenerateTender,
  currentPlan,
  userEmail,
  upgradeCta,
  upgradeHref,
}: {
  ctx: ProductCommercialContext;
  canGenerateTender: boolean;
  /** Empty until entitlement resolves — avoid flashing BASIC→PRO for PRO/ENTERPRISE. */
  currentPlan: string;
  userEmail: string;
  upgradeCta?: string;
  upgradeHref: string;
}) {
  const showBasicToProCta = currentPlan === "BASIC";
  const planLabel = planIdentityLabel(currentPlan);

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
      <span className="ml-auto flex items-center gap-3 text-xs text-zinc-400">
        {userEmail ? (
          <span className="max-w-[12rem] truncate" title={userEmail}>
            {userEmail}
          </span>
        ) : null}
        {planLabel ? (
          <span
            className={
              currentPlan === "BASIC"
                ? "text-zinc-400"
                : "font-medium text-emerald-400"
            }
          >
            {planLabel}
          </span>
        ) : null}
        <Link href="/account" className="text-zinc-300 underline-offset-2 hover:text-white hover:underline">
          账户
        </Link>
      </span>
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
  const [userEmail, setUserEmail] = useState("");
  const [upgradeCta, setUpgradeCta] = useState("升级到 Enterprise 解锁投标");
  const [upgradeHref, setUpgradeHref] = useState(
    buildTenderUpgradeHref(ctx, { authenticated: false, currentPath: pathname }),
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      let email = "";
      // Subscription/plan identity: membership org from /api/auth/me only.
      // Sticky product-context org stays on `ctx` for quote/budget/tender links.
      let membershipOrgId = "";

      const meRes = await fetch("/api/auth/me");
      const me = (await meRes.json().catch(() => ({}))) as {
        organizationId?: string | null;
        user?: { email?: string | null } | null;
        authenticated?: boolean;
      };
      if (typeof me.user?.email === "string") {
        email = me.user.email.trim();
      }
      if (typeof me.organizationId === "string") {
        membershipOrgId = me.organizationId.trim();
      }

      const entitlement = await loadTenderClientEntitlement(
        membershipOrgId,
        ctx,
        { currentPath: pathname },
      );
      if (cancelled) return;
      setUserEmail(email);
      setCanGenerateTender(entitlement.canGenerateTender);
      setCurrentPlan(String(entitlement.currentPlan || "").trim().toUpperCase());
      setUpgradeCta(entitlement.upgradeCta);
      setUpgradeHref(entitlement.upgradeHref);
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [ctx, pathname]);

  return (
    <NavLinks
      ctx={ctx}
      canGenerateTender={canGenerateTender}
      currentPlan={currentPlan}
      userEmail={userEmail}
      upgradeCta={upgradeCta}
      upgradeHref={upgradeHref}
    />
  );
}

export function ProductCommercialNav() {
  return (
    <nav className="mx-auto flex max-w-5xl flex-wrap items-center gap-6 text-sm">
      <Suspense
        fallback={
          <NavLinks
            ctx={{}}
            canGenerateTender={false}
            currentPlan=""
            userEmail=""
            upgradeHref={buildTenderUpgradeHref({}, { authenticated: false, currentPath: "/tender" })}
          />
        }
      >
        <ProductCommercialNavInner />
      </Suspense>
    </nav>
  );
}
