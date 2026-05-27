/**
 * V3.7-H5 Production Audit API & Release Review — smoke verification
 */
import {
  AUDIT_REVIEW_DTO_VERSION,
  buildAuditReviewDto,
} from "../lib/commercialization/audit/audit-review.dto";
import {
  AUDIT_REVIEW_SURFACE_VERSION,
  buildAuditReviewSurface,
  type AuditReviewSurface,
} from "../lib/commercialization/audit/audit-review-surface";
import {
  AUDIT_SNAPSHOT_VERSION,
  RELEASE_TRACE_MANIFEST_VERSION,
  VERIFICATION_EVIDENCE_BUNDLE_VERSION,
  buildAuditSnapshot,
  buildReleaseTraceManifest,
  buildVerificationEvidenceBundle,
} from "../lib/commercialization/audit";

const API_SURFACE_KEYS: (keyof AuditReviewSurface)[] = [
  "version",
  "surfaceId",
  "capturedAt",
  "auditSummary",
  "releaseTrace",
  "incidentTrace",
  "verificationLineage",
  "readinessSummary",
  "confidenceSummary",
  "dto",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testAuditReviewDto() {
  const dto = buildAuditReviewDto({ deploymentId: "h5-dto" });
  assert(dto.version === AUDIT_REVIEW_DTO_VERSION, "dto version");
  assert(dto.dtoId.includes("DTO-V37H5"), "dto id");
  assert(dto.auditSnapshot.version === AUDIT_SNAPSHOT_VERSION, "audit snapshot linked");
  assert(dto.releaseTraceManifest.version === RELEASE_TRACE_MANIFEST_VERSION, "trace linked");
  assert(dto.incidentTrace.incidentId.includes("INC-V37H4"), "incident linked");
  assert(
    dto.verificationEvidenceBundle.version === VERIFICATION_EVIDENCE_BUNDLE_VERSION,
    "evidence linked",
  );
  assert(dto.dashboardSnapshot.snapshotId.includes("DASH-V37H3"), "dashboard snapshot");
  assert(dto.observabilitySnapshot.snapshotId.includes("OBS-V37H2"), "observability snapshot");
  assert(dto.hardeningSnapshot.reportId.includes("REL-V37H1"), "hardening snapshot");
  assert(dto.auditSnapshot.releasable, "releasable");

  console.log("✓ audit review DTO");
  console.log(" ", `dtoId=${dto.dtoId} releasable=${dto.auditSnapshot.releasable}`);
}

function testAuditReviewSurface() {
  const surface = buildAuditReviewSurface({ deploymentId: "h5-surface" });
  assert(surface.version === AUDIT_REVIEW_SURFACE_VERSION, "surface version");
  assert(surface.surfaceId.includes("REV-V37H5"), "surface id");
  assert(surface.auditSummary.length > 0, "audit summary");
  assert(surface.releaseTrace.manifestId.includes("TRACE-V37H4"), "release trace");
  assert(surface.incidentTrace.incidentId.includes("INC-V37H4"), "incident trace");
  assert(surface.verificationLineage.bundleId.includes("EVD-V37H4"), "verification lineage");
  assert(surface.readinessSummary.releaseReady, "release ready");
  assert(surface.confidenceSummary.releaseConfidence >= 80, "confidence");
  assert(surface.dto.dtoId.includes("DTO-V37H5"), "dto embedded");

  console.log("✓ audit review surface");
  console.log(
    " ",
    `releaseReady=${surface.readinessSummary.releaseReady} incident=${surface.confidenceSummary.incidentLevel}`,
  );
}

function testAuditComponents() {
  const snapshot = buildAuditSnapshot({ deploymentId: "h5-audit" });
  const trace = buildReleaseTraceManifest({ deploymentId: "h5-trace" });
  const evidence = buildVerificationEvidenceBundle({ deploymentId: "h5-evidence" });
  assert(snapshot.releasable, "audit snapshot releasable");
  assert(trace.releaseReady, "release trace ready");
  assert(evidence.buildEvidence.includes("BuildFreeze"), "build evidence");

  console.log("✓ audit snapshot / release trace / verification bundle");
}

function testApiRouteShape() {
  const surface = buildAuditReviewSurface({ deploymentId: "h5-api" });
  for (const key of API_SURFACE_KEYS) {
    assert(key in surface, `api shape missing ${key}`);
  }
  assert(typeof surface.releaseTrace.AUDIT_VERSION === "string", "audit version in trace");
  assert(typeof surface.incidentTrace.resolutionState === "string", "resolution state");
  assert(surface.verificationLineage.verifyEvidence.includes("verify:audit"), "verify lineage");

  console.log("✓ API route shape (static)");
  console.log(" ", `endpoint=GET /api/commercialization/audit surfaceId=${surface.surfaceId}`);
}

function main() {
  testAuditReviewDto();
  testAuditReviewSurface();
  testAuditComponents();
  testApiRouteShape();
  console.log("\nAll audit review checks passed.");
}

main();
