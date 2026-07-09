/**
 * V80 DEPLOY P1 — Go-live checklist (minimal production launch gates)
 */
import type { GoLiveGate } from "./deploy.types";

export const GO_LIVE_CHECKLIST: GoLiveGate[] = [
  {
    id: "DEP-GL-001",
    label: "V80 CODE P4 release ready",
    category: "upstream",
    command: "npx tsx scripts/verify-v80-code-p4-release.ts",
    required: true,
  },
  {
    id: "DEP-GL-002",
    label: "V80 PRODUCT P3 scale ready",
    category: "upstream",
    command: "npx tsx scripts/verify-v80-product-p3-scale.ts",
    required: true,
  },
  {
    id: "DEP-GL-003",
    label: "Production env vars set (DATABASE_URL, secrets, NEXT_PUBLIC_APP_URL)",
    category: "env",
    required: true,
  },
  {
    id: "DEP-GL-004",
    label: "Forbidden dev flags unset in production",
    category: "env",
    required: true,
  },
  {
    id: "DEP-GL-005",
    label: "V80Scaffold DB tables applied",
    category: "database",
    command: "prisma/patches/v80_scaffold_runtime_idempotent.sql",
    required: true,
  },
  {
    id: "DEP-GL-006",
    label: "Prisma client generated",
    category: "database",
    command: "npx prisma generate",
    required: true,
  },
  {
    id: "DEP-GL-007",
    label: "Next.js production build passes",
    category: "runtime",
    command: "npm run build",
    required: true,
  },
  {
    id: "DEP-GL-008",
    label: "V80 health probe OK",
    category: "runtime",
    command: "GET /api/v80/ops/health",
    required: true,
  },
  {
    id: "DEP-GL-009",
    label: "End-to-end smoke: tenant → workflow → PDF",
    category: "verify",
    command: "npx tsx scripts/verify-v80-code-p2-runtime.ts",
    required: true,
  },
  {
    id: "DEP-GL-010",
    label: "TypeScript clean",
    category: "verify",
    command: "npx tsc --noEmit",
    required: true,
  },
];

export function isGoLiveChecklistComplete(): boolean {
  const cats = new Set(GO_LIVE_CHECKLIST.map((g) => g.category));
  return (
    GO_LIVE_CHECKLIST.length === 10 &&
    cats.has("upstream") &&
    cats.has("env") &&
    cats.has("database") &&
    cats.has("runtime") &&
    cats.has("verify")
  );
}
