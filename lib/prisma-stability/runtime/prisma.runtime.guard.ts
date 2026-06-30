/**
 * Prisma Stability V3 — runtime guard (production entry)
 *
 * Schema file validation is build-time only (prisma:validate, prisma:preflight schema_guard).
 * Server runtime must not read schema.prisma — Next.js bundles lack that path (ENOENT).
 */

import type { PrismaClient } from "@prisma/client";
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

export function installPrismaRuntimeGuard(_client: PrismaClient): void {
  // Runtime install hook disabled — schema/fs checks run at build via preflight & prisma:validate.
  return;
}
