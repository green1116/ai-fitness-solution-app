/**
 * Product M15 — Enterprise Evolution Foundation manifest builder
 */

import { createHash } from "node:crypto";

import { ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID } from "../../m14/baseline/freeze/freeze.lock";
import {
  PRODUCT_EVOLUTION_FOUNDATION_BASE,
  PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION,
  PRODUCT_EVOLUTION_FOUNDATION_ID,
  PRODUCT_EVOLUTION_FOUNDATION_VERSION,
} from "./evolution.constants";
import {
  getEvolutionFoundationMetadata,
  validateEvolutionTrack,
} from "./evolution.metadata";
import {
  clearEvolutionTracks,
  listEvolutionTracks,
} from "./evolution.registry";
import type {
  EvolutionFoundationManifest,
  EvolutionReadinessCheck,
  EvolutionReadinessResult,
} from "./evolution.types";
import {
  clearEvolutionCapabilities,
  listEvolutionCapabilities,
} from "./capability.registry";
import {
  clearEvolutionGovernancePolicies,
  listEvolutionGovernancePolicies,
} from "./governance.policy";
import {
  clearEvolutionProgressionContracts,
  listEvolutionProgressionContracts,
} from "./progression.contract";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): EvolutionReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearEvolutionFoundationLayer(): void {
  clearEvolutionProgressionContracts();
  clearEvolutionGovernancePolicies();
  clearEvolutionCapabilities();
  clearEvolutionTracks();
}

export function buildEvolutionFoundationManifest(): EvolutionFoundationManifest {
  const tracks = listEvolutionTracks();
  const capabilities = listEvolutionCapabilities();
  const policies = listEvolutionGovernancePolicies();
  const contracts = listEvolutionProgressionContracts();
  const metadata = getEvolutionFoundationMetadata();
  const active = tracks.filter((t) => t.status === "ACTIVE");

  const payload = {
    foundationId: PRODUCT_EVOLUTION_FOUNDATION_ID,
    version: PRODUCT_EVOLUTION_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_FOUNDATION_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    tracks: tracks.map((t) => ({
      trackKey: t.trackKey,
      kind: t.kind,
      status: t.status,
      scope: t.scope,
      intelligenceBaselineRef: t.intelligenceBaselineRef,
    })),
    capabilities: capabilities.map((c) => ({
      capabilityKey: c.capabilityKey,
      kind: c.kind,
      status: c.status,
      trackId: c.trackId,
    })),
    policies: policies.map((p) => ({
      policyKey: p.policyKey,
      kind: p.kind,
      status: p.status,
      trackKeyRef: p.trackKeyRef,
    })),
    contracts: contracts.map((c) => ({
      contractKey: c.contractKey,
      mode: c.query.mode,
      hitCount: c.hitCount,
    })),
  };

  return {
    foundationId: PRODUCT_EVOLUTION_FOUNDATION_ID,
    version: PRODUCT_EVOLUTION_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_EVOLUTION_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_EVOLUTION_FOUNDATION_BASE,
    trackCount: tracks.length,
    activeCount: active.length,
    capabilityCount: capabilities.length,
    policyCount: policies.length,
    contractCount: contracts.length,
    checksum: createHash("sha256")
      .update(JSON.stringify(payload))
      .digest("hex"),
    createdAt: nowIso(),
  };
}

export function evaluateEvolutionFoundationReadiness(): EvolutionReadinessResult {
  const checks: EvolutionReadinessCheck[] = [];
  const metadata = getEvolutionFoundationMetadata();
  const tracks = listEvolutionTracks();
  const capabilities = listEvolutionCapabilities();
  const policies = listEvolutionGovernancePolicies();
  const contracts = listEvolutionProgressionContracts();
  const manifest = buildEvolutionFoundationManifest();
  const tracksValid = tracks.every((t) => validateEvolutionTrack(t).ok);

  checks.push(
    check(
      "EVO-BASE",
      "foundation",
      "intelligence baseline aligned",
      PRODUCT_EVOLUTION_FOUNDATION_BASE ===
        ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID &&
        ENTERPRISE_PRODUCT_INTELLIGENCE_BASELINE_ID ===
          "enterprise-product-intelligence-baseline-v1",
      `base=${PRODUCT_EVOLUTION_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "EVO-META",
      "metadata",
      "Evolution foundation metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 8,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "EVO-TRACK",
      "track",
      "Active evolution tracks present and valid",
      tracks.some((t) => t.status === "ACTIVE") && tracksValid,
      `tracks=${tracks.length}`,
    ),
  );

  checks.push(
    check(
      "EVO-CAP",
      "capability",
      "Declared capabilities present",
      capabilities.some((c) => c.status === "DECLARED"),
      `capabilities=${capabilities.length}`,
    ),
  );

  checks.push(
    check(
      "EVO-GOV",
      "governance",
      "Active governance policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "EVO-PRG",
      "progression",
      "Progression contracts with hits present",
      contracts.some((c) => c.hitCount >= 1),
      `contracts=${contracts.length}`,
    ),
  );

  checks.push(
    check(
      "EVO-MAN",
      "manifest",
      "Evolution foundation manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.foundationId === PRODUCT_EVOLUTION_FOUNDATION_ID &&
        manifest.activeCount >= 1 &&
        manifest.capabilityCount >= 1 &&
        manifest.policyCount >= 1 &&
        manifest.contractCount >= 1,
      `checksum=${manifest.checksum.slice(0, 12)}…`,
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
    summary: `product-evolution-foundation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertEvolutionFoundationReadinessReady(
  result: EvolutionReadinessResult,
): asserts result is EvolutionReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(
      `product evolution foundation not ready: ${result.summary}`,
    );
  }
}
