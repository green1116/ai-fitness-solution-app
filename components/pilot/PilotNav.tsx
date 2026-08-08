"use client";

import Link from "next/link";

/** P1 — Intake-focused nav (avoid linking unfinished pilot surfaces). */
const NAV = [
  { href: "/pilot/intake", label: "招标 Intake" },
  { href: "/pilot/ops", label: "运维异常" },
  { href: "/pilot/analytics", label: "智能分析" },
  { href: "/pilot/knowledge", label: "组织知识" },
  { href: "/pilot/improvement", label: "持续改进" },
  { href: "/pilot/benchmark", label: "组织对标" },
  { href: "/pilot/similarity", label: "跨项目" },
  { href: "/pilot/decision", label: "决策支持" },
  { href: "/pilot/readiness", label: "生产就绪" },
  { href: "/projects", label: "项目" },
  { href: "/quote", label: "方案 Quote" },
  { href: "/tender", label: "标书 Tender" },
] as const;

export function PilotNav() {
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
