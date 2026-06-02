import { Prisma } from "@prisma/client";

/** Prisma 无法连上数据库（初始化失败、超时、拒绝连接等） */
export function isPrismaConnectionError(err: unknown): boolean {
  if (err instanceof Prisma.PrismaClientInitializationError) return true;

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return err.code === "P1001" || err.code === "P1002" || err.code === "P1017";
  }

  const msg = err instanceof Error ? err.message : String(err);
  return (
    /Can't reach database server/i.test(msg) ||
    /Connection terminated/i.test(msg) ||
    /ECONNREFUSED/i.test(msg) ||
    /ETIMEDOUT/i.test(msg) ||
    /Connection timed out/i.test(msg) ||
    /password authentication failed/i.test(msg) ||
    /PrismaClientInitializationError/i.test(msg)
  );
}

export function formatPrismaErrorForLog(err: unknown): Record<string, unknown> {
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return {
      kind: "PrismaClientInitializationError",
      errorCode: err.errorCode,
      message: err.message,
    };
  }
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    return {
      kind: "PrismaClientKnownRequestError",
      code: err.code,
      message: err.message,
    };
  }
  if (err instanceof Error) {
    return { kind: err.name, message: err.message };
  }
  return { kind: "unknown", message: String(err) };
}
