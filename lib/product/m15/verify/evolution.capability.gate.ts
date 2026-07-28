/**
 * Product M15 â€?Evolution Capability Evolution Release Gate
 * MODULE: Enterprise Evolution Capability (M15-P6)
 * BASE: enterprise-product-evolution-optimization-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { PRODUCT_EVOLUTION_OPTIMIZATION_ID } from "../optimization-runtime/optimization.constants";
import {
  EVOLUTION_CAPABILITY_ADVANCEMENT_MODES,
  EVOLUTION_CAPABILITY_DOMAIN_SCOPES,
  EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_CAPABILITY_SPEC_KINDS,
  EVOLUTION_CAPABILITY_READINESS_VERDICTS,
  EVOLUTION_CAPABILITY_REVISION_KINDS,
  EVOLUTION_CAPABILITY_REVISION_STATUSES,
  EVOLUTION_CAPABILITY_SPEC_STATUSES,
  PRODUCT_EVOLUTION_CAPABILITY_BASE,
  PRODUCT_EVOLUTION_CAPABILITY_FREEZE_TAG,
  PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION,
  PRODUCT_EVOLUTION_CAPABILITY_ID,
  PRODUCT_EVOLUTION_CAPABILITY_VERSION,
} from "../capability-runtime/capability.constants";
import {
  assertEvolutionCapabilityReadinessReady,
  buildEvolutionCapabilityManifest,
  clearEvolutionCapabilityRuntimeLayer,
  evaluateEvolutionCapabilityReadiness,
} from "../capability-runtime/capability.manifest";
import {
  getEvolutionCapabilityRuntimeMetadata,
  isEvolutionCapabilityRuntimeMetadataIntact,
  validateEvolutionCapabilitySpec,
} from "../capability-runtime/capability.metadata";
import {
  registerEvolutionCapabilitySpec,
  updateEvolutionCapabilitySpecStatus,
} from "../capability-runtime/capability.registry";
import {
  registerEvolutionCapabilityRevision,
  updateEvolutionCapabilityRevisionStatus,
} from "../capability-runtime/revision.registry";
import { registerEvolutionCapabilityGovernancePolicy } from "../capability-runtime/governance.policy";
import { evaluateEvolutionCapabilityAdvancementContract } from "../capability-runtime/advancement.contract";

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

export const PRODUCT_EVOLUTION_CAPABILITY_SIGNOFF_VERSION =
  "product-evolution-capability-signoff-1" as const;

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
  clearEvolutionCapabilityRuntimeLayer();
}

export function checkProductEvolutionCapabilityReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getEvolutionCapabilityRuntimeMetadata();

  checks.push(
    check(
      "EVOCAP-CONSTANTS",
      "capability",
      "Product evolution capability version constants",
      PRODUCT_EVOLUTION_CAPABILITY_ID ===
        "enterprise-product-evolution-capability-v1" &&
        PRODUCT_EVOLUTION_CAPABILITY_VERSION ===
          "product-evolution-capability-1" &&
        PRODUCT_EVOLUTION_CAPABILITY_BASE ===
          PRODUCT_EVOLUTION_OPTIMIZATION_ID &&
        PRODUCT_EVOLUTION_CAPABILITY_FREEZE_VERSION ===
          "product-evolution-capability-freeze-1" &&
        PRODUCT_EVOLUTION_CAPABILITY_FREEZE_TAG ===
          "product-evolution-capability-freeze-1" &&
        EVOLUTION_CAPABILITY_SPEC_KINDS.length === 6 &&
        EVOLUTION_CAPABILITY_SPEC_STATUSES.length === 4 &&
        EVOLUTION_CAPABILITY_REVISION_KINDS.length === 6 &&
        EVOLUTION_CAPABILITY_REVISION_STATUSES.length === 4 &&
        EVOLUTION_CAPABILITY_DOMAIN_SCOPES.length === 4 &&
        EVOLUTION_CAPABILITY_ADVANCEMENT_MODES.length === 3 &&
        EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_KINDS.length === 4 &&
        EVOLUTION_CAPABILITY_GOVERNANCE_POLICY_STATUSES.length === 3 &&
        EVOLUTION_CAPABILITY_READINESS_VERDICTS.length === 3 &&
        isEvolutionCapabilityRuntimeMetadataIntact(metadata),
      `id=${PRODUCT_EVOLUTION_CAPABILITY_ID} base=${PRODUCT_EVOLUTION_CAPABILITY_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "EVOCAP-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "EVOCAP-UPSTREAM",
      "compatibility",
      "Depends on Evolution optimization chain",
      PRODUCT_EVOLUTION_CAPABILITY_BASE ===
        "enterprise-product-evolution-optimization-v1" &&
        PRODUCT_EVOLUTION_OPTIMIZATION_ID ===
          "enterprise-product-evolution-optimization-v1",
      `optimization=${PRODUCT_EVOLUTION_OPTIMIZATION_ID}`,
    ),
  );

  try {
    cleanup();

    const capability = registerEvolutionCapabilitySpec({
      id: "evocap.gate.spec",
      capabilityKey: "DOMAIN_CORE_CAPABILITY",
      kind: "CORE",
      scope: "DOMAIN",
      title: "Domain core capability",
      summary: "Declared core capability for domain advancement",
      optimizationRef: PRODUCT_EVOLUTION_OPTIMIZATION_ID,
    });
    const active = updateEvolutionCapabilitySpecStatus({
      capabilityId: capability.id,
      status: "ACTIVE",
    });
    const validation = validateEvolutionCapabilitySpec(active);
    const revision = registerEvolutionCapabilityRevision({
      id: "evocap.gate.rev",
      capabilityId: capability.id,
      revisionKey: "ADVANCE_DOMAIN_CORE",
      kind: "ADVANCE",
      summary: "Declared advance revision for domain core capability",
    });
    const declared = updateEvolutionCapabilityRevisionStatus({
      revisionId: revision.id,
      status: "DECLARED",
    });
    const policy = registerEvolutionCapabilityGovernancePolicy({
      id: "evocap.gate.gov",
      policyKey: "CORE_ACCESS_CONTROL",
      kind: "ACCESS_CONTROL",
      title: "Core capability access control",
      capabilityKeyRef: capability.capabilityKey,
      ruleRef: "EVOCAP_RULE_INTERNAL_ONLY",
    });
    const contract = evaluateEvolutionCapabilityAdvancementContract({
      id: "evocap.gate.adv",
      contractKey: "CORE_DOMAIN_LOOKUP",
      query: {
        queryKey: "DOMAIN_CORE_Q",
        mode: "DECLARED",
        kind: "CORE",
        revisionKind: "ADVANCE",
        scope: "DOMAIN",
        capabilityKeys: [capability.capabilityKey],
      },
    });
    const manifest = buildEvolutionCapabilityManifest();
    const readiness = evaluateEvolutionCapabilityReadiness();

    const ok =
      capability.capabilityKey === "DOMAIN_CORE_CAPABILITY" &&
      active.status === "ACTIVE" &&
      validation.ok === true &&
      declared.status === "DECLARED" &&
      policy.status === "ACTIVE" &&
      policy.capabilityKeyRef === "DOMAIN_CORE_CAPABILITY" &&
      contract.hitCount >= 1 &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertEvolutionCapabilityReadinessReady(readiness);
      checks.push(
        check(
          "EVOCAP-STACK",
          "evolution-capability",
          "Capability / revision / governance / advancement / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}â€¦`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "EVOCAP-STACK",
          "evolution-capability",
          "Capability / revision / governance / advancement / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product evolution capability not ready",
        ),
      );
    }

    checks.push(
      check(
        "EVOCAP-SCOPE",
        "scope",
        "No DB / deployment / execution / runtime activation / tool runtime",
        ok &&
          metadata.declarationOnly === true &&
          metadata.excludes.includes("deployment-runtime") &&
          metadata.excludes.includes("execution-runtime") &&
          metadata.excludes.includes("activation-runtime"),
        "evolution-capability-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product evolution capability probe failed";
    checks.push(
      check(
        "EVOCAP-STACK",
        "evolution-capability",
        "Capability / revision / governance / advancement / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "EVOCAP-SCOPE",
        "scope",
        "No DB / deployment / execution / runtime activation / tool runtime",
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
      `product-evolution-capability-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductEvolutionCapabilityReleaseGatePass(
  gate: ReleaseGateResult = checkProductEvolutionCapabilityReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product evolution capability release gate failed: ${gate.summary}`,
    );
  }
}
