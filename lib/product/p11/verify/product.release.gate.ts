/**
 * Product P11 — Commercial Release Release Gate
 * BASE: enterprise-product-p10-subscription-billing-v1
 * Isolated — product layer only
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { E12_PRODUCTIZATION_COMPLETE_ID } from "../../e12/signoff/governance.freeze.lock";
import { ENTERPRISE_LAUNCH_COMPLETE_ID } from "../../../launch/signoff/governance.freeze.lock";
import { ENTERPRISE_EVOLUTION_COMPLETE_ID } from "../../../evolution/signoff/governance.freeze.lock";
import { ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID } from "../../../commercialization/p8/freeze/freeze.lock";
import { ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID } from "../../../launch/readiness/l5/freeze/freeze.lock";
import { ENTERPRISE_OPERATIONS_COMPLETE_ID } from "../../../operations/o5/freeze/freeze.lock";
import { PRODUCT_P10_SUBSCRIPTION_BILLING_ID } from "../../p10/subscription/subscription.constants";
import {
  DEPLOYMENT_STATUSES,
  ENVIRONMENT_KINDS,
  FEATURE_FLAGS,
  LICENSE_STATUSES,
  P11_MANAGER_STATUSES,
  P11_READINESS_VERDICTS,
  PRODUCT_P11_COMMERCIAL_FREEZE_VERSION,
  PRODUCT_P11_COMMERCIAL_RELEASE_BASE,
  PRODUCT_P11_COMMERCIAL_RELEASE_FREEZE_VERSION,
  PRODUCT_P11_COMMERCIAL_RELEASE_ID,
  PRODUCT_P11_COMMERCIAL_RELEASE_VERSION,
  RELEASE_STATUSES,
  TENANT_STATUSES,
  VERSION_CHANNELS,
} from "../release/release.constants";
import {
  assertP11CommercialReleaseReadinessReady,
  clearP11CommercialReleaseLayer,
  createP11CommercialManager,
  getP11RegistryManifest,
} from "../commercial.manager";

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

export const PRODUCT_P11_SIGNOFF_VERSION = "product-p11-signoff-1" as const;

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
  clearP11CommercialReleaseLayer();
}

export function checkProductP11ReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];

  checks.push(
    check(
      "P11-CONSTANTS",
      "release",
      "Product P11 commercial release version constants",
      PRODUCT_P11_COMMERCIAL_RELEASE_ID ===
        "enterprise-product-p11-commercial-release-v1" &&
        PRODUCT_P11_COMMERCIAL_RELEASE_VERSION === "product-p11-1" &&
        PRODUCT_P11_COMMERCIAL_RELEASE_BASE ===
          PRODUCT_P10_SUBSCRIPTION_BILLING_ID &&
        PRODUCT_P11_COMMERCIAL_RELEASE_FREEZE_VERSION ===
          "product-p11-commercial-release-freeze-1" &&
        PRODUCT_P11_COMMERCIAL_FREEZE_VERSION ===
          "product-p11-commercial-release-freeze-1" &&
        RELEASE_STATUSES.length === 5 &&
        FEATURE_FLAGS.length === 4 &&
        VERSION_CHANNELS.length === 4 &&
        TENANT_STATUSES.length === 4 &&
        ENVIRONMENT_KINDS.length === 4 &&
        DEPLOYMENT_STATUSES.length === 5 &&
        LICENSE_STATUSES.length === 4 &&
        P11_READINESS_VERDICTS.length === 3 &&
        P11_MANAGER_STATUSES.length === 4,
      `id=${PRODUCT_P11_COMMERCIAL_RELEASE_ID} base=${PRODUCT_P11_COMMERCIAL_RELEASE_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "P11-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "P11-P10-BASE",
      "product-p10",
      "P10 subscription & billing BASE preserved",
      PRODUCT_P11_COMMERCIAL_RELEASE_BASE ===
        "enterprise-product-p10-subscription-billing-v1" &&
        ENTERPRISE_OPERATIONS_COMPLETE_ID ===
          "enterprise-operations-complete-v1" &&
        ENTERPRISE_LAUNCH_READINESS_COMPLETE_ID ===
          "enterprise-launch-readiness-complete-v1" &&
        ENTERPRISE_COMMERCIALIZATION_COMPLETE_ID ===
          "enterprise-commercialization-complete-v1",
      `base=${PRODUCT_P11_COMMERCIAL_RELEASE_BASE}`,
    ),
  );

  checks.push(
    check(
      "P11-UPSTREAM",
      "baselines",
      "Evolution / launch / E12 baselines preserved",
      ENTERPRISE_EVOLUTION_COMPLETE_ID ===
        "enterprise-evolution-complete-v1" &&
        ENTERPRISE_LAUNCH_COMPLETE_ID === "enterprise-launch-complete-v1" &&
        E12_PRODUCTIZATION_COMPLETE_ID ===
          "enterprise-e12-productization-complete-v1",
      `evolution=${ENTERPRISE_EVOLUTION_COMPLETE_ID}`,
    ),
  );

  try {
    cleanup();
    const mgr = createP11CommercialManager({ managerId: "prod-p11-gate" });
    mgr.initialize();
    mgr.start();

    const release = mgr.createRelease({
      id: "p11.gate.rel",
      subscriptionRef: "p10.gate.sub",
      name: "Acme Commercial GA",
      owner: "release.ops",
    });
    mgr.updateReleaseStatus({
      releaseId: release.id,
      status: "STAGED",
    });
    const feature = mgr.registerFeature({
      id: "p11.gate.ft",
      releaseId: release.id,
      code: "ai-coach-console",
      name: "AI Coach Console",
      flag: "BETA",
    });
    mgr.updateFeatureFlag({
      featureId: feature.id,
      flag: "GA",
    });
    const version = mgr.publishVersion({
      id: "p11.gate.ver",
      releaseId: release.id,
      semver: "1.0.0",
      channel: "STABLE",
      notes: "Initial commercial GA",
    });
    const tenant = mgr.provisionTenant({
      id: "p11.gate.tnt",
      releaseId: release.id,
      slug: "acme-fitness",
      name: "Acme Fitness",
    });
    const environment = mgr.createEnvironment({
      id: "p11.gate.env",
      releaseId: release.id,
      kind: "PRODUCTION",
      name: "Acme Prod",
      region: "ap-southeast-1",
    });
    const deployment = mgr.startDeployment({
      id: "p11.gate.dep",
      releaseId: release.id,
      environmentId: environment.id,
      versionId: version.id,
    });
    mgr.completeDeployment({
      deploymentId: deployment.id,
      status: "SUCCEEDED",
    });
    const license = mgr.issueLicense({
      id: "p11.gate.lic",
      releaseId: release.id,
      tenantId: tenant.id,
      seats: 50,
    });
    mgr.activateLicense({
      licenseId: license.id,
    });
    mgr.updateReleaseStatus({
      releaseId: release.id,
      status: "LIVE",
    });

    const readiness = mgr.evaluateReadiness();
    const registry = getP11RegistryManifest();

    const ok =
      readiness.verdict === "READY" &&
      registry.foundationId === PRODUCT_P11_COMMERCIAL_RELEASE_ID &&
      registry.base === PRODUCT_P11_COMMERCIAL_RELEASE_BASE &&
      registry.releaseCount >= 1 &&
      registry.featureCount >= 1 &&
      registry.versionCount >= 1 &&
      registry.tenantCount >= 1 &&
      registry.environmentCount >= 1 &&
      registry.deploymentCount >= 1 &&
      registry.licenseCount >= 1;

    try {
      assertP11CommercialReleaseReadinessReady(readiness);
      checks.push(
        check(
          "P11-STACK",
          "release",
          "Release / feature / version / tenant / environment / deployment / license",
          ok,
          `readiness=${readiness.verdict} deployments=${registry.deploymentCount}`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "P11-STACK",
          "release",
          "Release / feature / version / tenant / environment / deployment / license",
          false,
          error instanceof Error
            ? error.message
            : "p11 commercial release not ready",
        ),
      );
    }

    mgr.stop();
    cleanup();
  } catch (error) {
    checks.push(
      check(
        "P11-STACK",
        "release",
        "Release / feature / version / tenant / environment / deployment / license",
        false,
        error instanceof Error
          ? error.message
          : "p11 commercial release probe failed",
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
      `product-p11-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductP11ReleaseGatePass(
  gate: ReleaseGateResult = checkProductP11ReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(`Product P11 release gate failed: ${gate.summary}`);
  }
}
