/**
 * V66 P1 — Runtime config surface (declarative catalog, read-only)
 */
export const V66_RUNTIME_CONFIG_SURFACE_VERSION = "v66-runtime-config-surface-1" as const;

export type RuntimeConfigNamespace =
  | "database"
  | "auth"
  | "billing"
  | "cache"
  | "deployment"
  | "commercial-frozen"
  | "ops-verify";

export type RuntimeConfigSource = "env" | "package-script" | "frozen-layer";

export type RuntimeConfigEntry = {
  key: string;
  namespace: RuntimeConfigNamespace;
  source: RuntimeConfigSource;
  readOnly: boolean;
  envKeys?: string[];
  description: string;
};

export type RuntimeConfigSurfaceManifest = {
  version: typeof V66_RUNTIME_CONFIG_SURFACE_VERSION;
  entryCount: number;
  namespaceCount: number;
  entries: RuntimeConfigEntry[];
  surfaceComplete: boolean;
  summary: string;
};

export const RUNTIME_CONFIG_SURFACE: RuntimeConfigEntry[] = [
  {
    key: "database.connection",
    namespace: "database",
    source: "env",
    readOnly: false,
    envKeys: ["DATABASE_URL", "DIRECT_URL", "PRISMA_USE_DIRECT_URL"],
    description: "Prisma database resolution (pooler + direct fallback)",
  },
  {
    key: "auth.tokens",
    namespace: "auth",
    source: "env",
    readOnly: false,
    envKeys: ["JWT_SECRET", "SESSION_SECRET", "DOWNLOAD_TOKEN_SECRET", "UNLOCK_TOKEN_SECRET"],
    description: "Token and session signing secrets",
  },
  {
    key: "billing.stripe",
    namespace: "billing",
    source: "env",
    readOnly: false,
    envKeys: ["STRIPE_SECRET_KEY", "STRIPE_WEBHOOK_SECRET", "ENABLE_COMMERCIAL_REGISTER"],
    description: "Stripe checkout and webhook configuration",
  },
  {
    key: "cache.redis",
    namespace: "cache",
    source: "env",
    readOnly: false,
    envKeys: ["REDIS_URL", "UPSTASH_REDIS_URL", "KV_URL"],
    description: "Optional Redis/KV backing store",
  },
  {
    key: "deployment.tier",
    namespace: "deployment",
    source: "env",
    readOnly: false,
    envKeys: ["NODE_ENV", "APP_ENV", "NEXT_PUBLIC_APP_URL"],
    description: "Deployment tier and public origin",
  },
  {
    key: "commercial.v64-freeze",
    namespace: "commercial-frozen",
    source: "frozen-layer",
    readOnly: true,
    description: "V64 commercial layer (frozen) — plan matrix, pricing, capability",
  },
  {
    key: "production.v65-signoff",
    namespace: "commercial-frozen",
    source: "frozen-layer",
    readOnly: true,
    description: "V65 production readiness sign-off (frozen)",
  },
  {
    key: "build.pipeline",
    namespace: "ops-verify",
    source: "package-script",
    readOnly: true,
    description: "Build chain: prisma:preflight → diff → migration-safety → next build",
  },
  {
    key: "verify.v65-production",
    namespace: "ops-verify",
    source: "package-script",
    readOnly: true,
    description: "npm run verify:v65-production",
  },
  {
    key: "verify.v66-deployment",
    namespace: "ops-verify",
    source: "package-script",
    readOnly: true,
    description: "npm run verify:v66-deployment",
  },
];

export function buildRuntimeConfigSurfaceManifest(): RuntimeConfigSurfaceManifest {
  const entries = RUNTIME_CONFIG_SURFACE;
  const namespaces = new Set(entries.map((e) => e.namespace));
  const surfaceComplete = entries.length >= 8 && namespaces.size >= 5;

  return {
    version: V66_RUNTIME_CONFIG_SURFACE_VERSION,
    entryCount: entries.length,
    namespaceCount: namespaces.size,
    entries,
    surfaceComplete,
    summary: [
      `runtime-surface entries=${entries.length}`,
      `namespaces=${namespaces.size}`,
      `complete=${surfaceComplete}`,
    ].join(" "),
  };
}

export function getRuntimeConfigByNamespace(
  namespace: RuntimeConfigNamespace,
): RuntimeConfigEntry[] {
  return RUNTIME_CONFIG_SURFACE.filter((e) => e.namespace === namespace);
}
