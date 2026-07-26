/**
 * Product M09 — AI Workflow Engine Release Gate
 * MODULE: Workflow Engine (M09-P4)
 * BASE: enterprise-product-ai-prompt-engine-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_AI_PROMPT_ENGINE_ID } from "../prompt-engine/prompt.constants";
import { registerAiWorkflowStep } from "../workflow-engine/step.registry";
import {
  AI_WORKFLOW_KINDS,
  AI_WORKFLOW_READINESS_VERDICTS,
  AI_WORKFLOW_STATUSES,
  AI_WORKFLOW_STEP_KINDS,
  AI_WORKFLOW_VERSION_STATUSES,
  PRODUCT_AI_WORKFLOW_ENGINE_BASE,
  PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION,
  PRODUCT_AI_WORKFLOW_ENGINE_ID,
  PRODUCT_AI_WORKFLOW_ENGINE_VERSION,
  PRODUCT_AI_WORKFLOW_FREEZE_TAG,
} from "../workflow-engine/workflow.constants";
import {
  assertAiWorkflowEngineReadinessReady,
  buildAiWorkflowEngineManifest,
  clearAiWorkflowEngineLayer,
  evaluateAiWorkflowEngineReadiness,
} from "../workflow-engine/workflow.manifest";
import {
  getAiWorkflowEngineMetadata,
  isAiWorkflowEngineMetadataIntact,
} from "../workflow-engine/workflow.metadata";
import {
  registerAiWorkflow,
  updateAiWorkflowStatus,
} from "../workflow-engine/workflow.registry";
import {
  registerAiWorkflowVersion,
  updateAiWorkflowVersionStatus,
} from "../workflow-engine/version.registry";

export type GateVerdict = "PASS" | "FAIL";

export type GateCheckItem = {
  id: string;
  component: string;
  label: string;
  ok: boolean;
  detail: string;
};

export type ReleaseGateResult = {
  result: GateVerdict;
  passCount: number;
  failCount: number;
  checks: GateCheckItem[];
  summary: string;
};

export const PRODUCT_AI_WORKFLOW_SIGNOFF_VERSION =
  "product-ai-workflow-signoff-1" as const;

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): GateCheckItem {
  return { id, component, label, ok, detail };
}

function cleanup(): void {
  clearAiWorkflowEngineLayer();
}

export function checkProductAiWorkflowEngineReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAiWorkflowEngineMetadata();

  checks.push(
    check(
      "WF-CONSTANTS",
      "workflow-engine",
      "Product AI workflow engine version constants",
      PRODUCT_AI_WORKFLOW_ENGINE_ID ===
        "enterprise-product-ai-workflow-engine-v1" &&
        PRODUCT_AI_WORKFLOW_ENGINE_VERSION === "product-ai-workflow-1" &&
        PRODUCT_AI_WORKFLOW_ENGINE_BASE === PRODUCT_AI_PROMPT_ENGINE_ID &&
        PRODUCT_AI_WORKFLOW_ENGINE_FREEZE_VERSION ===
          "product-ai-workflow-engine-freeze-1" &&
        PRODUCT_AI_WORKFLOW_FREEZE_TAG ===
          "product-ai-workflow-engine-freeze-1" &&
        AI_WORKFLOW_KINDS.length === 4 &&
        AI_WORKFLOW_STATUSES.length === 4 &&
        AI_WORKFLOW_VERSION_STATUSES.length === 4 &&
        AI_WORKFLOW_STEP_KINDS.length === 4 &&
        AI_WORKFLOW_READINESS_VERDICTS.length === 3 &&
        isAiWorkflowEngineMetadataIntact(metadata),
      `id=${PRODUCT_AI_WORKFLOW_ENGINE_ID} base=${PRODUCT_AI_WORKFLOW_ENGINE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "WF-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "WF-UPSTREAM",
      "compatibility",
      "Depends on AI prompt engine chain",
      PRODUCT_AI_WORKFLOW_ENGINE_BASE ===
        "enterprise-product-ai-prompt-engine-v1" &&
        PRODUCT_AI_PROMPT_ENGINE_ID ===
          "enterprise-product-ai-prompt-engine-v1",
      `prompt=${PRODUCT_AI_PROMPT_ENGINE_ID}`,
    ),
  );

  try {
    cleanup();

    const workflow = registerAiWorkflow({
      id: "wf.gate.reg",
      workflowKey: "DOMAIN_COACH_FLOW",
      name: "Domain Coach Workflow",
      kind: "SEQUENTIAL",
      summary: "Declared sequential coaching workflow",
    });
    const active = updateAiWorkflowStatus({
      workflowId: workflow.id,
      status: "ACTIVE",
    });
    const version = registerAiWorkflowVersion({
      id: "wf.gate.ver",
      workflowId: workflow.id,
      versionKey: "DOMAIN_COACH_FLOW_V1",
      semver: "1.0.0",
    });
    const published = updateAiWorkflowVersionStatus({
      versionId: version.id,
      status: "PUBLISHED",
    });
    const step = registerAiWorkflowStep({
      id: "wf.gate.step",
      workflowId: workflow.id,
      versionId: version.id,
      stepKey: "COACH_SYSTEM_STEP",
      kind: "PROMPT",
      order: 1,
      promptKeyRef: "DOMAIN_COACH_SYSTEM",
    });
    const manifest = buildAiWorkflowEngineManifest();
    const readiness = evaluateAiWorkflowEngineReadiness();

    const ok =
      workflow.workflowKey === "DOMAIN_COACH_FLOW" &&
      active.status === "ACTIVE" &&
      published.status === "PUBLISHED" &&
      step.promptKeyRef === "DOMAIN_COACH_SYSTEM" &&
      step.order === 1 &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAiWorkflowEngineReadinessReady(readiness);
      checks.push(
        check(
          "WF-STACK",
          "workflow-engine",
          "Workflow / version / step / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "WF-STACK",
          "workflow-engine",
          "Workflow / version / step / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product ai workflow engine not ready",
        ),
      );
    }

    checks.push(
      check(
        "WF-SCOPE",
        "scope",
        "No provider-runtime / model-execution / agent / tool-calling / orchestration-runtime",
        ok && metadata.declarationOnly === true,
        "ai-workflow-engine-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product ai workflow engine probe failed";
    checks.push(
      check(
        "WF-STACK",
        "workflow-engine",
        "Workflow / version / step / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "WF-SCOPE",
        "scope",
        "No provider-runtime / model-execution / agent / tool-calling / orchestration-runtime",
        false,
        detail,
      ),
    );
    cleanup();
  }

  const passCount = checks.filter((c) => c.ok).length;
  const failCount = checks.filter((c) => !c.ok).length;
  const result: GateVerdict = failCount === 0 ? "PASS" : "FAIL";

  return {
    result,
    passCount,
    failCount,
    checks,
    summary: [
      `product-ai-workflow-engine-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAiWorkflowEngineReleaseGatePass(
  gate: ReleaseGateResult = checkProductAiWorkflowEngineReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product AI workflow engine release gate failed: ${gate.summary}`,
    );
  }
}
