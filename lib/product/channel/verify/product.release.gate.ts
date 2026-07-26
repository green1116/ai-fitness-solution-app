/**
 * Product Channel — Release Gate
 * MODULE: Channel (M06-P3)
 * BASE: enterprise-product-template-management-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../../notification/foundation/foundation.constants";
import { PRODUCT_TEMPLATE_MANAGEMENT_ID } from "../../notification-template/management/management.constants";
import {
  assertChannelManagementReadinessReady,
  clearChannelManagementLayer,
  createChannelManager,
  getChannelRegistryManifest,
} from "../channel.manager";
import {
  CHANNEL_CAPABILITY_FEATURES,
  CHANNEL_KINDS,
  CHANNEL_MANAGER_STATUSES,
  CHANNEL_POLICY_MODES,
  CHANNEL_READINESS_VERDICTS,
  CHANNEL_STATUSES,
  CHANNEL_VALIDATION_VERDICTS,
  PRODUCT_CHANNEL_FREEZE_VERSION,
  PRODUCT_CHANNEL_MANAGEMENT_BASE,
  PRODUCT_CHANNEL_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_CHANNEL_MANAGEMENT_ID,
  PRODUCT_CHANNEL_MANAGEMENT_VERSION,
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

export const PRODUCT_CHANNEL_SIGNOFF_VERSION =
  "product-channel-signoff-1" as const;

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
  clearChannelManagementLayer();
}

export function checkProductChannelReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "CHN-CONSTANTS",
      "management",
      "Product channel management version constants",
      PRODUCT_CHANNEL_MANAGEMENT_ID ===
        "enterprise-product-channel-management-v1" &&
        PRODUCT_CHANNEL_MANAGEMENT_VERSION === "product-channel-1" &&
        PRODUCT_CHANNEL_MANAGEMENT_BASE === PRODUCT_TEMPLATE_MANAGEMENT_ID &&
        PRODUCT_CHANNEL_MANAGEMENT_FREEZE_VERSION ===
          "product-channel-management-freeze-1" &&
        PRODUCT_CHANNEL_FREEZE_VERSION ===
          "product-channel-management-freeze-1" &&
        CHANNEL_KINDS.length === 5 &&
        CHANNEL_STATUSES.length === 3 &&
        CHANNEL_CAPABILITY_FEATURES.length === 4 &&
        CHANNEL_POLICY_MODES.length === 3 &&
        CHANNEL_VALIDATION_VERDICTS.length === 3 &&
        CHANNEL_READINESS_VERDICTS.length === 3 &&
        CHANNEL_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_CHANNEL_MANAGEMENT_ID} base=${PRODUCT_CHANNEL_MANAGEMENT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "CHN-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "CHN-UPSTREAM",
      "compatibility",
      "Depends only on notification-foundation + template-management",
      PRODUCT_CHANNEL_MANAGEMENT_BASE ===
        "enterprise-product-template-management-v1" &&
        PRODUCT_TEMPLATE_MANAGEMENT_ID ===
          "enterprise-product-template-management-v1" &&
        PRODUCT_NOTIFICATION_FOUNDATION_ID ===
          "enterprise-product-notification-foundation-v1",
      `template=${PRODUCT_TEMPLATE_MANAGEMENT_ID} ntf=${PRODUCT_NOTIFICATION_FOUNDATION_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createChannelManager({ managerId: "prod-chn-gate" });
    mgr.initialize();
    mgr.start();

    const channel = mgr.registerChannel({
      id: "chn.gate.reg",
      channelKey: "OPS_ALERT_EMAIL",
      name: "Operations Alert Email",
      kind: "EMAIL",
      templateManagementRef: PRODUCT_TEMPLATE_MANAGEMENT_ID,
    });
    mgr.updateChannelStatus({ channelId: channel.id, status: "ACTIVE" });
    mgr.declareCapability({
      id: "chn.gate.cap",
      channelId: channel.id,
      features: ["SUPPORTS_TEMPLATE", "SUPPORTS_PRIORITY"],
    });
    mgr.attachPolicy({
      id: "chn.gate.pol",
      channelId: channel.id,
      mode: "RESTRICTED",
      maxPerMinute: 60,
      requireTemplate: true,
    });
    const validation = mgr.validateChannel({
      id: "chn.gate.val",
      channelId: channel.id,
    });
    const release = mgr.createReleaseManifest({
      id: "chn.gate.rel",
      channelId: channel.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getChannelRegistryManifest();

    const ok =
      channel.channelKey === "OPS_ALERT_EMAIL" &&
      validation.verdict === "VALID" &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.managementId === PRODUCT_CHANNEL_MANAGEMENT_ID &&
      registry.base === PRODUCT_CHANNEL_MANAGEMENT_BASE &&
      registry.channelCount >= 1 &&
      registry.capabilityCount >= 1 &&
      registry.policyCount >= 1 &&
      registry.validationCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertChannelManagementReadinessReady(readiness);
      checks.push(
        check(
          "CHN-STACK",
          "management",
          "Registry / capability / policy / validation / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "CHN-STACK",
          "management",
          "Registry / capability / policy / validation / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product channel not ready",
        ),
      );
    }

    checks.push(
      check(
        "CHN-SCOPE",
        "scope",
        "No provider / delivery / routing surface",
        ok && validation.reasons.length === 0,
        "provider-free channel management",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error ? error.message : "product channel probe failed";
    checks.push(
      check(
        "CHN-STACK",
        "management",
        "Registry / capability / policy / validation / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "CHN-SCOPE",
        "scope",
        "No provider / delivery / routing surface",
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
      `product-channel-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductChannelReleaseGatePass(
  gate: ReleaseGateResult = checkProductChannelReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product channel release gate failed: ${gate.summary}`);
  }
}
