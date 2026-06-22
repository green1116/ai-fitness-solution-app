/**
 * Prisma Stability V3 — PrismaClient health guard
 */

import type { PrismaClient } from "@prisma/client";
import { isClientGenerated } from "../generate/client.sync.guard";
import { runSchemaGuard } from "../core/schema.guard";

export type ClientGuardResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
};

export function guardPrismaClient(client: PrismaClient): ClientGuardResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!isClientGenerated()) {
    errors.push("Prisma client not generated — run npm run prisma:generate");
  }

  const guard = runSchemaGuard();
  if (!guard.ok) {
    errors.push(...guard.errors.map((e) => `schema: ${e}`));
  }

  if (typeof client.$connect !== "function") {
    errors.push("Invalid PrismaClient instance");
  }

  if (process.env.NODE_ENV === "production" && process.env.DATABASE_URL === undefined) {
    warnings.push("DATABASE_URL not set in production");
  }

  return { ok: errors.length === 0, errors, warnings };
}

export async function pingPrismaClient(client: PrismaClient): Promise<boolean> {
  try {
    await client.$queryRaw`SELECT 1`;
    return true;
  } catch {
    return false;
  }
}
