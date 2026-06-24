"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/production", label: "Overview" },
  { href: "/production/health", label: "Health" },
  { href: "/production/readiness", label: "Launch Readiness" },
  { href: "/production/security", label: "Security" },
  { href: "/production/errors", label: "Errors" },
  { href: "/production/technical-debt", label: "Tech Debt" },
  { href: "/production/docs", label: "Docs" },
] as const;

export function ProductionNav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-zinc-800/80 bg-black/40 px-6">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto py-2">
        {NAV.map((item) => {
          const active =
            item.href === "/production"
              ? pathname === "/production"
              : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium ${
                active ? "bg-amber-500 text-black" : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
