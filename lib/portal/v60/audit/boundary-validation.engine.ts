/**
 * V60 P2 — Organization boundary validation
 */

import fs from "node:fs";
import path from "node:path";

export type BoundaryFinding = {
  id: string;
  layer: string;
  issue: string;
  severity: "pass" | "warn" | "fail";
  detail: string;
};

export type BoundaryValidationReport = {
  findings: BoundaryFinding[];
  crossOrgRisk: boolean;
  score: number;
};

const ROOT = path.resolve(process.cwd());

const LAYER_CHECKS: { layer: string; apiPath: string; mustFilterOrg: string[] }[] = [
  {
    layer: "Workspace",
    apiPath: "app/api/workspace/summary/route.ts",
    mustFilterOrg: ["organizationId"],
  },
  {
    layer: "Documents",
    apiPath: "app/api/documents/summary/route.ts",
    mustFilterOrg: ["organizationId", "getPortalUserContext"],
  },
  {
    layer: "Delivery",
    apiPath: "app/api/documents/deliveries/route.ts",
    mustFilterOrg: ["organizationId", "aggregateDeliveries"],
  },
  {
    layer: "Intelligence",
    apiPath: "app/api/intelligence/executive/route.ts",
    mustFilterOrg: ["organizationId", "buildExecutiveDashboard"],
  },
  {
    layer: "Quote",
    apiPath: "app/api/quote/generate/route.ts",
    mustFilterOrg: ["organizationId", "gate.organizationId"],
  },
];

export function runBoundaryValidation(): BoundaryValidationReport {
  const findings: BoundaryFinding[] = [];

  for (const check of LAYER_CHECKS) {
    const full = path.join(ROOT, check.apiPath);
    if (!fs.existsSync(full)) {
      findings.push({
        id: `boundary_missing_${check.layer}`,
        layer: check.layer,
        issue: "API route missing",
        severity: "fail",
        detail: check.apiPath,
      });
      continue;
    }
    const src = fs.readFileSync(full, "utf8");
    const hasAuth =
      src.includes("getPortalUserContext") ||
      src.includes("authenticateRequest") ||
      src.includes("runApiProtection") ||
      src.includes("runSaasApiGate") ||
      src.includes("withPortalRoute");
    const hasOrgFilter = check.mustFilterOrg.every((token) => src.includes(token));

    findings.push({
      id: `boundary_${check.layer}`,
      layer: check.layer,
      issue: hasAuth && hasOrgFilter ? "Organization scoping present" : "Potential cross-org access",
      severity: hasAuth && hasOrgFilter ? "pass" : "fail",
      detail: `${check.apiPath} auth=${hasAuth} orgFilter=${hasOrgFilter}`,
    });
  }

  const aggregator = path.join(ROOT, "lib/portal/v58/documents/documents.aggregator.ts");
  if (fs.existsSync(aggregator)) {
    const src = fs.readFileSync(aggregator, "utf8");
    const scoped = src.includes("where: { organizationId") || src.includes("organizationId");
    findings.push({
      id: "boundary_document_aggregator",
      layer: "Document",
      issue: scoped ? "Aggregator filters by organization" : "Review org filter",
      severity: scoped ? "pass" : "warn",
      detail: "documents.aggregator.ts",
    });
  }

  const failCount = findings.filter((f) => f.severity === "fail").length;
  const warnCount = findings.filter((f) => f.severity === "warn").length;
  const score = Math.max(0, 100 - failCount * 20 - warnCount * 8);

  return {
    findings,
    crossOrgRisk: failCount > 0,
    score,
  };
}
