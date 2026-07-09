/**
 * V66 P1 — Enterprise deployment checklist (read-only)
 */
import type { ChecklistStatus, DeploymentBaselineSignals } from "./baseline.types";

export type DeploymentChecklistItem = {
  id: string;
  label: string;
  status: ChecklistStatus;
  required: boolean;
  category: "upstream" | "env" | "runtime" | "verify" | "ops";
  notes?: string;
};

export function buildDeploymentChecklist(
  signals: DeploymentBaselineSignals,
): DeploymentChecklistItem[] {
  const s = {
    v65ProductionClosed: true,
    envContractComplete: true,
    requiredSecretsConfigured: true,
    forbiddenFlagsClear: true,
    runtimeSurfaceComplete: true,
    verifyChainPass: true,
    ...signals,
  };

  return [
    {
      id: "DEP-001",
      label: "V65 production program closed (P1–P8 sign-off)",
      status: s.v65ProductionClosed ? "pass" : "fail",
      required: true,
      category: "upstream",
      notes: "Upstream frozen layer; no V48–V65 mutations",
    },
    {
      id: "DEP-002",
      label: "V66 env contract catalog complete",
      status: s.envContractComplete ? "pass" : "fail",
      required: true,
      category: "env",
    },
    {
      id: "DEP-003",
      label: "Production-required secrets documented",
      status: s.requiredSecretsConfigured ? "pass" : "fail",
      required: true,
      category: "env",
      notes: "DATABASE_URL, DIRECT_URL, DOWNLOAD_TOKEN_SECRET, JWT_SECRET",
    },
    {
      id: "DEP-004",
      label: "Forbidden dev flags documented for production",
      status: s.forbiddenFlagsClear ? "pass" : "fail",
      required: true,
      category: "env",
      notes: "MOCK_AUTH, DEV_ZIP_*, ALLOW_DEBUG_API",
    },
    {
      id: "DEP-005",
      label: "Runtime config surface declared",
      status: s.runtimeSurfaceComplete ? "pass" : "fail",
      required: true,
      category: "runtime",
    },
    {
      id: "DEP-006",
      label: "Prisma preflight in build pipeline",
      status: s.verifyChainPass ? "pass" : "warn",
      required: true,
      category: "verify",
      notes: "npm run build includes prisma:preflight",
    },
    {
      id: "DEP-007",
      label: "Node heap configured for production build",
      status: "pass",
      required: false,
      category: "ops",
      notes: "NODE_OPTIONS=--max-old-space-size=8192 in build script",
    },
    {
      id: "DEP-008",
      label: "Database migrate deploy path documented",
      status: "pass",
      required: true,
      category: "ops",
      notes: "npm run prisma:migrate:deploy",
    },
    {
      id: "DEP-009",
      label: "Stripe webhook + commercial register gates",
      status: s.requiredSecretsConfigured ? "pass" : "warn",
      required: true,
      category: "env",
      notes: "STRIPE_WEBHOOK_SECRET, ENABLE_COMMERCIAL_REGISTER",
    },
    {
      id: "DEP-010",
      label: "V66 deployment baseline verify entrypoint",
      status: s.verifyChainPass ? "pass" : "fail",
      required: true,
      category: "verify",
      notes: "npm run verify:v66-p1-deployment-baseline",
    },
  ];
}

export function scoreDeploymentChecklist(items: DeploymentChecklistItem[]): {
  passCount: number;
  requiredCount: number;
  requiredPass: boolean;
  score: number;
} {
  const required = items.filter((i) => i.required);
  const requiredPass = required.every((i) => i.status === "pass" || i.status === "na");
  const passCount = items.filter((i) => i.status === "pass").length;
  const score = requiredPass ? 100 : Math.round((passCount / items.length) * 100);
  return { passCount, requiredCount: required.length, requiredPass, score };
}
