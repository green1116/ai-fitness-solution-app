/**
 * Product M10 — AI Resource Manager Release Gate
 * MODULE: Resource Manager (M10-P5)
 * BASE: enterprise-product-ai-scheduler-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { bindAiResourceSchedule } from "../resource-manager/binding.registry";
import {
  registerAiResourceQuota,
  updateAiResourceQuotaStatus,
} from "../resource-manager/quota.registry";
import {
  AI_RESOURCE_BINDING_STATUSES,
  AI_RESOURCE_KINDS,
  AI_RESOURCE_QUOTA_STATUSES,
  AI_RESOURCE_READINESS_VERDICTS,
  AI_RESOURCE_STATUSES,
  PRODUCT_AI_RESOURCE_MANAGER_BASE,
  PRODUCT_AI_RESOURCE_MANAGER_FREEZE_TAG,
  PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION,
  PRODUCT_AI_RESOURCE_MANAGER_ID,
  PRODUCT_AI_RESOURCE_MANAGER_VERSION,
} from "../resource-manager/resource.constants";
import {
  assertAiResourceManagerReadinessReady,
  buildAiResourceManagerManifest,
  clearAiResourceManagerLayer,
  evaluateAiResourceManagerReadiness,
} from "../resource-manager/resource.manifest";
import {
  getAiResourceManagerMetadata,
  isAiResourceManagerMetadataIntact,
} from "../resource-manager/resource.metadata";
import {
  registerAiResource,
  updateAiResourceStatus,
} from "../resource-manager/resource.registry";
import { PRODUCT_AI_SCHEDULER_ID } from "../scheduler/scheduler.constants";

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

export const PRODUCT_AI_RESOURCE_MANAGER_SIGNOFF_VERSION =
  "product-ai-resource-manager-signoff-1" as const;

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
  clearAiResourceManagerLayer();
}

export function checkProductAiResourceManagerReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getAiResourceManagerMetadata();

  checks.push(
    check(
      "AIRM-CONSTANTS",
      "resource-manager",
      "Product AI resource manager version constants",
      PRODUCT_AI_RESOURCE_MANAGER_ID ===
        "enterprise-product-ai-resource-manager-v1" &&
        PRODUCT_AI_RESOURCE_MANAGER_VERSION ===
          "product-ai-resource-manager-1" &&
        PRODUCT_AI_RESOURCE_MANAGER_BASE === PRODUCT_AI_SCHEDULER_ID &&
        PRODUCT_AI_RESOURCE_MANAGER_FREEZE_VERSION ===
          "product-ai-resource-manager-freeze-1" &&
        PRODUCT_AI_RESOURCE_MANAGER_FREEZE_TAG ===
          "product-ai-resource-manager-freeze-1" &&
        AI_RESOURCE_KINDS.length === 5 &&
        AI_RESOURCE_STATUSES.length === 4 &&
        AI_RESOURCE_QUOTA_STATUSES.length === 4 &&
        AI_RESOURCE_BINDING_STATUSES.length === 3 &&
        AI_RESOURCE_READINESS_VERDICTS.length === 3 &&
        isAiResourceManagerMetadataIntact(metadata),
      `id=${PRODUCT_AI_RESOURCE_MANAGER_ID} base=${PRODUCT_AI_RESOURCE_MANAGER_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "AIRM-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "AIRM-UPSTREAM",
      "compatibility",
      "Depends on AI scheduler chain",
      PRODUCT_AI_RESOURCE_MANAGER_BASE ===
        "enterprise-product-ai-scheduler-v1" &&
        PRODUCT_AI_SCHEDULER_ID === "enterprise-product-ai-scheduler-v1",
      `scheduler=${PRODUCT_AI_SCHEDULER_ID}`,
    ),
  );

  try {
    cleanup();

    const resource = registerAiResource({
      id: "airm.gate.res",
      resourceKey: "DOMAIN_CONCURRENCY",
      kind: "CONCURRENCY",
      title: "Domain concurrency resource",
      unit: "SLOTS",
      summary: "Declared concurrency resource for domain reuse",
    });
    const active = updateAiResourceStatus({
      resourceId: resource.id,
      status: "ACTIVE",
    });
    const quota = registerAiResourceQuota({
      id: "airm.gate.quota",
      resourceId: resource.id,
      quotaKey: "DOMAIN_SLOT_CAP",
      limit: 8,
      summary: "Declared concurrency quota",
    });
    const declared = updateAiResourceQuotaStatus({
      quotaId: quota.id,
      status: "DECLARED",
    });
    const binding = bindAiResourceSchedule({
      id: "airm.gate.bind",
      resourceId: resource.id,
      quotaId: quota.id,
      bindingKey: "DOMAIN_CONCURRENCY_TO_CRON",
      scheduleKeyRef: "DOMAIN_CRON_SCHEDULE",
    });
    const manifest = buildAiResourceManagerManifest();
    const readiness = evaluateAiResourceManagerReadiness();

    const ok =
      resource.resourceKey === "DOMAIN_CONCURRENCY" &&
      active.status === "ACTIVE" &&
      declared.status === "DECLARED" &&
      declared.limit === 8 &&
      binding.status === "BOUND" &&
      binding.scheduleKeyRef === "DOMAIN_CRON_SCHEDULE" &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertAiResourceManagerReadinessReady(readiness);
      checks.push(
        check(
          "AIRM-STACK",
          "resource-manager",
          "Resource / quota / binding / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "AIRM-STACK",
          "resource-manager",
          "Resource / quota / binding / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product ai resource manager not ready",
        ),
      );
    }

    checks.push(
      check(
        "AIRM-SCOPE",
        "scope",
        "No allocation / token accounting / autoscaling / provider / model / queue / monitoring",
        ok && metadata.declarationOnly === true,
        "ai-resource-manager-definition-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product ai resource manager probe failed";
    checks.push(
      check(
        "AIRM-STACK",
        "resource-manager",
        "Resource / quota / binding / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "AIRM-SCOPE",
        "scope",
        "No allocation / token accounting / autoscaling / provider / model / queue / monitoring",
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
      `product-ai-resource-manager-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductAiResourceManagerReleaseGatePass(
  gate: ReleaseGateResult = checkProductAiResourceManagerReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product AI resource manager release gate failed: ${gate.summary}`,
    );
  }
}
