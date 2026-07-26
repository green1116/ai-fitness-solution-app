/**
 * Product Delivery — Delivery Engine Release Gate
 * MODULE: Delivery (M06-P4)
 * BASE: enterprise-product-channel-management-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_CHANNEL_MANAGEMENT_ID } from "../../channel/management/management.constants";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../../notification/foundation/foundation.constants";
import { PRODUCT_TEMPLATE_MANAGEMENT_ID } from "../../notification-template/management/management.constants";
import {
  assertDeliveryEngineReadinessReady,
  clearDeliveryEngineLayer,
  createDeliveryManager,
  getDeliveryRegistryManifest,
} from "../delivery.manager";
import {
  DELIVERY_DISPATCH_CONTRACT_STATUSES,
  DELIVERY_MANAGER_STATUSES,
  DELIVERY_PIPELINE_STAGES,
  DELIVERY_READINESS_VERDICTS,
  DELIVERY_REQUEST_PRIORITIES,
  DELIVERY_RETRY_BACKOFFS,
  DELIVERY_STATUSES,
  PRODUCT_DELIVERY_ENGINE_BASE,
  PRODUCT_DELIVERY_ENGINE_FREEZE_VERSION,
  PRODUCT_DELIVERY_ENGINE_ID,
  PRODUCT_DELIVERY_ENGINE_VERSION,
  PRODUCT_DELIVERY_FREEZE_VERSION,
} from "../management/management.constants";

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

export const PRODUCT_DELIVERY_SIGNOFF_VERSION =
  "product-delivery-signoff-1" as const;

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
  clearDeliveryEngineLayer();
}

export function checkProductDeliveryReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "DLV-CONSTANTS",
      "management",
      "Product delivery engine version constants",
      PRODUCT_DELIVERY_ENGINE_ID === "enterprise-product-delivery-engine-v1" &&
        PRODUCT_DELIVERY_ENGINE_VERSION === "product-delivery-1" &&
        PRODUCT_DELIVERY_ENGINE_BASE === PRODUCT_CHANNEL_MANAGEMENT_ID &&
        PRODUCT_DELIVERY_ENGINE_FREEZE_VERSION ===
          "product-delivery-engine-freeze-1" &&
        PRODUCT_DELIVERY_FREEZE_VERSION ===
          "product-delivery-engine-freeze-1" &&
        DELIVERY_REQUEST_PRIORITIES.length === 3 &&
        DELIVERY_PIPELINE_STAGES.length === 5 &&
        DELIVERY_STATUSES.length === 6 &&
        DELIVERY_RETRY_BACKOFFS.length === 3 &&
        DELIVERY_DISPATCH_CONTRACT_STATUSES.length === 3 &&
        DELIVERY_READINESS_VERDICTS.length === 3 &&
        DELIVERY_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_DELIVERY_ENGINE_ID} base=${PRODUCT_DELIVERY_ENGINE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "DLV-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "DLV-UPSTREAM",
      "compatibility",
      "Depends only on foundation + template + channel",
      PRODUCT_DELIVERY_ENGINE_BASE ===
        "enterprise-product-channel-management-v1" &&
        PRODUCT_CHANNEL_MANAGEMENT_ID ===
          "enterprise-product-channel-management-v1" &&
        PRODUCT_TEMPLATE_MANAGEMENT_ID ===
          "enterprise-product-template-management-v1" &&
        PRODUCT_NOTIFICATION_FOUNDATION_ID ===
          "enterprise-product-notification-foundation-v1",
      `channel=${PRODUCT_CHANNEL_MANAGEMENT_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createDeliveryManager({ managerId: "prod-dlv-gate" });
    mgr.initialize();
    mgr.start();

    const request = mgr.createRequest({
      id: "dlv.gate.req",
      requestKey: "WELCOME_SEND",
      channelKey: "OPS_ALERT_EMAIL",
      templateKey: "WELCOME_NTPL",
      priority: "NORMAL",
    });
    mgr.definePipeline({
      id: "dlv.gate.pipe",
      requestId: request.id,
      stages: ["ACCEPT", "VALIDATE", "PREPARE", "DISPATCH", "COMPLETE"],
    });
    const status = mgr.openStatus({
      id: "dlv.gate.sts",
      requestId: request.id,
    });
    mgr.updateStatus({ statusId: status.id, status: "QUEUED" });
    mgr.updateStatus({ statusId: status.id, status: "DISPATCHING" });
    mgr.updateStatus({ statusId: status.id, status: "SUCCEEDED" });
    mgr.attachRetryPolicy({
      id: "dlv.gate.rty",
      requestId: request.id,
      maxAttempts: 3,
      backoff: "EXPONENTIAL",
      baseDelayMs: 1000,
    });
    const dispatch = mgr.registerDispatchContract({
      id: "dlv.gate.dsp",
      requestId: request.id,
      channelKey: request.channelKey,
      contractKey: "GENERIC_DISPATCH",
    });
    mgr.updateDispatchContractStatus({
      contractId: dispatch.id,
      status: "BOUND",
    });
    const release = mgr.createReleaseManifest({
      id: "dlv.gate.rel",
      requestId: request.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getDeliveryRegistryManifest();

    const ok =
      request.requestKey === "WELCOME_SEND" &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.engineId === PRODUCT_DELIVERY_ENGINE_ID &&
      registry.base === PRODUCT_DELIVERY_ENGINE_BASE &&
      registry.requestCount >= 1 &&
      registry.pipelineCount >= 1 &&
      registry.statusCount >= 1 &&
      registry.retryPolicyCount >= 1 &&
      registry.dispatchCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertDeliveryEngineReadinessReady(readiness);
      checks.push(
        check(
          "DLV-STACK",
          "engine",
          "Request / pipeline / status / retry / dispatch / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "DLV-STACK",
          "engine",
          "Request / pipeline / status / retry / dispatch / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product delivery not ready",
        ),
      );
    }

    checks.push(
      check(
        "DLV-SCOPE",
        "scope",
        "No provider / routing / preference surface",
        ok,
        "provider-free delivery engine",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "product delivery probe failed";
    checks.push(
      check(
        "DLV-STACK",
        "engine",
        "Request / pipeline / status / retry / dispatch / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "DLV-SCOPE",
        "scope",
        "No provider / routing / preference surface",
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
      `product-delivery-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductDeliveryReleaseGatePass(
  gate: ReleaseGateResult = checkProductDeliveryReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product delivery release gate failed: ${gate.summary}`);
  }
}
