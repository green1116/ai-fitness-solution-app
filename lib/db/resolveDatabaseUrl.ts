/**
 * 解析 Prisma 运行时使用的 PostgreSQL URL（Supabase pooler / direct）。
 *
 * Supabase 约定：
 * - DATABASE_URL：Transaction pooler，端口通常 6543，Prisma 需 `?pgbouncer=true`
 * - DIRECT_URL：Session / 直连，端口通常 5432，用于 migrate 与 pooler 不可用时 fallback
 */
export type DatabaseUrlSource = "DATABASE_URL" | "DIRECT_URL";

export type ResolvedDatabaseUrl = {
  url: string;
  source: DatabaseUrlSource;
  /** 是否为 Supabase transaction pooler（6543） */
  isPooler: boolean;
};

function cleanEnvUrl(raw: string | undefined): string {
  return String(raw ?? "")
    .trim()
    .replace(/^["']|["']$/g, "")
    .replace(/\r?\n/g, "");
}

function parseHostPort(url: string): { host: string; port: string } | null {
  try {
    const u = new URL(url);
    return {
      host: u.hostname,
      port: u.port || "5432",
    };
  } catch {
    return null;
  }
}

/** Supabase pooler + Prisma 需要 pgbouncer 参数，否则易出现连接/ prepared statement 问题 */
function ensurePoolerParams(url: string): string {
  const hp = parseHostPort(url);
  const isPooler =
    hp?.port === "6543" || url.includes("pooler.supabase.com");
  if (!isPooler) return url;

  const u = new URL(url);
  if (!u.searchParams.has("pgbouncer")) {
    u.searchParams.set("pgbouncer", "true");
  }
  if (!u.searchParams.has("connection_limit")) {
    u.searchParams.set("connection_limit", "1");
  }
  return u.toString();
}

/**
 * 选择运行时连接串。
 * - 默认 DATABASE_URL（规范化 pooler 参数）
 * - `PRISMA_USE_DIRECT_URL=1` 或 `DATABASE_USE_DIRECT=1` 时强制 DIRECT_URL
 * - dev 且未配置 DATABASE_URL 时回退 DIRECT_URL
 */
export function resolveDatabaseUrl(): ResolvedDatabaseUrl {
  const direct = cleanEnvUrl(process.env.DIRECT_URL);
  const pooled = cleanEnvUrl(process.env.DATABASE_URL);

  const forceDirect =
    process.env.PRISMA_USE_DIRECT_URL === "1" ||
    process.env.DATABASE_USE_DIRECT === "1";

  if (forceDirect && direct) {
    return {
      url: direct,
      source: "DIRECT_URL",
      isPooler: false,
    };
  }

  if (pooled) {
    const normalized = ensurePoolerParams(pooled);
    const hp = parseHostPort(normalized);
    return {
      url: normalized,
      source: "DATABASE_URL",
      isPooler: hp?.port === "6543" || normalized.includes("pooler.supabase.com"),
    };
  }

  if (direct) {
    return {
      url: direct,
      source: "DIRECT_URL",
      isPooler: false,
    };
  }

  throw new Error(
    "缺少 DATABASE_URL 或 DIRECT_URL：请在 .env / .env.local 中配置 Supabase 连接串",
  );
}

/** 供日志使用：不输出密码 */
export function describeDatabaseUrl(resolved: ResolvedDatabaseUrl): Record<string, string | boolean> {
  const hp = parseHostPort(resolved.url);
  return {
    source: resolved.source,
    host: hp?.host ?? "unknown",
    port: hp?.port ?? "unknown",
    isPooler: resolved.isPooler,
  };
}
