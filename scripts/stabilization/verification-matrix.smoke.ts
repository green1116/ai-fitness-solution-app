/**
 * V3.7 RC1 — Verification matrix (read-only aggregation)
 */
import { runCommercialClosureFoundation, runCommercialV37ClosureFoundation } from "../../lib/commercialization/closure";
import { runCommercialProductFoundation } from "../../lib/commercialization/product";
import { runCommercialCommerceFoundation } from "../../lib/commercialization/commerce";
import { runCommercialOperationsFoundation } from "../../lib/commercialization/operations";
import { runCommercialPortalFoundation } from "../../lib/commercialization/portal";
import { runCommercialV37SupportFoundation } from "../../lib/commercialization/support";
import { runCommercialV37FinalFoundation } from "../../lib/commercialization/final";
import { runCommercialV37PhaseClosureFoundation, EXPECTED_V37_PHASE_HOOKS } from "../../lib/commercialization/v37";
import { runCommercialV37LaunchFoundation } from "../../lib/commercialization/launch";
import { runCommercialV37OperatingFoundation } from "../../lib/commercialization/operations-v37";
import { runCommercialV37SunsetFoundation } from "../../lib/commercialization/sunset";
import { runCommercialV37ArchiveFoundation } from "../../lib/commercialization/archive";
import { runCommercialV37LegacyFoundation } from "../../lib/commercialization/legacy";
import { runCommercialV37AtlasFoundation } from "../../lib/commercialization/atlas";
import { assertHubReadonlySurface, runCommercialV37HubFoundation } from "../../lib/commercialization/hub";
import { buildVerificationMatrixSummary } from "../../lib/commercialization/stabilization/verification-matrix-summary";
import { runCommercialV37StabilizationFoundation } from "../../lib/commercialization/stabilization/stabilization-surface-summary";

function assert(cond: boolean, msg: string): void {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const V36_SEAL_FIXTURE_HOOKS = [
  "public-surface-ready=3.6-public-1",
  "http-ready=3.6-http-1",
  "integration-ready=3.6-integration-1",
  "client-ready=3.6-client-1",
  "release-portal-ready=3.6-release-1",
  "discovery-ready=3.6-discovery-1",
  "support-portal-ready=3.6-support-1",
  "trust-center-ready=3.6-trust-1",
  "transparency-center-ready=3.6-transparency-1",
] as const;

function buildFrozenStack(deploymentId: string) {
  const v36Closure = runCommercialClosureFoundation({
    deploymentId,
    observedHooks: [...V36_SEAL_FIXTURE_HOOKS],
  });
  const product = runCommercialProductFoundation({
    deploymentId,
    closure: v36Closure,
    tier: "enterprise",
  });
  const commerce = runCommercialCommerceFoundation({ deploymentId, product });
  const operations = runCommercialOperationsFoundation({
    deploymentId,
    product,
    commerce,
  });
  const portal = runCommercialPortalFoundation({
    deploymentId,
    product,
    commerce,
    operations,
  });
  const v37Closure = runCommercialV37ClosureFoundation({
    deploymentId,
    v36Closure,
    product,
    commerce,
    operations,
    portal,
    observedHooks: [
      "product-surface-ready=3.7-product-1",
      "pricing-surface-ready=3.7-commerce-1",
      "operations-surface-ready=3.7-operations-1",
      "portal-surface-ready=3.7-portal-1",
    ],
  });
  const v37Support = runCommercialV37SupportFoundation({
    deploymentId,
    product,
    portal,
    v37Closure,
  });
  const v37Final = runCommercialV37FinalFoundation({
    deploymentId,
    v37Closure,
    v37Support,
    observedHooks: [...EXPECTED_V37_PHASE_HOOKS],
  });
  const v37PhaseClosure = runCommercialV37PhaseClosureFoundation({
    deploymentId,
    v37Final,
    observedHooks: [...EXPECTED_V37_PHASE_HOOKS],
  });
  const v37Launch = runCommercialV37LaunchFoundation({
    deploymentId,
    v37PhaseClosure,
    v37Final,
    observedHooks: [
      ...EXPECTED_V37_PHASE_HOOKS,
      "v37-phase-closure-ready=3.7-phase-closure-8",
    ],
  });
  const v37Operating = runCommercialV37OperatingFoundation({
    deploymentId,
    v37Launch,
    v37PhaseClosure,
    assistive: true,
  });
  const v37Sunset = runCommercialV37SunsetFoundation({
    deploymentId,
    v37Operating,
    v37PhaseClosure,
  });
  const v37Archive = runCommercialV37ArchiveFoundation({
    deploymentId,
    v37Sunset,
    v37PhaseClosure,
  });
  const v37Legacy = runCommercialV37LegacyFoundation({
    deploymentId,
    v37Archive,
  });
  const v37Atlas = runCommercialV37AtlasFoundation({
    deploymentId,
    v37Legacy,
    phaseClosed: v37PhaseClosure.phaseClosed,
  });
  const hub = runCommercialV37HubFoundation({
    deploymentId,
    v37Atlas,
    phaseClosed: v37PhaseClosure.phaseClosed,
  });
  const stabilization = runCommercialV37StabilizationFoundation({
    deploymentId,
    v37Hub: hub,
  });
  return { product, hub, stabilization };
}

function main(): void {
  const deploymentId = "verification-matrix";
  const { product, hub, stabilization } = buildFrozenStack(deploymentId);

  let readonlyOk = false;
  try {
    assertHubReadonlySurface(hub);
    readonlyOk = true;
  } catch {
    readonlyOk = false;
  }

  const rows = [
    { id: "hub", label: "HUB", ok: hub.hubReady },
    { id: "hub-freeze", label: "HUB FREEZE", ok: hub.hubFreeze.hubFrozen },
    { id: "stabilization", label: "STABILIZATION", ok: stabilization.stabilizationReady },
    {
      id: "product",
      label: "PRODUCT SURFACE",
      ok: product.productized && product.v36Sealed,
    },
    { id: "readonly", label: "READONLY SURFACE", ok: readonlyOk },
    {
      id: "release",
      label: "RELEASE READINESS",
      ok:
        stabilization.releaseReadiness.releaseReady &&
        stabilization.releaseReadiness.publishable,
    },
  ];

  const matrix = buildVerificationMatrixSummary({ deploymentId, rows });

  for (const row of rows) {
    console.log(`${row.label} ${row.ok ? "OK" : "FAIL"}`);
  }

  assert(matrix.allOk, `matrix not complete: ${matrix.summary}`);

  console.log("VERIFICATION MATRIX OK");
  console.log("");
  console.log(matrix.summary);
}

main();
