/**
 * V66 P1 — Environment variable inventory (declarative catalog)
 */

export type EnvCategory =
  | "database"
  | "auth-security"
  | "billing"
  | "cache"
  | "deployment"
  | "feature-dev-only"
  | "admin-ops"
  | "ai-limits"
  | "staging-e2e";

export type EnvScope = "server" | "client" | "build";

export type EnvVarContract = {
  key: string;
  category: EnvCategory;
  scope: EnvScope;
  requiredIn: Array<"production" | "staging" | "development">;
  secret: boolean;
  forbiddenInProduction?: boolean;
  description: string;
};

export const ENV_VAR_INVENTORY: EnvVarContract[] = [
  {
    key: "DATABASE_URL",
    category: "database",
    scope: "server",
    requiredIn: ["production", "staging"],
    secret: true,
    description: "Pooled PostgreSQL URL (Prisma runtime, pgbouncer)",
  },
  {
    key: "DIRECT_URL",
    category: "database",
    scope: "server",
    requiredIn: ["production", "staging"],
    secret: true,
    description: "Direct PostgreSQL URL for migrate/deploy",
  },
  {
    key: "PRISMA_USE_DIRECT_URL",
    category: "database",
    scope: "server",
    requiredIn: [],
    secret: false,
    description: "Force direct URL when pooler unavailable",
  },
  {
    key: "NODE_ENV",
    category: "deployment",
    scope: "server",
    requiredIn: ["production", "staging", "development"],
    secret: false,
    description: "Node runtime mode",
  },
  {
    key: "APP_ENV",
    category: "deployment",
    scope: "server",
    requiredIn: [],
    secret: false,
    description: "Application deployment tier override",
  },
  {
    key: "NEXT_PUBLIC_APP_URL",
    category: "deployment",
    scope: "client",
    requiredIn: ["production"],
    secret: false,
    description: "Public app origin for billing redirects",
  },
  {
    key: "DOWNLOAD_TOKEN_SECRET",
    category: "auth-security",
    scope: "server",
    requiredIn: ["production", "staging"],
    secret: true,
    description: "HMAC secret for PDF/download tokens (32+ chars)",
  },
  {
    key: "JWT_SECRET",
    category: "auth-security",
    scope: "server",
    requiredIn: ["production", "staging"],
    secret: true,
    description: "JWT signing secret (32+ chars)",
  },
  {
    key: "SESSION_SECRET",
    category: "auth-security",
    scope: "server",
    requiredIn: ["production"],
    secret: true,
    description: "Session encryption secret",
  },
  {
    key: "UNLOCK_TOKEN_SECRET",
    category: "auth-security",
    scope: "server",
    requiredIn: [],
    secret: true,
    description: "Unlock token HMAC secret",
  },
  {
    key: "STRIPE_SECRET_KEY",
    category: "billing",
    scope: "server",
    requiredIn: ["production"],
    secret: true,
    description: "Stripe API secret key",
  },
  {
    key: "STRIPE_WEBHOOK_SECRET",
    category: "billing",
    scope: "server",
    requiredIn: ["production"],
    secret: true,
    description: "Stripe webhook signing secret",
  },
  {
    key: "ENABLE_COMMERCIAL_REGISTER",
    category: "billing",
    scope: "server",
    requiredIn: ["production"],
    secret: false,
    description: "Enable commercial registration in production",
  },
  {
    key: "REDIS_URL",
    category: "cache",
    scope: "server",
    requiredIn: [],
    secret: true,
    description: "Redis connection URL",
  },
  {
    key: "UPSTASH_REDIS_URL",
    category: "cache",
    scope: "server",
    requiredIn: [],
    secret: true,
    description: "Upstash Redis fallback URL",
  },
  {
    key: "NEXT_PUBLIC_ENABLE_MOCK_AUTH",
    category: "feature-dev-only",
    scope: "client",
    requiredIn: [],
    secret: false,
    forbiddenInProduction: true,
    description: "Mock auth — must never be set in production",
  },
  {
    key: "ENABLE_MOCK_AUTH",
    category: "feature-dev-only",
    scope: "server",
    requiredIn: [],
    secret: false,
    forbiddenInProduction: true,
    description: "Server mock auth — must never be set in production",
  },
  {
    key: "DEV_ZIP_ALLOW_ALL",
    category: "feature-dev-only",
    scope: "server",
    requiredIn: [],
    secret: false,
    forbiddenInProduction: true,
    description: "Bypass ZIP paywall — dev/staging only",
  },
  {
    key: "DEV_ZIP_DEFAULT_ALLOW",
    category: "feature-dev-only",
    scope: "server",
    requiredIn: [],
    secret: false,
    forbiddenInProduction: true,
    description: "Default ZIP allow in dev — disable in production",
  },
  {
    key: "ALLOW_DEBUG_API",
    category: "feature-dev-only",
    scope: "server",
    requiredIn: [],
    secret: false,
    forbiddenInProduction: true,
    description: "Expose debug API routes — never in production",
  },
  {
    key: "ENTITLEMENT_DB_FALLBACK",
    category: "feature-dev-only",
    scope: "server",
    requiredIn: [],
    secret: false,
    forbiddenInProduction: true,
    description: "Dev entitlement fallback when DB unavailable",
  },
  {
    key: "ADMIN_API_KEY",
    category: "admin-ops",
    scope: "server",
    requiredIn: [],
    secret: true,
    description: "Admin API authentication key",
  },
  {
    key: "ADMIN_EMAILS",
    category: "admin-ops",
    scope: "server",
    requiredIn: [],
    secret: false,
    description: "Comma-separated admin email allowlist",
  },
  {
    key: "AI_DAILY_COST_LIMIT_USD",
    category: "ai-limits",
    scope: "server",
    requiredIn: [],
    secret: false,
    description: "Daily AI spend cap (USD)",
  },
  {
    key: "AI_MONTHLY_COST_LIMIT_USD",
    category: "ai-limits",
    scope: "server",
    requiredIn: [],
    secret: false,
    description: "Monthly AI spend cap (USD)",
  },
  {
    key: "LAUNCH_CLOSURE_EVAL",
    category: "staging-e2e",
    scope: "server",
    requiredIn: [],
    secret: false,
    description: "Strict launch blocker evaluation (staging)",
  },
  {
    key: "STAGING_BASE_URL",
    category: "staging-e2e",
    scope: "build",
    requiredIn: [],
    secret: false,
    description: "Staging verification base URL",
  },
  {
    key: "E2E_BASE_URL",
    category: "staging-e2e",
    scope: "build",
    requiredIn: [],
    secret: false,
    description: "E2E test base URL",
  },
];
