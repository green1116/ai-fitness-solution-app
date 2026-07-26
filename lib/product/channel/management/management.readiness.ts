/**
 * Product Channel — readiness
 */

import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../../notification/foundation/foundation.constants";
import { PRODUCT_TEMPLATE_MANAGEMENT_ID } from "../../notification-template/management/management.constants";
import { listChannelCapabilities } from "../capability/capability.registry";
import { listChannelReleaseManifests } from "../manifest/manifest.registry";
import { listChannelPolicies } from "../policy/policy.registry";
import { listChannels } from "../registry/channel.registry";
import { listChannelValidations } from "../validation/validation.registry";
import { PRODUCT_CHANNEL_MANAGEMENT_BASE } from "./management.constants";
import type {
  ChannelReadinessCheck,
  ChannelReadinessResult,
} from "./management.types";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): ChannelReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluateChannelManagementReadiness(): ChannelReadinessResult {
  const checks: ChannelReadinessCheck[] = [];

  checks.push(
    check(
      "CHN-BASE",
      "management",
      "Template management + notification foundation aligned",
      PRODUCT_CHANNEL_MANAGEMENT_BASE === PRODUCT_TEMPLATE_MANAGEMENT_ID &&
        PRODUCT_TEMPLATE_MANAGEMENT_ID ===
          "enterprise-product-template-management-v1" &&
        PRODUCT_NOTIFICATION_FOUNDATION_ID ===
          "enterprise-product-notification-foundation-v1",
      `base=${PRODUCT_CHANNEL_MANAGEMENT_BASE}`,
    ),
  );

  const channels = listChannels();
  checks.push(
    check(
      "CHN-REG",
      "registry",
      "Active channels present",
      channels.some((c) => c.status === "ACTIVE"),
      `channels=${channels.length}`,
    ),
  );

  const capabilities = listChannelCapabilities();
  checks.push(
    check(
      "CHN-CAP",
      "capability",
      "Capabilities present",
      capabilities.length >= 1,
      `capabilities=${capabilities.length}`,
    ),
  );

  const policies = listChannelPolicies();
  checks.push(
    check(
      "CHN-POL",
      "policy",
      "Policies present",
      policies.length >= 1,
      `policies=${policies.length}`,
    ),
  );

  const validations = listChannelValidations();
  checks.push(
    check(
      "CHN-VAL",
      "validation",
      "Valid validations present",
      validations.some((v) => v.verdict === "VALID"),
      `validations=${validations.length}`,
    ),
  );

  const releases = listChannelReleaseManifests();
  checks.push(
    check(
      "CHN-REL",
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
    summary: `product-channel readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertChannelManagementReadinessReady(
  result: ChannelReadinessResult,
): asserts result is ChannelReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product channel management not ready: ${result.summary}`,
    );
  }
}
