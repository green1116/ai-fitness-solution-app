"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import type { PortalSessionSnapshot } from "../shared/portal-types";

interface PortalShellProps {
  session: PortalSessionSnapshot;
  children: ReactNode;
}

function resolveBreadcrumb(pathname: string): string {
  if (pathname === "/saas-product") return "Dashboard";
  if (pathname.startsWith("/saas-product/settings")) return "Settings";
  if (pathname.startsWith("/saas-product/workspaces")) return "Workspaces";
  return "Enterprise Portal";
}

export function PortalShell({ session, children }: PortalShellProps) {
  const pathname = usePathname();
  const breadcrumb = resolveBreadcrumb(pathname);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <div className="flex min-h-screen">
        <aside className="w-64 border-r border-zinc-800 bg-black px-4 py-6">
          <div className="mb-8 space-y-1">
            <p className="text-xs uppercase tracking-wide text-amber-400/90">V52 · Portal UI</p>
            <h1 className="text-lg font-semibold">{session.portalDisplayName ?? "Enterprise Portal"}</h1>
            <p className="text-xs text-zinc-500">{session.tenant.tenantId}</p>
          </div>

          <nav className="space-y-1">
            {session.navigation.map((item) => {
              const active = pathname === item.path;
              return (
                <Link
                  key={item.key}
                  href={item.path}
                  className={`block rounded-lg px-3 py-2 text-sm transition ${
                    active
                      ? "bg-amber-950/50 text-amber-100 ring-1 ring-amber-800/60"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-white"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <header className="border-b border-zinc-800 bg-zinc-950/80 px-6 py-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-xs text-zinc-500">Enterprise Product Portal</p>
                <h2 className="text-xl font-semibold">{breadcrumb}</h2>
              </div>
              <div className="text-right text-xs text-zinc-400">
                <p>{session.user.email ?? session.user.userId}</p>
                <p>{session.role ?? "member"}</p>
              </div>
            </div>
          </header>

          <main className="flex-1 px-6 py-6">{children}</main>
        </div>
      </div>
    </div>
  );
}
