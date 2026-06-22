/**
 * Prisma Stability V3 — Prisma error interceptor
 */

const RETRYABLE_CODES = new Set(["P1001", "P1002", "P1008", "P1017", "P2024"]);

export type PrismaErrorClassification = {
  retryable: boolean;
  code?: string;
  message: string;
  panic: boolean;
};

export function classifyPrismaError(err: unknown): PrismaErrorClassification {
  const e = err as { code?: string; message?: string };
  const code = e?.code;
  const message = e?.message ?? String(err);
  const retryable = code ? RETRYABLE_CODES.has(code) : false;
  const panic = code === "P1012" || message.includes("schema");

  if (panic) {
    console.error("[prisma-stability] PANIC — schema/runtime mismatch", { code, message });
  }

  return { retryable, code, message, panic };
}

export async function interceptPrismaErrors<T>(
  operation: string,
  fn: () => Promise<T>,
  options?: { retries?: number; delayMs?: number },
): Promise<T> {
  const retries = options?.retries ?? 2;
  const delayMs = options?.delayMs ?? 300;

  let lastError: unknown;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err;
      const classified = classifyPrismaError(err);

      if (classified.panic) {
        throw new Error(`Prisma panic [${operation}]: ${classified.message}`);
      }

      if (!classified.retryable || attempt === retries) {
        console.error(`[prisma-stability] ${operation} failed`, {
          code: classified.code,
          attempt,
          message: classified.message,
        });
        throw err;
      }

      await new Promise((r) => setTimeout(r, delayMs * (attempt + 1)));
    }
  }

  throw lastError;
}

export function withPrismaErrorIsolation<T>(fn: () => Promise<T>): Promise<T> {
  return interceptPrismaErrors("query", fn);
}
