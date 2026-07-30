"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CUSTOMER_SHELL_NAV,
  OPS_SHELL_NAV,
  isNavActive,
} from "@/lib/frontend/navigation";
import { resolveShellMode } from "@/lib/frontend/layout-patterns";
import { shouldShowOpsShellNav } from "@/lib/frontend/presentation-security";

/**
 * Customer shell destinations only by default (PD-4.6 §4.4).
 * Ops chrome requires ops shell mode after GRD-OPS — visibility ≠ authorization.
 */
export function ShellNavigation() {
  const pathname = usePathname() ?? "/";
  const shellMode = resolveShellMode(pathname);
  const showOpsNav = shouldShowOpsShellNav({
    shellMode,
    visibility: {
      keys: shellMode === "ops" ? ["VIS-OPS"] : ["VIS-OPS-DENIED"],
      showSignIn: false,
      showCustomerAffordances: true,
      showOpsChrome: shellMode === "ops",
      contextMissing: false,
      actionDisabled: false,
    },
  });

  return (
    <nav
      data-nav-skeleton="shell"
      data-vis-ops={showOpsNav ? "VIS-OPS" : "VIS-OPS-DENIED"}
      aria-label="Global navigation"
    >
      <ul className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
        {CUSTOMER_SHELL_NAV.map((entry) => {
          const active = isNavActive(pathname, entry.href);
          return (
            <li key={entry.id}>
              <Link
                href={entry.href}
                data-nav-id={entry.id}
                data-int-id="INT-NAV-SHELL"
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
                    data-int-id="INT-NAV-SHELL"
                    data-vis="VIS-OPS"
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
