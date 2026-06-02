import { PrismaClient } from "@prisma/client";
import { describeDatabaseUrl, resolveDatabaseUrl } from "@/lib/db/resolveDatabaseUrl";

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var prismaDatasource: ReturnType<typeof describeDatabaseUrl> | undefined;
}

function createClient() {
  const resolved = resolveDatabaseUrl();
  const devLogQueries = process.env.PRISMA_LOG_QUERIES === "1";

  if (process.env.NODE_ENV !== "production") {
    const desc = describeDatabaseUrl(resolved);
    global.prismaDatasource = desc;
    console.info("[prisma] using datasource", desc);
  }

  return new PrismaClient({
    datasources: {
      db: {
        url: resolved.url,
      },
    },
    log:
      process.env.NODE_ENV === "development"
        ? devLogQueries
          ? (["query", "error", "warn"] as const)
          : (["error", "warn"] as const)
        : (["error"] as const),
  });
}

/** dev 热更新后 global 上可能仍是旧 PrismaClient，缺少新 model 的 delegate */
function isStaleDevClient(client: PrismaClient): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return typeof (client as { upgradeOrder?: unknown }).upgradeOrder !== "object";
}

let cached = global.prisma;
if (cached && isStaleDevClient(cached)) {
  void cached.$disconnect().catch(() => {});
  cached = undefined;
  global.prisma = undefined;
}

export const prisma = cached ?? createClient();

if (process.env.NODE_ENV !== "production") {
  global.prisma = prisma;
}

/** 启动后可选探测（dev）；失败只打日志，不抛 */
export async function pingPrisma(): Promise<boolean> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return true;
  } catch (e) {
    console.error("[prisma] ping failed", e);
    return false;
  }
}
