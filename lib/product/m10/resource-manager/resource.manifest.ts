/**
 * Product M10 — AI Resource Manager manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AI_SCHEDULER_ID } from "../scheduler/scheduler.constants";
import {
  clearAiResourceScheduleBindings,
  listAiResourceScheduleBindings,
} from "./binding.registry";
import {
  clearAiResourceQuotas,
  listAiResourceQuotas,
} from "./quota.registry";
import {
  PRODUCT_AI_RESOURCE_MANAGER_BASE,
  PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION,
  PRODUCT_AI_RESOURCE_MANAGER_ID,
  PRODUCT_AI_RESOURCE_MANAGER_VERSION,
} from "./resource.constants";
import { getAiResourceManagerMetadata } from "./resource.metadata";
import { clearAiResources, listAiResources } from "./resource.registry";
import type {
  AiResourceManagerManifest,
  AiResourceReadinessCheck,
  AiResourceReadinessResult,
} from "./resource.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AiResourceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAiResourceManagerLayer(): void {
  clearAiResourceScheduleBindings();
  clearAiResourceQuotas();
  clearAiResources();
}

export function buildAiResourceManagerManifest(): AiResourceManagerManifest {
  const resources = listAiResources();
  const quotas = listAiResourceQuotas();
  const bindings = listAiResourceScheduleBindings();
  const metadata = getAiResourceManagerMetadata();

  const payload = {
    resourceManagerId: PRODUCT_AI_RESOURCE_MANAGER_ID,
    version: PRODUCT_AI_RESOURCE_MANAGER_VERSION,
    freezeVersion: PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION,
    base: PRODUCT_AI_RESOURCE_MANAGER_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    resources: resources.map((r) => ({
      resourceKey: r.resourceKey,
      kind: r.kind,
      status: r.status,
      unit: r.unit,
    })),
    quotas: quotas.map((q) => ({
      quotaKey: q.quotaKey,
      limit: q.limit,
      status: q.status,
      resourceId: q.resourceId,
    })),
    bindings: bindings.map((b) => ({
      bindingKey: b.bindingKey,
      scheduleKeyRef: b.scheduleKeyRef,
      status: b.status,
      resourceId: b.resourceId,
    })),
  };

  return {
    resourceManagerId: PRODUCT_AI_RESOURCE_MANAGER_ID,
    version: PRODUCT_AI_RESOURCE_MANAGER_VERSION,
    freezeVersion: PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION,
    base: PRODUCT_AI_RESOURCE_MANAGER_BASE,
    resourceCount: resources.length,
    quotaCount: quotas.length,
    bindingCount: bindings.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAiResourceManagerReadiness(): AiResourceReadinessResult {
  const checks: AiResourceReadinessCheck[] = [];
  const metadata = getAiResourceManagerMetadata();
  const resources = listAiResources();
  const quotas = listAiResourceQuotas();
  const bindings = listAiResourceScheduleBindings();
  const manifest = buildAiResourceManagerManifest();

  checks.push(
    check(
      "AIRM-BASE",
      "resource-manager",
      "ai scheduler base aligned",
      PRODUCT_AI_RESOURCE_MANAGER_BASE === PRODUCT_AI_SCHEDULER_ID &&
        PRODUCT_AI_SCHEDULER_ID === "enterprise-product-ai-scheduler-v1",
      `base=${PRODUCT_AI_RESOURCE_MANAGER_BASE}`,
    ),
  );

  checks.push(
    check(
      "AIRM-META",
      "metadata",
      "Resource manager metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 7,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "AIRM-REG",
      "resource",
      "Active resource definitions present",
      resources.some((r) => r.status === "ACTIVE"),
      `resources=${resources.length}`,
    ),
  );

  checks.push(
    check(
      "AIRM-QUOTA",
      "quota",
      "Declared resource quotas present",
      quotas.some((q) => q.status === "DECLARED"),
      `quotas=${quotas.length}`,
    ),
  );

  checks.push(
    check(
      "AIRM-BIND",
      "binding",
      "Bound schedule refs present",
      bindings.some((b) => b.status === "BOUND"),
      `bindings=${bindings.length}`,
    ),
  );

  checks.push(
    check(
      "AIRM-MAN",
      "manifest",
      "Resource manager manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.resourceManagerId === PRODUCT_AI_RESOURCE_MANAGER_ID &&
        manifest.resourceCount >= 1 &&
        manifest.quotaCount >= 1 &&
        manifest.bindingCount >= 1,
      `checksum=${manifest.checksum.slice(0, 12)}…`,
    ),
  );

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const verdict =
    failCount === 0 ? "READY" : passCount === 0 ? "NOT_READY" : "BLOCKED";

  return {
    verdict,
    passCount,
    failCount,
    checks,
    summary: `product-ai-resource-manager readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAiResourceManagerReadinessReady(
  result: AiResourceReadinessResult,
): asserts result is AiResourceReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product ai resource manager not ready: ${result.summary}`,
    );
  }
}
