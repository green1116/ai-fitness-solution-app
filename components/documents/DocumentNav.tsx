"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  { href: "/documents", label: "Overview" },
  { href: "/documents/plans", label: "Plans" },
  { href: "/documents/budgets", label: "Budgets" },
  { href: "/documents/quotes", label: "Quotes" },
  { href: "/documents/reports", label: "Reports" },
  { href: "/documents/deliveries", label: "Deliveries" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/documents") return pathname === "/documents";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DocumentNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-zinc-800/80 bg-black/40 px-6">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto py-2">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
                active
                  ? "bg-sky-500 text-black"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
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
