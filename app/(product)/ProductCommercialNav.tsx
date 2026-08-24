"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";

import {
  productHref,
  resolveClientProductContext,
  type ProductCommercialContext,
} from "./commercial-context";

function NavLinks({ ctx }: { ctx: ProductCommercialContext }) {
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
      <Link href={productHref("/tender", ctx)} className="text-zinc-400 hover:text-white">
        标书 Tender
      </Link>
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

  return <NavLinks ctx={ctx} />;
}

export function ProductCommercialNav() {
  return (
    <nav className="mx-auto flex max-w-5xl items-center gap-6 text-sm">
      <Suspense fallback={<NavLinks ctx={{}} />}>
        <ProductCommercialNavInner />
      </Suspense>
    </nav>
  );
}
