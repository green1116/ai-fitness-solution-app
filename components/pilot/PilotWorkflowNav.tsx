"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  CALCULATE_LINKS,
  PILOT_FLOW_ZONES,
  resolveActiveZone,
  type PilotFlowZone,
} from "./pilot-workflow.config";

type PilotWorkflowNavProps = {
  activeZone?: PilotFlowZone;
  projectId?: string;
  compact?: boolean;
};

function withProject(href: string, projectId?: string): string {
  if (!projectId) return href;
  const sep = href.includes("?") ? "&" : "?";
  return `${href}${sep}projectId=${encodeURIComponent(projectId)}`;
}

export function PilotWorkflowNav({ activeZone, projectId, compact }: PilotWorkflowNavProps) {
  const pathname = usePathname();
  const current = activeZone ?? resolveActiveZone(pathname);

  return (
    <nav
      className={`rounded-2xl border border-zinc-800 bg-zinc-950/80 ${
        compact ? "p-3" : "p-4"
      }`}
      aria-label="Pilot 主流程"
    >
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-widest text-zinc-500">
          主流程 · 导入 → 计算 → 交付 → 归档
        </p>
        <Link href="/dashboard" className="text-xs text-zinc-500 hover:text-white">
          控制台
        </Link>
      </div>

      <div className={`grid gap-2 ${compact ? "sm:grid-cols-4" : "sm:grid-cols-2 lg:grid-cols-4"}`}>
        {PILOT_FLOW_ZONES.map((zone) => {
          const active = current === zone.id;
          const href = withProject(zone.href, projectId);

          return (
            <Link
              key={zone.id}
              href={href}
              className={`rounded-xl border p-3 transition ${
                active
                  ? "border-sky-600 bg-sky-950/30"
                  : "border-zinc-800 bg-black/40 hover:border-zinc-600"
              }`}
            >
              <p className={`text-sm font-semibold ${active ? "text-sky-300" : "text-white"}`}>
                {zone.label}
              </p>
              <p className="mt-1 text-xs text-zinc-500">{zone.description}</p>
              {zone.id === "calculate" && !compact ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  {CALCULATE_LINKS.map((link) => (
                    <span
                      key={link.href}
                      className={`rounded px-2 py-0.5 text-[10px] ${
                        pathname === link.href || pathname.startsWith(`${link.href}/`)
                          ? "bg-white text-black"
                          : "border border-zinc-700 text-zinc-400"
                      }`}
                    >
                      {link.label}
                    </span>
                  ))}
                </div>
              ) : null}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
