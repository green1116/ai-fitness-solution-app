/**
 * V62 P7 — Support readiness
 */

export type KnownIssue = {
  id: string;
  title: string;
  severity: "blocker" | "high" | "medium" | "low";
  workaround?: string;
};

export type SupportReadinessReport = {
  knownIssues: KnownIssue[];
  troubleshootingHints: string[];
  retryGuidance: string[];
  supportNotes: string[];
  score: number;
  ready: boolean;
  generatedAt: string;
};

const KNOWN_ISSUES: KnownIssue[] = [
  {
    id: "ki_db_pool",
    title: "Database connection pool timeout",
    severity: "medium",
    workaround: "Retry after 10s; check Supabase pooler connection_limit",
  },
  {
    id: "ki_pdf_large",
    title: "Large PDF generation timeout",
    severity: "medium",
    workaround: "Reduce plan scope or retry with standard delivery mode",
  },
  {
    id: "ki_register_prod",
    title: "Production register disabled",
    severity: "high",
    workaround: "Set ENABLE_COMMERCIAL_REGISTER=1 in production environment",
  },
];

export function buildSupportReadinessReport(): SupportReadinessReport {
  const troubleshootingHints = [
    "Confirm login session cookie is present (httpOnly session)",
    "Verify organization membership before accessing workspace",
    "Check /api/production/health for subsystem status",
    "Review Launch Center blockers if commercial flow fails",
    "Use Pilot Center issue report for blocker-class problems",
  ];

  const retryGuidance = [
    "Quote generation: wait 5s and retry once",
    "PDF download: refresh page and re-open document center",
    "Tender pack: ensure quote status is READY before opening",
    "Registration: verify email format and company name required",
  ];

  const supportNotes = [
    "Pilot support is internal-only — no third-party ticketing integration in V62",
    "Blocker issues should be triaged within 24h during pilot phase",
    "Feedback categorized as UX/Data/Quote/PDF/Delivery/Intelligence/Launch",
  ];

  const blockerCount = KNOWN_ISSUES.filter((k) => k.severity === "blocker").length;
  const score = Math.max(0, 100 - blockerCount * 30);
  const ready = score >= 70 && blockerCount === 0;

  return {
    knownIssues: KNOWN_ISSUES,
    troubleshootingHints,
    retryGuidance,
    supportNotes,
    score,
    ready,
    generatedAt: new Date().toISOString(),
  };
}
