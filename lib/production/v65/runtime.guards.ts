/**
 * V65 P5 — Runtime risk wiring checks (read-only)
 */
import fs from "node:fs";
import path from "node:path";

import type { RuntimeRiskMitigation } from "./runtime.types";
import { RUNTIME_RISK_MITIGATIONS } from "./runtime.mitigations";

const ROOT = path.resolve(__dirname, "../../..");

function readRepoFile(relPath: string): string {
  return fs.readFileSync(path.join(ROOT, relPath), "utf8");
}

function fileExists(relPath: string): boolean {
  return fs.existsSync(path.join(ROOT, relPath));
}

function assessMitigation(item: RuntimeRiskMitigation): RuntimeRiskMitigation {
  switch (item.id) {
    case "RT-001": {
      const orgCompat = fileExists("lib/organization/org.compat.ts");
      const orgService = readRepoFile("lib/organization/organization.service.ts");
      const mitigated =
        orgCompat &&
        orgService.includes("slug") &&
        readRepoFile("lib/organization/org.compat.ts").includes("resolveOrganizationSlug");
      return { ...item, mitigated };
    }
    case "RT-002": {
      const planCompat = fileExists("lib/saas/plan.compat.ts");
      const featureGate = readRepoFile("lib/feature-flags/feature-gate.ts");
      const subscription = readRepoFile("lib/billing/subscription.service.ts");
      const mitigated =
        planCompat &&
        featureGate.includes("normalizeSaasPlan") &&
        subscription.includes("normalizeSaasPlan");
      return { ...item, mitigated };
    }
    case "RT-003": {
      const workspace = readRepoFile("lib/portal/v57/experience/workspace-summary.service.ts");
      const mitigated =
        workspace.includes("resolveOrganizationSlug") &&
        workspace.includes("resolveOrganizationDisplayName");
      return { ...item, mitigated };
    }
    case "RT-004": {
      const invoice = readRepoFile("lib/billing/invoice.service.ts");
      const mitigated = invoice.includes("organizationId: input.organizationId");
      return { ...item, mitigated };
    }
    case "RT-005": {
      const quotes = readRepoFile("app/(documents)/documents/quotes/[quoteId]/page.tsx");
      const mitigated =
        quotes.includes("const latest = data.latest") && quotes.includes("if (!latest) return");
      return { ...item, mitigated };
    }
    default:
      return item;
  }
}

export function assessRuntimeRiskMitigations(): RuntimeRiskMitigation[] {
  return RUNTIME_RISK_MITIGATIONS.map(assessMitigation);
}

export function isRuntimeRiskGatePass(): boolean {
  return assessRuntimeRiskMitigations().every((item) => item.mitigated);
}
