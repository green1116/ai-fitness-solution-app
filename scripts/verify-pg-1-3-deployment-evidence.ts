/**
 * PG-1.3 — Deployment Evidence Foundation verification
 */
import {
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
import {
  DEPLOYMENT_EVIDENCE_CAPABILITY,
  DEPLOYMENT_EVIDENCE_DEPLOY_REF,
  DEPLOYMENT_EVIDENCE_VERSION,
  PG_1_3_ID,
  PG1_RUNTIME_HEALTH_BASELINE,
  buildDeploymentEvidenceFoundation,
  clearDeploymentEvidenceFoundation,
  deploymentEvidenceFoundationFingerprint,
  getDeploymentEvidenceFoundation,
} from "../lib/release/health/deployment-evidence-foundation";
import {
  RELEASE_HEALTH_COMMIT_REF,
  buildReleaseHealthRegistry,
  clearReleaseHealthRegistry,
} from "../lib/release/health/release-health-registry";
import {
  PG_1_2_ID,
  buildRuntimeHealthFoundation,
  clearRuntimeHealthFoundation,
} from "../lib/release/health/runtime-health-foundation";
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
  console.log("=== PG-1.3 Deployment Evidence Foundation ===\n");

  clearDeploymentEvidenceFoundation();
  clearRuntimeHealthFoundation();
  clearReleaseHealthRegistry();
  clearGaRelease();
  clearProductionValidation();
  clearReleaseCandidate();
  clearReleaseReadiness();
  buildReleaseReadiness();
  buildReleaseCandidate();
  buildProductionValidation();
  buildGaRelease();
  buildReleaseHealthRegistry();
  const runtime = buildRuntimeHealthFoundation();

  const first = buildDeploymentEvidenceFoundation();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === PG_1_3_ID, "PG-1.3 id");
  assert(first.capability === DEPLOYMENT_EVIDENCE_CAPABILITY, "capability");
  assert(first.version === DEPLOYMENT_EVIDENCE_VERSION, "version");
  assert(first.baselineTag === PG1_RUNTIME_HEALTH_BASELINE, "baseline");
  assert(first.baselineTag === "pg1-runtime-health-v1", "baseline literal");
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(
    first.runtimeHealthFingerprint === runtime.fingerprint,
    "parent fingerprint link",
  );
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noLiveDeploy === true, "noLiveDeploy");
  assert(first.scope.noDatabase === true, "noDatabase");
  assert(first.scope.noUi === true, "noUi");
  console.log("PASS Build");

  assert(first.releaseReference.releaseId === RELEASE_ID, "release ref id");
  assert(first.releaseReference.gaVersion === GA_RELEASE_VERSION, "release ga");
  assert(
    first.releaseReference.freezeVersion === GA_RELEASE_FREEZE_VERSION,
    "release freeze",
  );
  assert(first.releaseReference.parentPack === PG_1_2_ID, "parent pack");
  assert(first.commitReference.sha === RELEASE_HEALTH_COMMIT_REF, "commit sha");
  assert(first.commitReference.sha.length === 40, "commit length");
  assert(first.commitReference.source === "release-wp-4-ga-1.0.0", "commit source");
  assert(
    first.deploymentReference.deploymentRef === DEPLOYMENT_EVIDENCE_DEPLOY_REF,
    "deploy ref",
  );
  assert(first.deploymentReference.provider === "vercel", "provider");
  assert(
    first.deploymentReference.contractVersion === "pg-1.3-deploy-evidence-1",
    "deploy contract",
  );
  assert(first.deploymentReference.productionUrl === null, "url unset");
  assert(first.environment === "production", "environment");
  assert(first.verificationStatus === "PASS", "verification PASS");
  assert(first.rollbackReference.strategy === "ep-freeze-baseline", "rollback");
  assert(first.rollbackReference.ready === true, "rollback ready");
  assert(first.rollbackReference.mocked === false, "rollback no mock");
  assert(first.rollbackReference.restoreTargets.length === 4, "rollback targets");
  console.log("PASS Evidence contract");

  const second = buildDeploymentEvidenceFoundation();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    deploymentEvidenceFoundationFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getDeploymentEvidenceFoundation().fingerprint === first.fingerprint,
    "get cache",
  );

  clearDeploymentEvidenceFoundation();
  const third = buildDeploymentEvidenceFoundation();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== PG-1.3 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
}

main();
