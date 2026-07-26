/**
 * Product Delivery — readiness
 */

import { PRODUCT_CHANNEL_MANAGEMENT_ID } from "../../channel/management/management.constants";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../../notification/foundation/foundation.constants";
import { PRODUCT_TEMPLATE_MANAGEMENT_ID } from "../../notification-template/management/management.constants";
import { listDeliveryDispatchContracts } from "../dispatch/dispatch.registry";
import { listDeliveryReleaseManifests } from "../manifest/manifest.registry";
import { PRODUCT_DELIVERY_ENGINE_BASE } from "./management.constants";
import type {
  DeliveryReadinessCheck,
  DeliveryReadinessResult,
} from "./management.types";
import { listDeliveryPipelines } from "../pipeline/pipeline.registry";
import { listDeliveryRequests } from "../request/request.registry";
import { listDeliveryRetryPolicies } from "../retry/retry.registry";
import { listDeliveryStatuses } from "../status/status.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): DeliveryReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateDeliveryEngineReadiness(): DeliveryReadinessResult {
  const checks: DeliveryReadinessCheck[] = [];

  checks.push(
    check(
      "DLV-BASE",
      "management",
      "Channel + template + notification foundation aligned",
      PRODUCT_DELIVERY_ENGINE_BASE === PRODUCT_CHANNEL_MANAGEMENT_ID &&
        PRODUCT_CHANNEL_MANAGEMENT_ID ===
          "enterprise-product-channel-management-v1" &&
        PRODUCT_TEMPLATE_MANAGEMENT_ID ===
          "enterprise-product-template-management-v1" &&
        PRODUCT_NOTIFICATION_FOUNDATION_ID ===
          "enterprise-product-notification-foundation-v1",
      `base=${PRODUCT_DELIVERY_ENGINE_BASE}`,
    ),
  );

  const requests = listDeliveryRequests();
  checks.push(
    check(
      "DLV-REQ",
      "request",
      "Delivery requests present",
      requests.length >= 1,
      `requests=${requests.length}`,
    ),
  );

  const pipelines = listDeliveryPipelines();
  checks.push(
    check(
      "DLV-PIPE",
      "pipeline",
      "Pipelines present",
      pipelines.length >= 1,
      `pipelines=${pipelines.length}`,
    ),
  );

  const statuses = listDeliveryStatuses();
  checks.push(
    check(
      "DLV-STS",
      "status",
      "Succeeded statuses present",
      statuses.some((s) => s.status === "SUCCEEDED"),
      `statuses=${statuses.length}`,
    ),
  );

  const retries = listDeliveryRetryPolicies();
  checks.push(
    check(
      "DLV-RTY",
      "retry",
      "Retry policies present",
      retries.length >= 1,
      `retries=${retries.length}`,
    ),
  );

  const dispatches = listDeliveryDispatchContracts();
  checks.push(
    check(
      "DLV-DSP",
      "dispatch",
      "Bound dispatch contracts present",
      dispatches.some((d) => d.status === "BOUND"),
      `dispatches=${dispatches.length}`,
    ),
  );

  const releases = listDeliveryReleaseManifests();
  checks.push(
    check(
      "DLV-REL",
      "manifest",
      "Release manifests present",
      releases.length >= 1 && releases.every((r) => r.checksum.length === 64),
      `releases=${releases.length}`,
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
    summary: `product-delivery readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertDeliveryEngineReadinessReady(
  result: DeliveryReadinessResult,
): asserts result is DeliveryReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product delivery engine not ready: ${result.summary}`);
  }
}
