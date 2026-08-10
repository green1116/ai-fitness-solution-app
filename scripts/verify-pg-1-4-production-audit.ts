/**
 * PG-1.4 — Production Audit Foundation verification
 */
import {
  GA_RELEASE_FREEZE_VERSION,
  GA_RELEASE_VERSION,
  buildGaRelease,
  clearGaRelease,
} from "../lib/release/ga-release";
import {
  PG_1_3_ID,
  buildDeploymentEvidenceFoundation,
  clearDeploymentEvidenceFoundation,
} from "../lib/release/health/deployment-evidence-foundation";
import {
  PG_1_4_ID,
  PG1_DEPLOYMENT_EVIDENCE_BASELINE,
  PRODUCTION_AUDIT_CAPABILITY,
  PRODUCTION_AUDIT_EVENT_TYPES,
  PRODUCTION_AUDIT_VERSION,
  buildProductionAuditFoundation,
  clearProductionAuditFoundation,
  getProductionAuditFoundation,
  productionAuditFoundationFingerprint,
} from "../lib/release/health/production-audit-foundation";
import {
  RELEASE_HEALTH_COMMIT_REF,
  buildReleaseHealthRegistry,
  clearReleaseHealthRegistry,
} from "../lib/release/health/release-health-registry";
import {
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
  console.log("=== PG-1.4 Production Audit Foundation ===\n");

  clearProductionAuditFoundation();
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
  buildRuntimeHealthFoundation();
  const evidence = buildDeploymentEvidenceFoundation();

  const first = buildProductionAuditFoundation();

  assert(first.releaseId === RELEASE_ID, "release id");
  assert(first.workPackageId === PG_1_4_ID, "PG-1.4 id");
  assert(first.capability === PRODUCTION_AUDIT_CAPABILITY, "capability");
  assert(first.version === PRODUCTION_AUDIT_VERSION, "version");
  assert(first.baselineTag === PG1_DEPLOYMENT_EVIDENCE_BASELINE, "baseline");
  assert(
    first.baselineTag === "pg1-deployment-evidence-v1",
    "baseline literal",
  );
  assert(first.fingerprint.length === 64, "fingerprint length");
  assert(
    first.evidenceFingerprint === evidence.fingerprint,
    "parent fingerprint link",
  );
  assert(first.scope.readOnly === true, "readOnly");
  assert(first.scope.noDatabase === true, "noDatabase");
  assert(first.scope.noUi === true, "noUi");
  console.log("PASS Build");

  assert(first.events.length === PRODUCTION_AUDIT_EVENT_TYPES.length, "event count");
  assert(
    first.events.map((e) => e.eventType).join(",") ===
      PRODUCTION_AUDIT_EVENT_TYPES.join(","),
    "event type order",
  );
  for (const [i, event] of first.events.entries()) {
    assert(event.ordinal === i + 1, `ordinal ${i + 1}`);
    assert(event.auditEventId.startsWith("audit-pg14-"), `event id ${i + 1}`);
    assert(event.releaseReference.releaseId === RELEASE_ID, `release ref ${i + 1}`);
    assert(event.releaseReference.gaVersion === GA_RELEASE_VERSION, `ga ${i + 1}`);
    assert(
      event.releaseReference.freezeVersion === GA_RELEASE_FREEZE_VERSION,
      `freeze ${i + 1}`,
    );
    assert(
      event.releaseReference.commitSha === RELEASE_HEALTH_COMMIT_REF,
      `commit ${i + 1}`,
    );
    assert(event.releaseReference.parentPack === PG_1_3_ID, `parent ${i + 1}`);
    assert(event.actorSource.actor === "system", `actor ${i + 1}`);
    assert(event.actorSource.source === "pg-1-health-chain", `source ${i + 1}`);
    assert(
      event.verificationReference.status === "PASS",
      `verification ${i + 1}`,
    );
    assert(
      event.verificationReference.evidenceFingerprint === evidence.fingerprint,
      `verification fp ${i + 1}`,
    );
  }
  console.log("PASS Audit contract");

  const second = buildProductionAuditFoundation();
  assert(second.fingerprint === first.fingerprint, "deterministic rebuild");
  assert(
    productionAuditFoundationFingerprint(second) === first.fingerprint,
    "fingerprint helper",
  );
  assert(
    getProductionAuditFoundation().fingerprint === first.fingerprint,
    "get cache",
  );

  clearProductionAuditFoundation();
  const third = buildProductionAuditFoundation();
  assert(third.fingerprint === first.fingerprint, "deterministic after clear");
  console.log("PASS Deterministic");

  console.log("\n=== PG-1.4 VERDICT ===");
  console.log("STATUS: PASS");
  console.log(`fingerprint: ${first.fingerprint}`);
  console.log(`baseline: ${first.baselineTag}`);
}

main();
