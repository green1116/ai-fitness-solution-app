/**
 * V3.7 FINAL — release governance verification
 */
import {
  buildFreezeGovernancePolicy,
  buildReleaseGovernancePolicy,
  buildBaselineGovernancePolicy,
  buildRollbackGovernancePolicy,
  buildRestorationGovernancePolicy,
  buildFinalReleaseGovernanceBundle,
  buildFinalReleaseSummary,
  buildFinalReleaseReadiness,
  warmEnterpriseStackSnapshot,
} from "../lib/release/index";

const DEPLOYMENT_ID = "v37-verify-governance";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function main() {
  warmEnterpriseStackSnapshot(DEPLOYMENT_ID);
  const freeze = buildFreezeGovernancePolicy({ deploymentId: DEPLOYMENT_ID });
  const release = buildReleaseGovernancePolicy({ deploymentId: DEPLOYMENT_ID });
  const baseline = buildBaselineGovernancePolicy({ deploymentId: DEPLOYMENT_ID });
  const rollback = buildRollbackGovernancePolicy({ deploymentId: DEPLOYMENT_ID });
  const restoration = buildRestorationGovernancePolicy({ deploymentId: DEPLOYMENT_ID });
  const bundle = buildFinalReleaseGovernanceBundle({ deploymentId: DEPLOYMENT_ID });
  const readiness = buildFinalReleaseReadiness({ deploymentId: DEPLOYMENT_ID });
  const summary = buildFinalReleaseSummary({ deploymentId: DEPLOYMENT_ID });

  assert(freeze.freezePolicyEnforced, "freeze governance");
  assert(release.releaseApproved, "release approved");
  assert(baseline.baselineGovernanceEnforced, "baseline governance");
  assert(rollback.rollbackPolicyEnforced, "rollback policy");
  assert(restoration.restorationPolicyEnforced, "restoration policy");
  assert(bundle.allEnforced, "all governance enforced");
  assert(readiness.preservationReadiness, "preservation readiness");
  assert(readiness.lifecycleReadiness, "lifecycle readiness");
  assert(summary.productionReady, "production ready");
  assert(readiness.confidenceScore >= 80, "confidence score");

  console.log("✓ release governance");
  console.log(" ", bundle.summary);
  console.log("✓ final release readiness");
  console.log(" ", readiness.summary);
  console.log("✓ production readiness summary");
  console.log(" ", summary.summary);
  console.log("\nAll release governance checks passed.");
}

main();
