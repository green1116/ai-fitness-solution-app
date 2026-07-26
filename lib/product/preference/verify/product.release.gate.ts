/**
 * Product Preference — Preference Management Release Gate
 * MODULE: Preference (M06-P5)
 * BASE: enterprise-product-delivery-engine-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_CHANNEL_MANAGEMENT_ID } from "../../channel/management/management.constants";
import { PRODUCT_DELIVERY_ENGINE_ID } from "../../delivery/management/management.constants";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../../notification/foundation/foundation.constants";
import { PRODUCT_TEMPLATE_MANAGEMENT_ID } from "../../notification-template/management/management.constants";
import {
  PREFERENCE_CONSENT_STATES,
  PREFERENCE_KINDS,
  PREFERENCE_MANAGER_STATUSES,
  PREFERENCE_READINESS_VERDICTS,
  PREFERENCE_RESOLUTION_STRATEGIES,
  PREFERENCE_SCOPE_LEVELS,
  PREFERENCE_VALIDATION_VERDICTS,
  PRODUCT_PREFERENCE_FREEZE_VERSION,
  PRODUCT_PREFERENCE_MANAGEMENT_BASE,
  PRODUCT_PREFERENCE_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PREFERENCE_MANAGEMENT_ID,
  PRODUCT_PREFERENCE_MANAGEMENT_VERSION,
} from "../management/management.constants";
import {
  assertPreferenceManagementReadinessReady,
  clearPreferenceManagementLayer,
  createPreferenceManager,
  getPreferenceRegistryManifest,
} from "../preference.manager";

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

export const PRODUCT_PREFERENCE_SIGNOFF_VERSION =
  "product-preference-signoff-1" as const;

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
  clearPreferenceManagementLayer();
}

export function checkProductPreferenceReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "PREF-CONSTANTS",
      "management",
      "Product preference management version constants",
      PRODUCT_PREFERENCE_MANAGEMENT_ID ===
        "enterprise-product-preference-management-v1" &&
        PRODUCT_PREFERENCE_MANAGEMENT_VERSION === "product-preference-1" &&
        PRODUCT_PREFERENCE_MANAGEMENT_BASE === PRODUCT_DELIVERY_ENGINE_ID &&
        PRODUCT_PREFERENCE_MANAGEMENT_FREEZE_VERSION ===
          "product-preference-management-freeze-1" &&
        PRODUCT_PREFERENCE_FREEZE_VERSION ===
          "product-preference-management-freeze-1" &&
        PREFERENCE_KINDS.length === 4 &&
        PREFERENCE_SCOPE_LEVELS.length === 4 &&
        PREFERENCE_CONSENT_STATES.length === 4 &&
        PREFERENCE_RESOLUTION_STRATEGIES.length === 3 &&
        PREFERENCE_VALIDATION_VERDICTS.length === 3 &&
        PREFERENCE_READINESS_VERDICTS.length === 3 &&
        PREFERENCE_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_PREFERENCE_MANAGEMENT_ID} base=${PRODUCT_PREFERENCE_MANAGEMENT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "PREF-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "PREF-UPSTREAM",
      "compatibility",
      "Depends only on foundation + template + channel + delivery",
      PRODUCT_PREFERENCE_MANAGEMENT_BASE ===
        "enterprise-product-delivery-engine-v1" &&
        PRODUCT_DELIVERY_ENGINE_ID ===
          "enterprise-product-delivery-engine-v1" &&
        PRODUCT_CHANNEL_MANAGEMENT_ID ===
          "enterprise-product-channel-management-v1" &&
        PRODUCT_TEMPLATE_MANAGEMENT_ID ===
          "enterprise-product-template-management-v1" &&
        PRODUCT_NOTIFICATION_FOUNDATION_ID ===
          "enterprise-product-notification-foundation-v1",
      `delivery=${PRODUCT_DELIVERY_ENGINE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createPreferenceManager({ managerId: "prod-pref-gate" });
    mgr.initialize();
    mgr.start();

    const preference = mgr.registerPreference({
      id: "pref.gate.reg",
      preferenceKey: "MARKETING_EMAIL",
      name: "Marketing Email Preference",
      kind: "MARKETING",
      channelKey: "OPS_ALERT_EMAIL",
      templateKey: "WELCOME_NTPL",
    });
    const scope = mgr.attachScope({
      id: "pref.gate.scope",
      preferenceId: preference.id,
      level: "USER",
      subjectKey: "USER_ADA",
    });
    const consent = mgr.recordConsent({
      id: "pref.gate.con",
      preferenceId: preference.id,
      scopeId: scope.id,
      state: "GRANTED",
    });
    mgr.updateConsent({
      consentId: consent.id,
      state: "OPTED_OUT",
    });
    mgr.updateConsent({
      consentId: consent.id,
      state: "GRANTED",
    });
    mgr.defineResolutionRule({
      id: "pref.gate.res",
      preferenceId: preference.id,
      strategy: "DENY_OVERRIDES",
      respectOptOut: true,
    });
    const validation = mgr.validatePreference({
      id: "pref.gate.val",
      preferenceId: preference.id,
    });
    const release = mgr.createReleaseManifest({
      id: "pref.gate.rel",
      preferenceId: preference.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getPreferenceRegistryManifest();

    const ok =
      preference.preferenceKey === "MARKETING_EMAIL" &&
      validation.verdict === "VALID" &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.managementId === PRODUCT_PREFERENCE_MANAGEMENT_ID &&
      registry.base === PRODUCT_PREFERENCE_MANAGEMENT_BASE &&
      registry.preferenceCount >= 1 &&
      registry.scopeCount >= 1 &&
      registry.consentCount >= 1 &&
      registry.resolutionCount >= 1 &&
      registry.validationCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertPreferenceManagementReadinessReady(readiness);
      checks.push(
        check(
          "PREF-STACK",
          "management",
          "Registry / scope / consent / resolution / validation / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "PREF-STACK",
          "management",
          "Registry / scope / consent / resolution / validation / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product preference not ready",
        ),
      );
    }

    checks.push(
      check(
        "PREF-SCOPE",
        "scope",
        "No routing / provider / scheduling surface",
        ok,
        "preference-only management",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product preference probe failed";
    checks.push(
      check(
        "PREF-STACK",
        "management",
        "Registry / scope / consent / resolution / validation / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "PREF-SCOPE",
        "scope",
        "No routing / provider / scheduling surface",
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
      `product-preference-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductPreferenceReleaseGatePass(
  gate: ReleaseGateResult = checkProductPreferenceReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product preference release gate failed: ${gate.summary}`,
    );
  }
}
