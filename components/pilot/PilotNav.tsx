"use client";

import Link from "next/link";

const NAV = [
  { href: "/pilot", label: "Overview" },
  { href: "/pilot/intake", label: "导入 Intake" },
  { href: "/pilot/delivery-ops", label: "Delivery Ops" },
  { href: "/pilot/delivery-analytics", label: "Analytics" },
  { href: "/pilot/delivery-intelligence", label: "Intelligence" },
  { href: "/pilot/customer-success", label: "CS Follow-up" },
  { href: "/pilot/account-health", label: "Renewal" },
  { href: "/pilot/renewal-ops", label: "Renewal Ops" },
  { href: "/pilot/revenue-ops", label: "Revenue Ops" },
  { href: "/pilot/growth-planning", label: "Growth" },
  { href: "/pilot/expansion-ops", label: "Expansion" },
  { href: "/pilot/portfolio-intelligence", label: "Portfolio" },
  { href: "/pilot/portfolio-ops", label: "Portfolio Ops" },
  { href: "/pilot/board-governance", label: "Board" },
  { href: "/pilot/executive-reporting", label: "Reporting" },
  { href: "/pilot/executive-briefing", label: "Briefing" },
  { href: "/pilot/executive-actions", label: "Actions" },
  { href: "/pilot/executive-archive", label: "Archive" },
  { href: "/pilot/executive-compliance", label: "Compliance" },
  { href: "/pilot/policy-enforcement", label: "Enforcement" },
  { href: "/pilot/production-readiness", label: "Readiness" },
  { href: "/pilot/pilot-signoff", label: "Sign-off" },
  { href: "/pilot/program", label: "Program" },
  { href: "/pilot/health", label: "Health" },
  { href: "/pilot/feedback", label: "Feedback" },
  { href: "/pilot/telemetry", label: "Telemetry" },
  { href: "/pilot/issues", label: "Issues" },
  { href: "/pilot/funnel", label: "Funnel" },
  { href: "/pilot/support", label: "Support" },
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
