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

function NavLinks({
  ctx,
  canGenerateTender,
  upgradeCta,
  upgradeHref,
}: {
  ctx: ProductCommercialContext;
  canGenerateTender: boolean;
  upgradeCta?: string;
  upgradeHref?: string;
}) {
  return (
    <>
      <Link href="/dashboard" className="font-semibold text-zinc-300 hover:text-white">
        控制台
      </Link>
      <Link href={productHref("/quote", ctx)} className="text-zinc-400 hover:text-white">
        方案 Quote
      </Link>
      <Link href={productHref("/budget", ctx)} className="text-zinc-400 hover:text-white">
        预算 Budget
      </Link>
      {canGenerateTender ? (
        <Link href={productHref("/tender", ctx)} className="text-zinc-400 hover:text-white">
          标书 Tender
        </Link>
      ) : (
        <span className="inline-flex items-center gap-2 text-zinc-500">
          <span title="Enterprise 功能">标书 Tender（锁定）</span>
          <TenderEnterpriseUpgradeCta href={upgradeHref} label={upgradeCta} />
        </span>
      )}
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
  const [upgradeCta, setUpgradeCta] = useState("升级到 Enterprise 解锁标书");
  const [upgradeHref, setUpgradeHref] = useState(buildTenderUpgradeHref(ctx, { authenticated: false }));

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
      });
      if (cancelled) return;
      setCanGenerateTender(entitlement.canGenerateTender);
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
            upgradeHref={buildTenderUpgradeHref({}, { authenticated: false })}
          />
        }
      >
        <ProductCommercialNavInner />
      </Suspense>
    </nav>
  );
}
