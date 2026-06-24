/**
 * V61.1 P4 — Commercial registration enablement validation
 */

import fs from "node:fs";
import path from "node:path";

export type CommercialRegistrationStep = {
  step: string;
  status: "pass" | "fail";
  detail: string;
};

export type CommercialRegistrationReport = {
  enabled: boolean;
  steps: CommercialRegistrationStep[];
  flowComplete: boolean;
  score: number;
  blockers: string[];
  evaluatedAt: string;
};

const ROOT = path.resolve(process.cwd());

function exists(rel: string): boolean {
  return fs.existsSync(path.join(ROOT, rel));
}

function isProductionEval(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.LAUNCH_CLOSURE_EVAL === "1"
  );
}

export function validateCommercialRegistration(): CommercialRegistrationReport {
  const blockers: string[] = [];
  const prodEval = isProductionEval();
  const enabled =
    process.env.NODE_ENV !== "production" ||
    process.env.ENABLE_COMMERCIAL_REGISTER === "1";

  if (prodEval && !enabled) {
    blockers.push("B2: ENABLE_COMMERCIAL_REGISTER=1 required for production launch");
  }

  const registerRoute = fs.readFileSync(
    path.join(ROOT, "app/api/register/route.ts"),
    "utf8",
  );
  const flagGuarded = registerRoute.includes("ENABLE_COMMERCIAL_REGISTER");

  const steps: CommercialRegistrationStep[] = [
    {
      step: "Register API",
      status: exists("app/api/register/route.ts") && flagGuarded ? "pass" : "fail",
      detail: flagGuarded ? "/api/register with commercial flag guard" : "missing guard",
    },
    {
      step: "Organization Service",
      status: exists("lib/organization/organization.service.ts") ? "pass" : "fail",
      detail: "createOrganization + membership",
    },
    {
      step: "Register Completion",
      status: exists("lib/portal/v57/register.service.ts") ? "pass" : "fail",
      detail: "User + Organization + Membership",
    },
    {
      step: "Workspace Entry",
      status: exists("app/(workspace)/layout.tsx") ? "pass" : "fail",
      detail: "post-register workspace shell",
    },
    {
      step: "ENABLE_COMMERCIAL_REGISTER",
      status: enabled ? "pass" : prodEval ? "fail" : "pass",
      detail: enabled
        ? "commercial register enabled"
        : "disabled in production eval",
    },
  ];

  const flowComplete = steps.every((s) => s.status === "pass");
  const failCount = steps.filter((s) => s.status === "fail").length;
  const score = Math.max(0, 100 - failCount * 20);

  return {
    enabled,
    steps,
    flowComplete,
    score,
    blockers: [...new Set(blockers)],
    evaluatedAt: new Date().toISOString(),
  };
}
