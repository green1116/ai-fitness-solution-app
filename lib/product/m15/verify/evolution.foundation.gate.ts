/**
 * Product M15 — Enterprise Evolution Foundation Release Gate
 * MODULE: Enterprise Evolution Foundation (M15-P1)
 * BASE: enterprise-product-intelligence-baseline-v1
 */

import { buildPlatformV1Manifest } from "../../../platform/v1/platform.manifest";
import { ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID } from "../../m14/baseline/freeze/freeze.lock";
import {
  EVOLUTION_CAPABILITY_KINDS,
  EVOLUTION_CAPABILITY_STATUSES,
  EVOLUTION_DOMAIN_SCOPES,
  EVOLUTION_GOVERNANCE_POLICY_KINDS,
  EVOLUTION_GOVERNANCE_POLICY_STATUSES,
  EVOLUTION_PROGRESSION_MODES,
  EVOLUTION_READINESS_VERDICTS,
  EVOLUTION_TRACK_KINDS,
  EVOLUTION_TRACK_STATUSES,
  PRODUCT_EVOLUTION_FOUNDATION_BASE,
  PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_EVOLUTION_FOUNDATION_ID,
  PRODUCT_EVOLUTION_FOUNDATION_VERSION,
  PRODUCT_EVOLUTION_FREEZE_TAG,
} from "../foundation/evolution.constants";
import {
  assertEvolutionFoundationReadinessReady,
  buildEvolutionFoundationManifest,
  clearEvolutionFoundationLayer,
  evaluateEvolutionFoundationReadiness,
} from "../foundation/evolution.manifest";
import {
  getEvolutionFoundationMetadata,
  isEvolutionFoundationMetadataIntact,
  validateEvolutionTrack,
} from "../foundation/evolution.metadata";
import {
  registerEvolutionTrack,
  updateEvolutionTrackStatus,
} from "../foundation/evolution.registry";
import {
  registerEvolutionCapability,
  updateEvolutionCapabilityStatus,
} from "../foundation/capability.registry";
import { registerEvolutionGovernancePolicy } from "../foundation/governance.policy";
import { evaluateEvolutionProgressionContract } from "../foundation/progression.contract";

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

export const PRODUCT_EVOLUTION_FOUNDATION_SIGNOFF_VERSION =
  "product-evolution-foundation-signoff-1" as const;

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
  clearEvolutionFoundationLayer();
}

export function checkProductEvolutionFoundationReleaseGate(): ReleaseGateResult {
  const checks: GateCheckItem[] = [];
  const metadata = getEvolutionFoundationMetadata();

  checks.push(
    check(
      "EVO-CONSTANTS",
      "foundation",
      "Product evolution foundation version constants",
      PRODUCT_EVOLUTION_FOUNDATION_ID ===
        "enterprise-product-evolution-foundation-v1" &&
        PRODUCT_EVOLUTION_FOUNDATION_VERSION === "product-evolution-1" &&
        PRODUCT_EVOLUTION_FOUNDATION_BASE ===
          ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID &&
        PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION ===
          "product-evolution-foundation-freeze-1" &&
        PRODUCT_EVOLUTION_FREEZE_TAG ===
          "product-evolution-foundation-freeze-1" &&
        EVOLUTION_TRACK_KINDS.length === 6 &&
        EVOLUTION_TRACK_STATUSES.length === 4 &&
        EVOLUTION_CAPABILITY_KINDS.length === 6 &&
        EVOLUTION_CAPABILITY_STATUSES.length === 4 &&
        EVOLUTION_DOMAIN_SCOPES.length === 4 &&
        EVOLUTION_PROGRESSION_MODES.length === 3 &&
        EVOLUTION_GOVERNANCE_POLICY_KINDS.length === 4 &&
        EVOLUTION_GOVERNANCE_POLICY_STATUSES.length === 3 &&
        EVOLUTION_READINESS_VERDICTS.length === 3 &&
        isEvolutionFoundationMetadataIntact(metadata),
      `id=${PRODUCT_EVOLUTION_FOUNDATION_ID} base=${PRODUCT_EVOLUTION_FOUNDATION_BASE}`,
    ),
  );

  const platform = buildPlatformV1Manifest();
  checks.push(
    check(
      "EVO-PLATFORM",
      "platform-v1",
      "Platform v1 baseline aligned",
      platform.aligned === true,
      platform.summary,
    ),
  );

  checks.push(
    check(
      "EVO-UPSTREAM",
      "compatibility",
      "Depends on Intelligence baseline",
      PRODUCT_EVOLUTION_FOUNDATION_BASE ===
        "enterprise-product-intelligence-baseline-v1" &&
        ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID ===
          "enterprise-product-intelligence-baseline-v1",
      `intelligenceBaseline=${ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID}`,
    ),
  );

  try {
    cleanup();

    const track = registerEvolutionTrack({
      id: "evo.gate.track",
      trackKey: "EXECUTIVE_ADAPTATION_TRACK",
      kind: "ADAPT",
      scope: "DOMAIN",
      title: "Executive adaptation track",
      summary: "Declared adaptation track for domain evolution",
      intelligenceBaselineRef: ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID,
    });
    const active = updateEvolutionTrackStatus({
      trackId: track.id,
      status: "ACTIVE",
    });
    const validation = validateEvolutionTrack(active);
    const capability = registerEvolutionCapability({
      id: "evo.gate.cap",
      trackId: track.id,
      capabilityKey: "PLAN_DOMAIN_CYCLE",
      kind: "PLAN",
      summary: "Declared planning capability for domain cycles",
    });
    const declared = updateEvolutionCapabilityStatus({
      capabilityId: capability.id,
      status: "DECLARED",
    });
    const policy = registerEvolutionGovernancePolicy({
      id: "evo.gate.gov",
      policyKey: "ADAPT_ACCESS_CONTROL",
      kind: "ACCESS_CONTROL",
      title: "Adaptation track access control",
      trackKeyRef: track.trackKey,
      ruleRef: "EVO_RULE_INTERNAL_ONLY",
    });
    const contract = evaluateEvolutionProgressionContract({
      id: "evo.gate.prg",
      contractKey: "ADAPT_DOMAIN_LOOKUP",
      query: {
        queryKey: "DOMAIN_ADAPT_Q",
        mode: "DECLARED",
        kind: "ADAPT",
        capabilityKind: "PLAN",
        scope: "DOMAIN",
        trackKeys: [track.trackKey],
      },
    });
    const manifest = buildEvolutionFoundationManifest();
    const readiness = evaluateEvolutionFoundationReadiness();

    const ok =
      track.trackKey === "EXECUTIVE_ADAPTATION_TRACK" &&
      active.status === "ACTIVE" &&
      validation.ok === true &&
      declared.status === "DECLARED" &&
      policy.status === "ACTIVE" &&
      policy.trackKeyRef === "EXECUTIVE_ADAPTATION_TRACK" &&
      contract.hitCount >= 1 &&
      manifest.checksum.length === 64 &&
      readiness.verdict === "READY";

    try {
      assertEvolutionFoundationReadinessReady(readiness);
      checks.push(
        check(
          "EVO-STACK",
          "evolution-foundation",
          "Track / capability / governance / progression / manifest",
          ok,
          `readiness=${readiness.verdict} checksum=${manifest.checksum.slice(0, 12)}…`,
        ),
      );
    } catch (error) {
      checks.push(
        check(
          "EVO-STACK",
          "evolution-foundation",
          "Track / capability / governance / progression / manifest",
          false,
          error instanceof Error
            ? error.message
            : "product evolution foundation not ready",
        ),
      );
    }

    checks.push(
      check(
        "EVO-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / evolution execution / tool runtime",
        ok && metadata.declarationOnly === true,
        "evolution-foundation-declaration-only domain",
      ),
    );

    cleanup();
  } catch (error) {
    const detail =
      error instanceof Error
        ? error.message
        : "product evolution foundation probe failed";
    checks.push(
      check(
        "EVO-STACK",
        "evolution-foundation",
        "Track / capability / governance / progression / manifest",
        false,
        detail,
      ),
    );
    checks.push(
      check(
        "EVO-SCOPE",
        "scope",
        "No DB / vector / RAG / embedding / evolution execution / tool runtime",
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
      `product-evolution-foundation-gate result=${result}`,
      `pass=${passCount}/${checks.length}`,
      `fail=${failCount}`,
    ].join(" "),
  };
}

export function assertProductEvolutionFoundationReleaseGatePass(
  gate: ReleaseGateResult = checkProductEvolutionFoundationReleaseGate(),
): asserts gate is ReleaseGateResult & { result: "PASS" } {
  if (gate.result !== "PASS") {
    throw new Error(
      `Product evolution foundation release gate failed: ${gate.summary}`,
    );
  }
}
