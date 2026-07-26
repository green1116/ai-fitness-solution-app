/**
 * Product M09 — AI Workflow Engine manifest builder
 */

import { createHash } from "node:crypto";

import { PRODUCT_AI_PROMPT_ENGINE_ID } from "../prompt-engine/prompt.constants";
import {
  clearAiWorkflowSteps,
  listAiWorkflowSteps,
} from "./step.registry";
import {
  clearAiWorkflowVersions,
  listAiWorkflowVersions,
} from "./version.registry";
import {
  PRODUCT_AI_WORKFLOW_ENGINE_BASE,
  PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION,
  PRODUCT_AI_WORKFLOW_ENGINE_ID,
  PRODUCT_AI_WORKFLOW_ENGINE_VERSION,
} from "./workflow.constants";
import { getAiWorkflowEngineMetadata } from "./workflow.metadata";
import { clearAiWorkflows, listAiWorkflows } from "./workflow.registry";
import type {
  AiWorkflowEngineManifest,
  AiWorkflowReadinessCheck,
  AiWorkflowReadinessResult,
} from "./workflow.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): AiWorkflowReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearAiWorkflowEngineLayer(): void {
  clearAiWorkflowSteps();
  clearAiWorkflowVersions();
  clearAiWorkflows();
}

export function buildAiWorkflowEngineManifest(): AiWorkflowEngineManifest {
  const workflows = listAiWorkflows();
  const versions = listAiWorkflowVersions();
  const steps = listAiWorkflowSteps();
  const metadata = getAiWorkflowEngineMetadata();

  const payload = {
    engineId: PRODUCT_AI_WORKFLOW_ENGINE_ID,
    version: PRODUCT_AI_WORKFLOW_ENGINE_VERSION,
    freezeVersion: PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION,
    base: PRODUCT_AI_WORKFLOW_ENGINE_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    workflows: workflows.map((w) => ({
      workflowKey: w.workflowKey,
      kind: w.kind,
      status: w.status,
    })),
    versions: versions.map((v) => ({
      versionKey: v.versionKey,
      semver: v.semver,
      status: v.status,
      workflowId: v.workflowId,
    })),
    steps: steps.map((s) => ({
      stepKey: s.stepKey,
      kind: s.kind,
      order: s.order,
      promptKeyRef: s.promptKeyRef,
      versionId: s.versionId,
    })),
  };

  return {
    engineId: PRODUCT_AI_WORKFLOW_ENGINE_ID,
    version: PRODUCT_AI_WORKFLOW_ENGINE_VERSION,
    freezeVersion: PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION,
    base: PRODUCT_AI_WORKFLOW_ENGINE_BASE,
    workflowCount: workflows.length,
    versionCount: versions.length,
    stepCount: steps.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateAiWorkflowEngineReadiness(): AiWorkflowReadinessResult {
  const checks: AiWorkflowReadinessCheck[] = [];
  const metadata = getAiWorkflowEngineMetadata();
  const workflows = listAiWorkflows();
  const versions = listAiWorkflowVersions();
  const steps = listAiWorkflowSteps();
  const manifest = buildAiWorkflowEngineManifest();

  checks.push(
    check(
      "WF-BASE",
      "engine",
      "ai prompt engine base aligned",
      PRODUCT_AI_WORKFLOW_ENGINE_BASE === PRODUCT_AI_PROMPT_ENGINE_ID &&
        PRODUCT_AI_PROMPT_ENGINE_ID ===
          "enterprise-product-ai-prompt-engine-v1",
      `base=${PRODUCT_AI_WORKFLOW_ENGINE_BASE}`,
    ),
  );

  checks.push(
    check(
      "WF-META",
      "metadata",
      "Workflow engine metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 5,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "WF-REG",
      "workflow",
      "Active workflows present",
      workflows.some((w) => w.status === "ACTIVE"),
      `workflows=${workflows.length}`,
    ),
  );

  checks.push(
    check(
      "WF-VER",
      "version",
      "Published versions present",
      versions.some((v) => v.status === "PUBLISHED"),
      `versions=${versions.length}`,
    ),
  );

  checks.push(
    check(
      "WF-STEP",
      "step",
      "Workflow steps present",
      steps.length >= 1,
      `steps=${steps.length}`,
    ),
  );

  checks.push(
    check(
      "WF-MAN",
      "manifest",
      "Workflow engine manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.engineId === PRODUCT_AI_WORKFLOW_ENGINE_ID &&
        manifest.workflowCount >= 1 &&
        manifest.versionCount >= 1 &&
        manifest.stepCount >= 1,
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
    summary: `product-ai-workflow-engine readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertAiWorkflowEngineReadinessReady(
  result: AiWorkflowReadinessResult,
): asserts result is AiWorkflowReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product ai workflow engine not ready: ${result.summary}`,
    );
  }
}
