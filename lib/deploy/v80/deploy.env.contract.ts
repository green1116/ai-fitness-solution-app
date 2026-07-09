/**
 * V80 DEPLOY P1 — Environment config contract
 */
import type { DeployEnvVar } from "./deploy.types";

export const V80_ENV_CONTRACT: DeployEnvVar[] = [
  {
    key: "NODE_ENV",
    required: true,
    secret: false,
    category: "deployment",
    description: "Must be production at go-live",
  },
  {
    key: "DATABASE_URL",
    required: true,
    secret: true,
    category: "database",
    description: "Pooled Postgres — V80Scaffold persistence",
  },
  {
    key: "DIRECT_URL",
    required: true,
    secret: true,
    category: "database",
    description: "Direct Postgres — migrations + pooler fallback",
  },
  {
    key: "NEXT_PUBLIC_APP_URL",
    required: true,
    secret: false,
    category: "deployment",
    description: "Public origin — PDF download URLs",
  },
  {
    key: "DOWNLOAD_TOKEN_SECRET",
    required: true,
    secret: true,
    category: "security",
    description: "PDF/download token HMAC (32+ chars)",
  },
  {
    key: "JWT_SECRET",
    required: true,
    secret: true,
    category: "security",
    description: "JWT signing secret",
  },
  {
    key: "SESSION_SECRET",
    required: true,
    secret: true,
    category: "security",
    description: "Session encryption",
  },
  {
    key: "V80_DEPLOYMENT_ID",
    required: false,
    secret: false,
    category: "v80",
    description: "Deployment binding id (default: v80-production)",
  },
  {
    key: "V80_WORKER_ENABLED",
    required: false,
    secret: false,
    category: "v80",
    description: "Set 1 to run scripts/v80-worker-start.ts alongside Next.js",
  },
  {
    key: "PRISMA_RUNTIME_GUARD",
    required: false,
    secret: false,
    category: "runtime",
    description: "Default on; set 0 only for local debug",
  },
  {
    key: "ENABLE_MOCK_AUTH",
    required: false,
    secret: false,
    forbiddenInProduction: true,
    category: "security",
    description: "Forbidden in production",
  },
  {
    key: "DEV_ZIP_ALLOW_ALL",
    required: false,
    secret: false,
    forbiddenInProduction: true,
    category: "security",
    description: "Forbidden in production",
  },
  {
    key: "ALLOW_DEBUG_API",
    required: false,
    secret: false,
    forbiddenInProduction: true,
    category: "security",
    description: "Forbidden in production",
  },
  {
    key: "ENTITLEMENT_DB_FALLBACK",
    required: false,
    secret: false,
    forbiddenInProduction: true,
    category: "runtime",
    description: "Dev entitlement fallback — forbidden in production",
  },
];

export function isEnvContractComplete(): boolean {
  const required = V80_ENV_CONTRACT.filter((v) => v.required);
  const forbidden = V80_ENV_CONTRACT.filter((v) => v.forbiddenInProduction);
  return (
    V80_ENV_CONTRACT.length >= 12 &&
    required.some((v) => v.key === "DATABASE_URL") &&
    forbidden.length >= 3
  );
}

export function getRequiredEnvKeys(): string[] {
  return V80_ENV_CONTRACT.filter((v) => v.required).map((v) => v.key);
}

export function getForbiddenProductionEnvKeys(): string[] {
  return V80_ENV_CONTRACT.filter((v) => v.forbiddenInProduction).map((v) => v.key);
}
