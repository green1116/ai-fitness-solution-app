"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/intelligence", label: "Overview" },
  { href: "/intelligence/projects", label: "Projects" },
  { href: "/intelligence/executive", label: "Executive" },
  { href: "/intelligence/readiness", label: "Readiness" },
  { href: "/intelligence/health", label: "Health" },
  { href: "/intelligence/risk", label: "Risk" },
  { href: "/intelligence/analytics", label: "Analytics" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/intelligence") return pathname === "/intelligence";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function IntelligenceNav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-zinc-800/80 bg-black/40 px-6">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto py-2">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${
              isActive(pathname, item.href)
                ? "bg-violet-500 text-black"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-white"
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
