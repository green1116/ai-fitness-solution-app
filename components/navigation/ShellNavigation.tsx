"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CUSTOMER_SHELL_NAV,
  OPS_SHELL_NAV,
  isNavActive,
} from "@/lib/frontend/navigation";
import { resolveShellMode } from "@/lib/frontend/layout-patterns";

export function ShellNavigation() {
  const pathname = usePathname() ?? "/";
  const shellMode = resolveShellMode(pathname);
  const showOpsNav = shellMode === "ops";

  return (
    <nav data-nav-skeleton="shell" aria-label="Global navigation">
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {CUSTOMER_SHELL_NAV.map((entry) => {
          const active = isNavActive(pathname, entry.href);
          return (
            <li key={entry.id}>
              <Link
                href={entry.href}
                data-nav-id={entry.id}
                aria-current={active ? "page" : undefined}
                className={
                  active
                    ? "font-semibold text-slate-950"
                    : "text-slate-600 transition-colors hover:text-slate-950 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-950"
                }
              >
                {entry.label}
              </Link>
            </li>
          );
        })}
        {showOpsNav
          ? OPS_SHELL_NAV.map((entry) => {
              const active = isNavActive(pathname, entry.href);
              return (
                <li key={entry.id}>
                  <Link
                    href={entry.href}
                    data-nav-id={entry.id}
                    aria-current={active ? "page" : undefined}
                    className={
                      active
                        ? "font-semibold text-slate-950"
                        : "text-slate-600 transition-colors hover:text-slate-950 focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-slate-950"
                    }
                  >
                    {entry.label}
                  </Link>
                </li>
              );
            })
          : null}
      </ul>
    </nav>
  );
}
