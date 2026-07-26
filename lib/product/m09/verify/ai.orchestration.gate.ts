/**
 * Product M09 — AI Orchestration Release Gate
 * MODULE: AI Orchestration (M09-P5)
 * BASE: enterprise-product-ai-workflow-engine-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import {
  AI_ORCHESTRATION_KINDS,
  AI_ORCHESTRATION_READINESS_VERDICTS,
  AI_ORCHESTRATION_ROUTE_KINDS,
  AI_ORCHESTRATION_STATUSES,
  AI_ORCHESTRATION_VERSION_STATUSES,
  PRODUCT_AI_ORCHESTRATION_BASE,
  PRODUCT_AI_ORCHESTRATION_FREEZE_TAG,
  PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION,
  PRODUCT_AI_ORCHESTRATION_ID,
  PRODUCT_AI_ORCHESTRATION_VERSION,
} from "../orchestration/orchestration.constants";
import {
  assertAiOrchestrationReadinessReady,
  buildAiOrchestrationManifest,
  clearAiOrchestrationLayer,
  evaluateAiOrchestrationReadiness,
} from "../orchestration/orchestration.manifest";
import {
  getAiOrchestrationMetadata,
  isAiOrchestrationMetadataIntact,
} from "../orchestration/orchestration.metadata";
import {
  registerAiOrchestration,
  updateAiOrchestrationStatus,
} from "../orchestration/orchestration.registry";
import { registerAiOrchestrationRoute } from "../orchestration/route.registry";
import {
  registerAiOrchestrationVersion,
  updateAiOrchestrationVersionStatus,
} from "../orchestration/version.registry";
import { PRODUCT_AI_WORKFLOW_ENGINE_ID } from "../workflow-engine/workflow.constants";

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

export const PRODUCT_AI_ORCHESTRATION_SIGNOFF_VERSION =
  "product-ai-orchestration-signoff-1" as const;

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
  clearAiOrchestrationLayer();
}

export function checkProductAiOrchestrationReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAiOrchestrationMetadata();

  checks.push(
    check(
      "ORCH-CONSTANTS",
      "orchestration",
      "Product AI orchestration version constants",
      PRODUCT_AI_ORCHESTRATION_ID ===
        "enterprise-product-ai-orchestration-v1" &&
        PRODUCT_AI_ORCHESTRATION_VERSION === "product-ai-orchestration-1" &&
        PRODUCT_AI_ORCHESTRATION_BASE === PRODUCT_AI_WORKFLOW_ENGINE_ID &&
        PRODUCT_AI_ORCHESTRATION_FREEZE_VERSION ===
          "product-ai-orchestration-freeze-1" &&
        PRODUCT_AI_ORCHESTRATION_FREEZE_TAG ===
          "product-ai-orchestration-freeze-1" &&
        AI_ORCHESTRATION_KINDS.length === 4 &&
        AI_ORCHESTRATION_STATUSES.length === 4 &&
        AI_ORCHESTRATION_VERSION_STATUSES.length === 4 &&
        AI_ORCHESTRATION_ROUTE_KINDS.length === 4 &&
        AI_ORCHESTRATION_READINESS_VERDICTS.length === 3 &&
        isAiOrchestrationMetadataIntact(metadata),
      `id=${PRODUCT_AI_ORCHESTRATION_ID} base=${PRODUCT_AI_ORCHESTRATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "ORCH-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "ORCH-UPSTREAM",
      "compatibility",
      "Depends on AI workflow engine chain",
      PRODUCT_AI_ORCHESTRATION_BASE ===
        "enterprise-product-ai-workflow-engine-v1" &&
        PRODUCT_AI_WORKFLOW_ENGINE_ID ===
          "enterprise-product-ai-workflow-engine-v1",
      `workflow=${PRODUCT_AI_WORKFLOW_ENGINE_ID}`,
    ),
  );

  try {
    cleanup();

    const plan = registerAiOrchestration({
      id: "orch.gate.plan",
      orchestrationKey: "DOMAIN_COACH_ORCH",
      name: "Domain Coach Orchestration",
      kind: "COMPOSE",
      summary: "Declared composition plan for coaching domain",
    });
    const active = updateAiOrchestrationStatus({
      orchestrationId: plan.id,
      status: "ACTIVE",
    });
    const version = registerAiOrchestrationVersion({
      id: "orch.gate.ver",
      orchestrationId: plan.id,
      versionKey: "DOMAIN_COACH_ORCH_V1",
      semver: "1.0.0",
    });
    const published = updateAiOrchestrationVersionStatus({
      versionId: version.id,
      status: "PUBLISHED",
    });
    const route = registerAiOrchestrationRoute({
      id: "orch.gate.route",
      orchestrationId: plan.id,
      versionId: version.id,
      routeKey: "COACH_PRIMARY_ROUTE",
      kind: "WORKFLOW",
      order: 1,
      workflowKeyRef: "DOMAIN_COACH_FLOW",
      promptKeyRef: "DOMAIN_COACH_SYSTEM",
      modelKeyRef: "DOMAIN_LLM_GENERAL",
    });
    const manifest = buildAiOrchestrationManifest();
    const readiness = evaluateAiOrchestrationReadiness();

    const ok =
      plan.orchestrationKey === "DOMAIN_COACH_ORCH" &&
      active.status === "ACTIVE" &&
      published.status === "PUBLISHED" &&
      route.workflowKeyRef === "DOMAIN_COACH_FLOW" &&
      route.promptKeyRef === "DOMAIN_COACH_SYSTEM" &&
      route.modelKeyRef === "DOMAIN_LLM_GENERAL" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAiOrchestrationReadinessReady(readiness);
      checks.push(
        check(
          "ORCH-STACK",
          "orchestration",
          "Plan / version / route / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "ORCH-STACK",
          "orchestration",
          "Plan / version / route / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product ai orchestration not ready",
        ),
      );
    }

    checks.push(
      check(
        "ORCH-SCOPE",
        "scope",
        "No provider-runtime / model-execution / agent-runtime / tool-calling-runtime / business-logic",
        ok && metadata.declarationOnly === true,
        "ai-orchestration-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product ai orchestration probe failed";
    checks.push(
      check(
        "ORCH-STACK",
        "orchestration",
        "Plan / version / route / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "ORCH-SCOPE",
        "scope",
        "No provider-runtime / model-execution / agent-runtime / tool-calling-runtime / business-logic",
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
      `product-ai-orchestration-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAiOrchestrationReleaseGatePass(
  gate: ReleaseGateResult = checkProductAiOrchestrationReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product AI orchestration release gate failed: ${gate.summary}`,
    );
  }
}
