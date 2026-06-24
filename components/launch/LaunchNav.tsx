"use client";

import Link from "next/link";

const NAV = [
  { href: "/launch", label: "Overview" },
  { href: "/launch/checklist", label: "Checklist" },
  { href: "/launch/operations", label: "Operations" },
  { href: "/launch/docs", label: "Docs" },
  { href: "/pilot", label: "Pilot" },
] as const;

export function LaunchNav() {
  return (
    <nav className="border-b border-zinc-800/80 bg-black/40 px-6">
      <div className="mx-auto flex max-w-6xl gap-1 overflow-x-auto py-2">
        {NAV.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-zinc-900 hover:text-white"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
