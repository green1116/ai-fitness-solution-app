/**
 * Prisma Stability V3 — runtime guard (production entry)
 */

import type { PrismaClient } from "@prisma/client";
import { runSchemaGuard } from "../core/schema.guard";
import { guardPrismaClient, pingPrismaClient } from "./prisma.client.guard";

export type RuntimeGuardResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  checks: { name: string; ok: boolean; detail?: string }[];
};

export function guardPrismaRuntime(client?: PrismaClient): RuntimeGuardResult {
  const checks: RuntimeGuardResult["checks"] = [];
  const errors: string[] = [];
  const warnings: string[] = [];

  const guard = runSchemaGuard();
  checks.push({ name: "schema_valid", ok: guard.ok, detail: `${guard.modelCount} models` });
  if (!guard.ok) errors.push(...guard.errors);

  if (client) {
    const clientGuard = guardPrismaClient(client);
    checks.push({ name: "client_instance", ok: clientGuard.ok });
    if (!clientGuard.ok) errors.push(...clientGuard.errors);
    warnings.push(...clientGuard.warnings);
  }

  return { ok: errors.length === 0, errors, warnings, checks };
}

export async function guardPrismaRuntimeWithPing(
  client: PrismaClient,
): Promise<RuntimeGuardResult> {
  const base = guardPrismaRuntime(client);
  if (!base.ok) return base;

  const skipPing = process.env.PRISMA_SKIP_PING === "1" || process.env.NEXT_PHASE === "phase-production-build";
  if (skipPing) {
    return {
      ...base,
      checks: [...base.checks, { name: "db_ping", ok: true, detail: "skipped" }],
    };
  }

  const pingOk = await pingPrismaClient(client);
  const checks = [...base.checks, { name: "db_ping", ok: pingOk, detail: pingOk ? "ok" : "failed" }];
  const errors = pingOk ? base.errors : [...base.errors, "Database ping failed"];
  return { ...base, ok: errors.length === 0, errors, checks };
}

export function installPrismaRuntimeGuard(client: PrismaClient): void {
  if (process.env.PRISMA_RUNTIME_GUARD === "0") return;

  const result = guardPrismaRuntime(client);
  if (!result.ok && process.env.NODE_ENV === "production") {
    console.error("[prisma-stability] Runtime guard failed at startup", result.errors);
  }
}
