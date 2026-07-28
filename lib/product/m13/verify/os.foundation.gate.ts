/**
 * Product M13 — Enterprise Operating System Foundation Release Gate
 * MODULE: Enterprise Operating System Foundation (M13-P1)
 * BASE: enterprise-product-agent-baseline-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_AGENT_BASELINE_ID } from "../../m12/baseline/freeze/freeze.lock";
import {
  OS_CAPABILITY_KINDS,
  OS_CAPABILITY_STATUSES,
  OS_DOMAIN_SCOPES,
  OS_GOVERNANCE_POLICY_KINDS,
  OS_GOVERNANCE_POLICY_STATUSES,
  OS_OPERATION_MODES,
  OS_READINESS_VERDICTS,
  OS_SURFACE_KINDS,
  OS_SURFACE_STATUSES,
  PRODUCT_OS_FOUNDATION_BASE,
  PRODUCT_OS_FOUNDATION_FREEZE_VERSION,
  PRODUCT_OS_FOUNDATION_ID,
  PRODUCT_OS_FOUNDATION_VERSION,
  PRODUCT_OS_FREEZE_TAG,
} from "../foundation/os.constants";
import {
  assertOsFoundationReadinessReady,
  buildOsFoundationManifest,
  clearOsFoundationLayer,
  evaluateOsFoundationReadiness,
} from "../foundation/os.manifest";
import {
  getOsFoundationMetadata,
  isOsFoundationMetadataIntact,
  validateOsSurface,
} from "../foundation/os.metadata";
import {
  registerOsSurface,
  updateOsSurfaceStatus,
} from "../foundation/os.registry";
import {
  registerOsCapability,
  updateOsCapabilityStatus,
} from "../foundation/capability.registry";
import { registerOsGovernancePolicy } from "../foundation/governance.policy";
import { evaluateOsOperationContract } from "../foundation/operation.contract";

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

export const PRODUCT_OS_FOUNDATION_SIGNOFF_VERSION =
  "product-os-foundation-signoff-1" as const;

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
  clearOsFoundationLayer();
}

export function checkProductOsFoundationReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getOsFoundationMetadata();

  checks.push(
    check(
      "OS-CONSTANTS",
      "foundation",
      "Product OS foundation version constants",
      PRODUCT_OS_FOUNDATION_ID === "enterprise-product-os-foundation-v1" &&
        PRODUCT_OS_FOUNDATION_VERSION === "product-os-1" &&
        PRODUCT_OS_FOUNDATION_BASE === ENTERPRISE_PRODUCT_AGENT_BASELINE_ID &&
        PRODUCT_OS_FOUNDATION_FREEZE_VERSION ===
          "product-os-foundation-freeze-1" &&
        PRODUCT_OS_FREEZE_TAG === "product-os-foundation-freeze-1" &&
        OS_SURFACE_KINDS.length === 6 &&
        OS_SURFACE_STATUSES.length === 4 &&
        OS_CAPABILITY_KINDS.length === 6 &&
        OS_CAPABILITY_STATUSES.length === 4 &&
        OS_DOMAIN_SCOPES.length === 4 &&
        OS_OPERATION_MODES.length === 3 &&
        OS_GOVERNANCE_POLICY_KINDS.length === 4 &&
        OS_GOVERNANCE_POLICY_STATUSES.length === 3 &&
        OS_READINESS_VERDICTS.length === 3 &&
        isOsFoundationMetadataIntact(metadata),
      `id=${PRODUCT_OS_FOUNDATION_ID} base=${PRODUCT_OS_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "OS-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "OS-UPSTREAM",
      "compatibility",
      "Depends on agent baseline",
      PRODUCT_OS_FOUNDATION_BASE ===
        "enterprise-product-agent-baseline-v1" &&
        ENTERPRISE_PRODUCT_AGENT_BASELINE_ID ===
          "enterprise-product-agent-baseline-v1",
      `agentBaseline=${ENTERPRISE_PRODUCT_AGENT_BASELINE_ID}`,
    ),
  );

  try {
    cleanup();

    const surface = registerOsSurface({
      id: "os.gate.surf",
      surfaceKey: "DOMAIN_CONTROL_PLANE",
      kind: "CONTROL",
      scope: "DOMAIN",
      title: "Domain control plane surface",
      summary: "Declared control surface for domain operations",
      agentBaselineRef: ENTERPRISE_PRODUCT_AGENT_BASELINE_ID,
    });
    const active = updateOsSurfaceStatus({
      surfaceId: surface.id,
      status: "ACTIVE",
    });
    const validation = validateOsSurface(active);
    const capability = registerOsCapability({
      id: "os.gate.cap",
      surfaceId: surface.id,
      capabilityKey: "ORCHESTRATE_DOMAIN_CYCLE",
      kind: "ORCHESTRATE",
      summary: "Declared orchestration capability for domain cycles",
    });
    const declared = updateOsCapabilityStatus({
      capabilityId: capability.id,
      status: "DECLARED",
    });
    const policy = registerOsGovernancePolicy({
      id: "os.gate.gov",
      policyKey: "CONTROL_ACCESS_CONTROL",
      kind: "ACCESS_CONTROL",
      title: "Control surface access control",
      surfaceKeyRef: surface.surfaceKey,
      ruleRef: "OS_RULE_INTERNAL_ONLY",
    });
    const contract = evaluateOsOperationContract({
      id: "os.gate.op",
      contractKey: "CONTROL_DOMAIN_LOOKUP",
      query: {
        queryKey: "DOMAIN_CONTROL_Q",
        mode: "DECLARED",
        kind: "CONTROL",
        capabilityKind: "ORCHESTRATE",
        scope: "DOMAIN",
        surfaceKeys: [surface.surfaceKey],
      },
    });
    const manifest = buildOsFoundationManifest();
    const readiness = evaluateOsFoundationReadiness();

    const ok =
      surface.surfaceKey === "DOMAIN_CONTROL_PLANE" &&
      active.status === "ACTIVE" &&
      validation.ok === true &&
      declared.status === "DECLARED" &&
      policy.status === "ACTIVE" &&
      policy.surfaceKeyRef === "DOMAIN_CONTROL_PLANE" &&
      contract.hitCount >= 1 &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertOsFoundationReadinessReady(readiness);
      checks.push(
        check(
          "OS-STACK",
          "os-foundation",
          "Surface / capability / governance / operation / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "OS-STACK",
          "os-foundation",
          "Surface / capability / governance / operation / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product os foundation not ready",
        ),
      );
    }

    checks.push(
      check(
        "OS-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / OS execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "os-foundation-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product os foundation probe failed";
    checks.push(
      check(
        "OS-STACK",
        "os-foundation",
        "Surface / capability / governance / operation / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "OS-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / OS execution / tool runtime",
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
      `product-os-foundation-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductOsFoundationReleaseGatePass(
  gate: ReleaseGateResult = checkProductOsFoundationReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product OS foundation release gate failed: ${gate.summary}`,
    );
  }
}
