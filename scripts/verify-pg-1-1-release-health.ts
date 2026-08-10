/**
 * PG-1.1 — Release Health Registry verification
 */
import {
  GA_RELEASE_BASELINE,
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
import {
  PG_1_1_ID,
  POST_GA_PRODUCTION_BASELINE,
  RELEASE_HEALTH_COMMIT_REF,
  RELEASE_HEALTH_FREEZE_TAG,
  RELEASE_HEALTH_GA_TAG,
  RELEASE_HEALTH_REGISTRY_CAPABILITY,
  RELEASE_HEALTH_REGISTRY_VERSION,
  buildReleaseHealthRegistry,
  clearReleaseHealthRegistry,
  getReleaseHealthRegistry,
  releaseHealthRegistryFingerprint,
} from "../lib/release/health/release-health-registry";
import {
  buildProductionValidation,
  clearProductionValidation,
} from "../lib/release/production-validation";
import {
  buildReleaseCandidate,
  clearReleaseCandidate,
} from "../lib/release/release-candidate";
import {
  RELEASE_ID,
  buildReleaseReadiness,
  clearReleaseReadiness,
} from "../lib/release/release-readiness";

function assert(cond: unknown, msg: string): asserts cond {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  console.log("=== PG-1.1 Release Health Registry ===\n");

  clearReleaseHealthRegistry();
  clearGaRelease();
  clearProductionValidation();
  clearReleaseCandidate();
  clearReleaseReadiness();
  buildReleaseReadiness();
  buildReleaseCandidate();
  buildProductionValidation();
  buildGaRelease();

  const first = buildReleaseHealthRegistry();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === PG_1_1_ID, "PG-1.1 id");
  assert(first.capability === RELEASE_HEALTH_REGISTRY_CAPABILITY, "capability");
  assert(first.version === RELEASE_HEALTH_REGISTRY_VERSION, "version");
  assert(first.commitReference === RELEASE_HEALTH_COMMIT_REF, "commit ref");
  assert(first.commitReference.length === 40, "commit sha length");
  assert(first.baselineTag === POST_GA_PRODUCTION_BASELINE, "baseline tag");
  assert(first.baselineTag === "post-ga-production-baseline-v1", "baseline literal");
  assert(first.gaBaseline === GA_RELEASE_BASELINE, "ga baseline");
  assert(first.gaBaseline === "v80-pilot-ga-1.0.0", "ga baseline literal");
  assert(first.gaTag === GA_RELEASE_VERSION, "ga tag");
  assert(first.gaTag === RELEASE_HEALTH_GA_TAG, "ga tag const");
  assert(first.freezeTag === GA_RELEASE_FREEZE_VERSION, "freeze tag");
  assert(first.freezeTag === RELEASE_HEALTH_FREEZE_TAG, "freeze tag const");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(first.gaFingerprint.length === 64, "ga fingerprint length");
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noDatabase === true, "noDatabase");
  assert(first.scope.noUi === true, "noUi");
  assert(first.scope.additiveOnly === true, "additiveOnly");
  console.log("PASS Build");

  assert(first.verificationStatus === "PASS", "verification PASS");
  assert(first.rollbackReference.strategy === "ep-freeze-baseline", "rollback strategy");
  assert(first.rollbackReference.ready === true, "rollback ready");
  assert(first.rollbackReference.mocked === false, "rollback no mock");
  assert(first.rollbackReference.restoreTargets.length === 4, "rollback targets");
  assert(first.rollbackReference.gaVersion === GA_RELEASE_VERSION, "rollback ga");
  assert(
    first.rollbackReference.freezeVersion === GA_RELEASE_FREEZE_VERSION,
    "rollback freeze",
  );
  console.log("PASS Verification + rollback");

  assert(first.deploymentMetadata.environment === "production", "deploy env");
  assert(first.deploymentMetadata.provider === "vercel", "deploy provider");
  assert(first.deploymentMetadata.contractVersion === "pg-1.1-deploy-meta-1", "deploy contract");
  assert(first.deploymentMetadata.productionUrl === null, "deploy url unset");
  assert(first.deploymentMetadata.deploymentId === null, "deploy id unset");
  assert(first.deploymentMetadata.deployedAt === null, "deployedAt unset");
  console.log("PASS Deployment metadata contract");

  const second = buildReleaseHealthRegistry();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    releaseHealthRegistryFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getReleaseHealthRegistry().fingerprint === first.fingerprint,
    "get cache",
  );

  clearReleaseHealthRegistry();
  const third = buildReleaseHealthRegistry();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== PG-1.1 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
  console.log(`commit: ${first.commitReference}`);
}

main();
