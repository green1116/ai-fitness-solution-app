/**
 * Product Preference — readiness
 */

import { PRODUCT_CHANNEL_MANAGEMENT_ID } from "../../channel/management/management.constants";
import { PRODUCT_DELIVERY_ENGINE_ID } from "../../delivery/management/management.constants";
import { PRODUCT_NOTIFICATION_FOUNDATION_ID } from "../../notification/foundation/foundation.constants";
import { PRODUCT_TEMPLATE_MANAGEMENT_ID } from "../../notification-template/management/management.constants";
import { listPreferenceConsents } from "../consent/consent.registry";
import { listPreferenceReleaseManifests } from "../manifest/manifest.registry";
import { PRODUCT_PREFERENCE_MANAGEMENT_BASE } from "./management.constants";
import type {
  PreferenceReadinessCheck,
  PreferenceReadinessResult,
} from "./management.types";
import { listPreferences } from "../registry/preference.registry";
import { listPreferenceResolutionRules } from "../resolution/resolution.registry";
import { listPreferenceScopes } from "../scope/scope.registry";
import { listPreferenceValidations } from "../validation/validation.registry";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): PreferenceReadinessCheck {
  return { id, component, label, ok, detail };
}

export function evaluatePreferenceManagementReadiness(): PreferenceReadinessResult {
  const checks: PreferenceReadinessCheck[] = [];

  checks.push(
    check(
      "PREF-BASE",
      "management",
      "Delivery + channel + template + foundation aligned",
      PRODUCT_PREFERENCE_MANAGEMENT_BASE === PRODUCT_DELIVERY_ENGINE_ID &&
        PRODUCT_DELIVERY_ENGINE_ID ===
          "enterprise-product-delivery-engine-v1" &&
        PRODUCT_CHANNEL_MANAGEMENT_ID ===
          "enterprise-product-channel-management-v1" &&
        PRODUCT_TEMPLATE_MANAGEMENT_ID ===
          "enterprise-product-template-management-v1" &&
        PRODUCT_NOTIFICATION_FOUNDATION_ID ===
          "enterprise-product-notification-foundation-v1",
      `base=${PRODUCT_PREFERENCE_MANAGEMENT_BASE}`,
    ),
  );

  const preferences = listPreferences();
  checks.push(
    check(
      "PREF-REG",
      "registry",
      "Preferences registered",
      preferences.length >= 1,
      `preferences=${preferences.length}`,
    ),
  );

  const scopes = listPreferenceScopes();
  checks.push(
    check(
      "PREF-SCOPE",
      "scope",
      "Scopes present",
      scopes.length >= 1,
      `scopes=${scopes.length}`,
    ),
  );

  const consents = listPreferenceConsents();
  checks.push(
    check(
      "PREF-CONSENT",
      "consent",
      "Consents present",
      consents.length >= 1,
      `consents=${consents.length}`,
    ),
  );

  const rules = listPreferenceResolutionRules();
  checks.push(
    check(
      "PREF-RES",
      "resolution",
      "Resolution rules present",
      rules.length >= 1,
      `rules=${rules.length}`,
    ),
  );

  const validations = listPreferenceValidations();
  checks.push(
    check(
      "PREF-VAL",
      "validation",
      "Valid validations present",
      validations.some((v) => v.verdict === "VALID"),
      `validations=${validations.length}`,
    ),
  );

  const releases = listPreferenceReleaseManifests();
  checks.push(
    check(
      "PREF-REL",
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
    summary: `product-preference readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertPreferenceManagementReadinessReady(
  result: PreferenceReadinessResult,
): asserts result is PreferenceReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product preference management not ready: ${result.summary}`,
    );
  }
}
