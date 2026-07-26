/**
 * Product M09 — AI Orchestration manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AI_WORKFLOW_ENGINE_ID } from "../workflow-engine/workflow.constants";
import {
  PRODUCT_AI_ORCHESTRATION_BASE,
  PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION,
  PRODUCT_AI_ORCHESTRATION_ID,
  PRODUCT_AI_ORCHESTRATION_VERSION,
} from "./orchestration.constants";
import { getAiOrchestrationMetadata } from "./orchestration.metadata";
import {
  clearAiOrchestrations,
  listAiOrchestrations,
} from "./orchestration.registry";
import type {
  AiOrchestrationManifest,
  AiOrchestrationReadinessCheck,
  AiOrchestrationReadinessResult,
} from "./orchestration.types";
import {
  clearAiOrchestrationRoutes,
  listAiOrchestrationRoutes,
} from "./route.registry";
import {
  clearAiOrchestrationVersions,
  listAiOrchestrationVersions,
} from "./version.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AiOrchestrationReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAiOrchestrationLayer(): void {
  clearAiOrchestrationRoutes();
  clearAiOrchestrationVersions();
  clearAiOrchestrations();
}

export function buildAiOrchestrationManifest(): AiOrchestrationManifest {
  const plans = listAiOrchestrations();
  const versions = listAiOrchestrationVersions();
  const routes = listAiOrchestrationRoutes();
  const metadata = getAiOrchestrationMetadata();

  const payload = {
    orchestrationId: PRODUCT_AI_ORCHESTRATION_ID,
    version: PRODUCT_AI_ORCHESTRATION_VERSION,
    freezeVersion: PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION,
    base: PRODUCT_AI_ORCHESTRATION_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    plans: plans.map((p) => ({
      orchestrationKey: p.orchestrationKey,
      kind: p.kind,
      status: p.status,
    })),
    versions: versions.map((v) => ({
      versionKey: v.versionKey,
      semver: v.semver,
      status: v.status,
      orchestrationId: v.orchestrationId,
    })),
    routes: routes.map((r) => ({
      routeKey: r.routeKey,
      kind: r.kind,
      order: r.order,
      workflowKeyRef: r.workflowKeyRef,
      promptKeyRef: r.promptKeyRef,
      modelKeyRef: r.modelKeyRef,
      versionId: r.versionId,
    })),
  };

  return {
    orchestrationId: PRODUCT_AI_ORCHESTRATION_ID,
    version: PRODUCT_AI_ORCHESTRATION_VERSION,
    freezeVersion: PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION,
    base: PRODUCT_AI_ORCHESTRATION_BASE,
    planCount: plans.length,
    versionCount: versions.length,
    routeCount: routes.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAiOrchestrationReadiness(): AiOrchestrationReadinessResult {
  const checks: AiOrchestrationReadinessCheck[] = [];
  const metadata = getAiOrchestrationMetadata();
  const plans = listAiOrchestrations();
  const versions = listAiOrchestrationVersions();
  const routes = listAiOrchestrationRoutes();
  const manifest = buildAiOrchestrationManifest();

  checks.push(
    check(
      "ORCH-BASE",
      "orchestration",
      "ai workflow engine base aligned",
      PRODUCT_AI_ORCHESTRATION_BASE === PRODUCT_AI_WORKFLOW_ENGINE_ID &&
        PRODUCT_AI_WORKFLOW_ENGINE_ID ===
          "enterprise-product-ai-workflow-engine-v1",
      `base=${PRODUCT_AI_ORCHESTRATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "ORCH-META",
      "metadata",
      "Orchestration metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 5,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "ORCH-PLAN",
      "plan",
      "Active orchestration plans present",
      plans.some((p) => p.status === "ACTIVE"),
      `plans=${plans.length}`,
    ),
  );

  checks.push(
    check(
      "ORCH-VER",
      "version",
      "Published versions present",
      versions.some((v) => v.status === "PUBLISHED"),
      `versions=${versions.length}`,
    ),
  );

  checks.push(
    check(
      "ORCH-ROUTE",
      "route",
      "Orchestration routes present",
      routes.length >= 1,
      `routes=${routes.length}`,
    ),
  );

  checks.push(
    check(
      "ORCH-MAN",
      "manifest",
      "Orchestration manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.orchestrationId === PRODUCT_AI_ORCHESTRATION_ID &&
        manifest.planCount >= 1 &&
        manifest.versionCount >= 1 &&
        manifest.routeCount >= 1,
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
    summary: `product-ai-orchestration readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAiOrchestrationReadinessReady(
  result: AiOrchestrationReadinessResult,
): asserts result is AiOrchestrationReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product ai orchestration not ready: ${result.summary}`,
    );
  }
}
