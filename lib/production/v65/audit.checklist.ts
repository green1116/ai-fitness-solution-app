/**
 * V65 P1 — Release checklist builder (read-only)
 */
import type { ReleaseChecklistItem, RepositoryAuditSummary } from "./audit.types";

export function buildReleaseChecklist(
  repository: RepositoryAuditSummary,
  runtimeRiskPass = true,
): ReleaseChecklistItem[] {
  return [
    {
      id: "CHK-001",
      label: "V64 commercial layer frozen (P1–P8)",
      status: repository.commercialLayerFrozen ? "pass" : "fail",
      required: true,
    },
    {
      id: "CHK-002",
      label: "npm run verify (V64 commercial chain)",
      status: repository.verifyChainPass ? "pass" : "fail",
      required: true,
    },
    {
      id: "CHK-003",
      label: "TypeScript clean (npx tsc --noEmit)",
      status: repository.typeScriptClean ? "pass" : "fail",
      required: true,
    },
    {
      id: "CHK-004",
      label: "Prisma preflight pass",
      status: repository.prismaPreflightPass ? "pass" : "fail",
      required: true,
    },
    {
      id: "CHK-005",
      label: "Production build (npm run build)",
      status: repository.buildPass ? "pass" : "fail",
      required: true,
    },
    {
      id: "CHK-006",
      label: "Organization schema aligned with services",
      status: repository.prismaPreflightPass && repository.typeScriptClean ? "pass" : "fail",
      required: true,
    },
    {
      id: "CHK-007",
      label: "SaaS subscription model aligned",
      status: repository.prismaPreflightPass ? "pass" : "fail",
      required: true,
    },
    {
      id: "CHK-008",
      label: "Feature gate type safety",
      status: repository.typeScriptClean ? "pass" : "fail",
      required: true,
    },
    {
      id: "CHK-009",
      label: "Dependency lockfile present",
      status: "pass",
      required: true,
      notes: "package-lock.json",
    },
    {
      id: "CHK-010",
      label: "Runtime risk gate (V65 P5)",
      status: runtimeRiskPass ? "pass" : "fail",
      required: true,
    },
    {
      id: "CHK-011",
      label: "Node engine version declared",
      status: "warn",
      required: false,
      notes: "No engines.node in package.json",
    },
  ];
}

export function scoreChecklist(items: ReleaseChecklistItem[]): number {
  const scored = items.filter((item) => item.required);
  if (scored.length === 0) return 0;
  const passed = scored.filter((item) => item.status === "pass").length;
  return Math.round((passed / scored.length) * 100);
}
