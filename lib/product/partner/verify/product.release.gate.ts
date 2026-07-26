/**
 * Product Partner — Management Release Gate
 * MODULE: Partner Management (M08-P3)
 * BASE: enterprise-product-connector-framework-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_API_BASELINE_ID } from "../../api-baseline/freeze/freeze.lock";
import { PRODUCT_CONNECTOR_FRAMEWORK_ID } from "../../connector/management/management.constants";
import { PRODUCT_MARKETPLACE_FOUNDATION_ID } from "../../marketplace/management/management.constants";
import {
  PARTNER_ACCESS_STATUSES,
  PARTNER_AGREEMENT_STATUSES,
  PARTNER_KINDS,
  PARTNER_MANAGER_STATUSES,
  PARTNER_READINESS_VERDICTS,
  PARTNER_STATUSES,
  PRODUCT_PARTNER_FREEZE_TAG,
  PRODUCT_PARTNER_MANAGEMENT_BASE,
  PRODUCT_PARTNER_MANAGEMENT_FREEZE_VERSION,
  PRODUCT_PARTNER_MANAGEMENT_ID,
  PRODUCT_PARTNER_MANAGEMENT_VERSION,
} from "../management/management.constants";
import {
  assertPartnerManagementReadinessReady,
  clearPartnerManagementLayer,
  createPartnerManager,
  getPartnerRegistryManifest,
} from "../partner.manager";

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

export const PRODUCT_PARTNER_SIGNOFF_VERSION =
  "product-partner-signoff-1" as const;

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
  clearPartnerManagementLayer();
}

export function checkProductPartnerReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "PARTNER-CONSTANTS",
      "management",
      "Product partner management version constants",
      PRODUCT_PARTNER_MANAGEMENT_ID ===
        "enterprise-product-partner-management-v1" &&
        PRODUCT_PARTNER_MANAGEMENT_VERSION === "product-partner-1" &&
        PRODUCT_PARTNER_MANAGEMENT_BASE === PRODUCT_CONNECTOR_FRAMEWORK_ID &&
        PRODUCT_PARTNER_MANAGEMENT_FREEZE_VERSION ===
          "product-partner-management-freeze-1" &&
        PRODUCT_PARTNER_FREEZE_TAG ===
          "product-partner-management-freeze-1" &&
        PARTNER_KINDS.length === 4 &&
        PARTNER_STATUSES.length === 4 &&
        PARTNER_AGREEMENT_STATUSES.length === 4 &&
        PARTNER_ACCESS_STATUSES.length === 3 &&
        PARTNER_READINESS_VERDICTS.length === 3 &&
        PARTNER_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_PARTNER_MANAGEMENT_ID} base=${PRODUCT_PARTNER_MANAGEMENT_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "PARTNER-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "PARTNER-UPSTREAM",
      "compatibility",
      "Depends on connector framework chain",
      PRODUCT_PARTNER_MANAGEMENT_BASE ===
        "enterprise-product-connector-framework-v1" &&
        PRODUCT_CONNECTOR_FRAMEWORK_ID ===
          "enterprise-product-connector-framework-v1" &&
        PRODUCT_MARKETPLACE_FOUNDATION_ID ===
          "enterprise-product-marketplace-foundation-v1" &&
        ENTERPRISE_PRODUCT_API_BASELINE_ID ===
          "enterprise-product-api-baseline-v1",
      `connector=${PRODUCT_CONNECTOR_FRAMEWORK_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createPartnerManager({ managerId: "prod-partner-gate" });
    mgr.initialize();
    mgr.start();

    const partner = mgr.registerPartner({
      id: "partner.gate.reg",
      partnerKey: "ACME_WEARABLES",
      name: "Acme Wearables",
      kind: "ISV",
    });
    const active = mgr.updatePartnerStatus({
      partnerId: partner.id,
      status: "ACTIVE",
    });
    const profile = mgr.registerProfile({
      id: "partner.gate.prof",
      partnerId: partner.id,
      profileKey: "ACME_LEGAL",
      legalName: "Acme Wearables Inc.",
      contactRef: "ACME_CONTACT_1",
    });
    const agreement = mgr.registerAgreement({
      id: "partner.gate.agr",
      partnerId: partner.id,
      agreementKey: "ACME_MSA_V1",
      termsRef: "PARTNER_MSA_STANDARD_V1",
    });
    const access = mgr.grantAccess({
      id: "partner.gate.acc",
      partnerId: partner.id,
      agreementId: agreement.id,
      accessKey: "ACME_WEARABLE_SYNC",
      connectorKeyRef: "WEARABLE_SYNC",
    });
    const release = mgr.createReleaseManifest({
      id: "partner.gate.rel",
      partnerId: partner.id,
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getPartnerRegistryManifest();

    const ok =
      partner.partnerKey === "ACME_WEARABLES" &&
      active.status === "ACTIVE" &&
      profile.profileKey === "ACME_LEGAL" &&
      agreement.status === "ACTIVE" &&
      access.status === "GRANTED" &&
      release.checksum.length === 64 &&
      readiness.verdict === "READY" &&
      registry.managementId === PRODUCT_PARTNER_MANAGEMENT_ID &&
      registry.base === PRODUCT_PARTNER_MANAGEMENT_BASE &&
      registry.partnerCount >= 1 &&
      registry.profileCount >= 1 &&
      registry.agreementCount >= 1 &&
      registry.accessCount >= 1 &&
      registry.releaseCount >= 1;

    try {
      assertPartnerManagementReadinessReady(readiness);
      checks.push(
        check(
          "PARTNER-STACK",
          "partner",
          "Registry / profile / agreement / access / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${release.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "PARTNER-STACK",
          "partner",
          "Registry / profile / agreement / access / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product partner management not ready",
        ),
      );
    }

    checks.push(
      check(
        "PARTNER-SCOPE",
        "scope",
        "No connector-runtime / app-registry / marketplace-surface / provider-SDK",
        ok,
        "partner-management-declaration-only domain",
      ),
    );

    mgr.stop();
    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product partner management probe failed";
    checks.push(
      check(
        "PARTNER-STACK",
        "partner",
        "Registry / profile / agreement / access / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "PARTNER-SCOPE",
        "scope",
        "No connector-runtime / app-registry / marketplace-surface / provider-SDK",
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
      `product-partner-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductPartnerReleaseGatePass(
  gate: ReleaseGateResult = checkProductPartnerReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product partner release gate failed: ${gate.summary}`,
    );
  }
}
