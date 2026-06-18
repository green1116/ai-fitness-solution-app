import { PrismaClient } from "@prisma/client";
import { describeDatabaseUrl, resolveDatabaseUrl } from "@/lib/db/resolveDatabaseUrl";

type PrismaGlobal = typeof globalThis & {
  prisma?: PrismaClient;
  prismaDatasource?: ReturnType<typeof describeDatabaseUrl>;
  prismaInitCount?: number;
};

const globalForPrisma = globalThis as PrismaGlobal;

declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
  // eslint-disable-next-line no-var
  var prismaDatasource: ReturnType<typeof describeDatabaseUrl> | undefined;
  // eslint-disable-next-line no-var
  var prismaInitCount: number | undefined;
}

function createClient(): PrismaClient {
  const resolved = resolveDatabaseUrl();
  const devLogQueries = process.env.PRISMA_LOG_QUERIES === "1";

  globalForPrisma.prismaInitCount = (globalForPrisma.prismaInitCount ?? 0) + 1;

  if (process.env.NODE_ENV !== "production") {
    const desc = describeDatabaseUrl(resolved);
    globalForPrisma.prismaDatasource = desc;
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

function isStaleDevClient(client: PrismaClient): boolean {
  if (process.env.NODE_ENV === "production") return false;
  return typeof (client as { upgradeOrder?: unknown }).upgradeOrder !== "object";
}

function resolvePrismaClient(): PrismaClient {
  let cached = globalForPrisma.prisma ?? global.prisma;

  if (cached && isStaleDevClient(cached)) {
    void cached.$disconnect().catch(() => {});
    cached = undefined;
    globalForPrisma.prisma = undefined;
    global.prisma = undefined;
  }

  if (!cached) {
    cached = createClient();
    globalForPrisma.prisma = cached;
    global.prisma = cached;
  }

  return cached;
}

export const prisma = resolvePrismaClient();

export function getPrismaInitCount(): number {
  return globalForPrisma.prismaInitCount ?? 0;
}

export function assertPrismaSingleton(): boolean {
  return getPrismaInitCount() <= 1;
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
