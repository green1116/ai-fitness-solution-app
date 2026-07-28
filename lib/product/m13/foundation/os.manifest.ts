/**
 * Product M13 — Enterprise Operating System Foundation manifest builder
 */

import { createHash } from "node:crypto";

import { ENTERPRISE_PRODUCT_AGENT_BASELINE_ID } from "../../m12/baseline/freeze/freeze.lock";
import {
  PRODUCT_OS_FOUNDATION_BASE,
  PRODUCT_OS_FOUNDATION_FREEZE_VERSION,
  PRODUCT_OS_FOUNDATION_ID,
  PRODUCT_OS_FOUNDATION_VERSION,
} from "./os.constants";
import {
  getOsFoundationMetadata,
  validateOsSurface,
} from "./os.metadata";
import { clearOsSurfaces, listOsSurfaces } from "./os.registry";
import type {
  OsFoundationManifest,
  OsReadinessCheck,
  OsReadinessResult,
} from "./os.types";
import {
  clearOsCapabilities,
  listOsCapabilities,
} from "./capability.registry";
import {
  clearOsGovernancePolicies,
  listOsGovernancePolicies,
} from "./governance.policy";
import {
  clearOsOperationContracts,
  listOsOperationContracts,
} from "./operation.contract";

function nowIso(): string {
  return new Date().toISOString();
}

function check(
  id: string,
  component: string,
  label: string,
  ok: boolean,
  detail: string,
): OsReadinessCheck {
  return { id, component, label, ok, detail };
}

export function clearOsFoundationLayer(): void {
  clearOsOperationContracts();
  clearOsGovernancePolicies();
  clearOsCapabilities();
  clearOsSurfaces();
}

export function buildOsFoundationManifest(): OsFoundationManifest {
  const surfaces = listOsSurfaces();
  const capabilities = listOsCapabilities();
  const policies = listOsGovernancePolicies();
  const contracts = listOsOperationContracts();
  const metadata = getOsFoundationMetadata();
  const active = surfaces.filter((s) => s.status === "ACTIVE");

  const payload = {
    foundationId: PRODUCT_OS_FOUNDATION_ID,
    version: PRODUCT_OS_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_OS_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_OS_FOUNDATION_BASE,
    module: metadata.module,
    declarationOnly: metadata.declarationOnly,
    surfaces: surfaces.map((s) => ({
      surfaceKey: s.surfaceKey,
      kind: s.kind,
      status: s.status,
      scope: s.scope,
      agentBaselineRef: s.agentBaselineRef,
    })),
    capabilities: capabilities.map((c) => ({
      capabilityKey: c.capabilityKey,
      kind: c.kind,
      status: c.status,
      surfaceId: c.surfaceId,
    })),
    policies: policies.map((p) => ({
      policyKey: p.policyKey,
      kind: p.kind,
      status: p.status,
      surfaceKeyRef: p.surfaceKeyRef,
    })),
    contracts: contracts.map((c) => ({
      contractKey: c.contractKey,
      mode: c.query.mode,
      hitCount: c.hitCount,
    })),
  };

  return {
    foundationId: PRODUCT_OS_FOUNDATION_ID,
    version: PRODUCT_OS_FOUNDATION_VERSION,
    freezeVersion: PRODUCT_OS_FOUNDATION_FREEZE_VERSION,
    base: PRODUCT_OS_FOUNDATION_BASE,
    surfaceCount: surfaces.length,
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

export function evaluateOsFoundationReadiness(): OsReadinessResult {
  const checks: OsReadinessCheck[] = [];
  const metadata = getOsFoundationMetadata();
  const surfaces = listOsSurfaces();
  const capabilities = listOsCapabilities();
  const policies = listOsGovernancePolicies();
  const contracts = listOsOperationContracts();
  const manifest = buildOsFoundationManifest();
  const surfacesValid = surfaces.every((s) => validateOsSurface(s).ok);

  checks.push(
    check(
      "OS-BASE",
      "foundation",
      "agent baseline aligned",
      PRODUCT_OS_FOUNDATION_BASE === ENTERPRISE_PRODUCT_AGENT_BASELINE_ID &&
        ENTERPRISE_PRODUCT_AGENT_BASELINE_ID ===
          "enterprise-product-agent-baseline-v1",
      `base=${PRODUCT_OS_FOUNDATION_BASE}`,
    ),
  );

  checks.push(
    check(
      "OS-META",
      "metadata",
      "OS foundation metadata declaration-only",
      metadata.declarationOnly === true && metadata.excludes.length === 8,
      `module=${metadata.module}`,
    ),
  );

  checks.push(
    check(
      "OS-SURF",
      "surface",
      "Active operating surfaces present and valid",
      surfaces.some((s) => s.status === "ACTIVE") && surfacesValid,
      `surfaces=${surfaces.length}`,
    ),
  );

  checks.push(
    check(
      "OS-CAP",
      "capability",
      "Declared capabilities present",
      capabilities.some((c) => c.status === "DECLARED"),
      `capabilities=${capabilities.length}`,
    ),
  );

  checks.push(
    check(
      "OS-GOV",
      "governance",
      "Active governance policies present",
      policies.some((p) => p.status === "ACTIVE"),
      `policies=${policies.length}`,
    ),
  );

  checks.push(
    check(
      "OS-OP",
      "operation",
      "Operation contracts with hits present",
      contracts.some((c) => c.hitCount >= 1),
      `contracts=${contracts.length}`,
    ),
  );

  checks.push(
    check(
      "OS-MAN",
      "manifest",
      "OS foundation manifest checksum intact",
      manifest.checksum.length === 64 &&
        manifest.foundationId === PRODUCT_OS_FOUNDATION_ID &&
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
    summary: `product-os-foundation readiness ${verdict.toLowerCase()}: pass=${passCount} fail=${failCount}`,
    evaluatedAt: nowIso(),
  };
}

export function assertOsFoundationReadinessReady(
  result: OsReadinessResult,
): asserts result is OsReadinessResult & { verdict: "READY" } {
  if (result.verdict !== "READY") {
    throw new Error(`product os foundation not ready: ${result.summary}`);
  }
}
