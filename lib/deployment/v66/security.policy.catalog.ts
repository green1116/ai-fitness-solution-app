/**
 * V66 P5 — Security policy catalog (declarative inventory)
 */
import type { SecurityPolicyDefinition, SecurityPolicyManifest } from "./security.types";
import { V66_DEPLOYMENT_SECURITY_VERSION } from "./security.types";

export const SECURITY_POLICY_CATALOG: SecurityPolicyDefinition[] = [
  {
    id: "SP-001",
    label: "Secrets must not be committed to repository",
    category: "secrets",
    severity: "critical",
    required: true,
    control: ".env / .env.local gitignored; .env.example uses placeholders",
  },
  {
    id: "SP-002",
    label: "Production-required secrets documented in env contract",
    category: "secrets",
    severity: "critical",
    required: true,
    control: "lib/deployment/v66/env.contract.ts",
    notes: "DATABASE_URL, JWT_SECRET, DOWNLOAD_TOKEN_SECRET",
  },
  {
    id: "SP-003",
    label: "Forbidden dev auth flags blocked in production",
    category: "auth",
    severity: "critical",
    required: true,
    control: "ENABLE_MOCK_AUTH, NEXT_PUBLIC_ENABLE_MOCK_AUTH forbiddenInProduction",
  },
  {
    id: "SP-004",
    label: "Token secrets minimum length policy (32+ chars)",
    category: "secrets",
    severity: "high",
    required: true,
    control: "v92:env-audit placeholder and length checks",
    notes: "Declarative reference; no runtime enforcement in V66 P5",
  },
  {
    id: "SP-005",
    label: "Stripe webhook secret required for production billing",
    category: "network",
    severity: "high",
    required: true,
    control: "STRIPE_WEBHOOK_SECRET in env contract",
  },
  {
    id: "SP-006",
    label: "Debug API routes forbidden in production",
    category: "network",
    severity: "high",
    required: true,
    control: "ALLOW_DEBUG_API forbiddenInProduction",
  },
  {
    id: "SP-007",
    label: "Upstream V48–V65 frozen layers unmodified",
    category: "upstream",
    severity: "critical",
    required: true,
    control: "lib/deployment/v66/baseline.lock.ts version references",
  },
  {
    id: "SP-008",
    label: "V66 layer is declarative only — no Prisma mutation",
    category: "integrity",
    severity: "critical",
    required: true,
    control: "No prisma/schema changes in V66 deployment modules",
  },
  {
    id: "SP-009",
    label: "Package lockfile integrity for reproducible deploys",
    category: "integrity",
    severity: "high",
    required: true,
    control: "package-lock.json presence gate",
  },
  {
    id: "SP-010",
    label: "Admin API keys must not use dev defaults in production",
    category: "auth",
    severity: "medium",
    required: false,
    control: "ADMIN_API_KEY documented; dev_admin_key dev-only",
    notes: "Declarative policy only",
  },
  {
    id: "SP-011",
    label: "Deployment verify chain before production rollout",
    category: "compliance",
    severity: "critical",
    required: true,
    control: "npm run verify:v66-deployment",
  },
  {
    id: "SP-012",
    label: "Rollback guard armed before release orchestration",
    category: "compliance",
    severity: "high",
    required: true,
    control: "lib/deployment/v66/rollback.guard.ts",
  },
];

export function buildSecurityPolicyManifest(): SecurityPolicyManifest {
  const policies = SECURITY_POLICY_CATALOG;
  const categories = new Set(policies.map((p) => p.category));
  const catalogComplete = policies.length >= 10 && categories.size >= 5;

  return {
    version: V66_DEPLOYMENT_SECURITY_VERSION,
    policyCount: policies.length,
    categoryCount: categories.size,
    catalogComplete,
    policies,
    summary: [
      `security-policies count=${policies.length}`,
      `categories=${categories.size}`,
      `complete=${catalogComplete}`,
    ].join(" "),
  };
}
