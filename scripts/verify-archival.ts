/**
 * V3.7-H22 Production Archival & Enterprise Preservation — smoke verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  PRODUCTION_ARCHIVAL_VERSION,
  ARCHIVAL_CHECKLIST_VERSION,
  PRESERVATION_SUMMARY_VERSION,
  ARCHIVAL_MANIFEST_VERSION,
  ARCHIVAL_VERSION,
  buildArchivalChecklist,
  buildPreservationSummary,
  buildArchivalManifest,
  buildEnterpriseArchivalFoundation,
  type EnterpriseArchivalFoundation,
  type ArchivalChecklist,
  type PreservationSummary,
  type ArchivalManifest,
} from "../lib/commercialization/archival/index";

const FOUNDATION_API_KEYS: (keyof EnterpriseArchivalFoundation)[] = [
  "version",
  "foundationId",
  "checklist",
  "preservation",
  "manifest",
  "foundationSummary",
];

const CHECKLIST_KEYS: (keyof ArchivalChecklist)[] = [
  "version",
  "checklistId",
  "archivalItems",
  "preservationGroups",
  "requiredArchivals",
  "governanceArchivals",
  "opsArchivals",
  "releaseArchivals",
  "summary",
];

const PRESERVATION_KEYS: (keyof PreservationSummary)[] = [
  "version",
  "summaryId",
  "readyForArchive",
  "releaseArchived",
  "governanceArchived",
  "opsArchived",
  "auditArchived",
  "preservationCompleted",
  "confidenceScore",
  "summary",
];

const MANIFEST_KEYS: (keyof ArchivalManifest)[] = [
  "version",
  "manifestId",
  "ARCHIVAL_VERSION",
  "LAUNCH_CLOSURE_VERSION",
  "GO_LIVE_VERSION",
  "ROLLOUT_VERSION",
  "LANDING_VERSION",
  "readyForArchive",
  "readyForPreservation",
  "readyForEnterprise",
  "summary",
];

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function testArchivalChecklist() {
  const checklist = buildArchivalChecklist({ deploymentId: "h22-checklist" });
  assert(checklist.version === ARCHIVAL_CHECKLIST_VERSION, "checklist version");
  assert(checklist.checklistId.includes("ACL-V37H22"), "checklist id");
  assert(checklist.archivalItems.length >= 10, "archival items");
  assert(checklist.preservationGroups.length >= 5, "preservation groups");
  assert(checklist.requiredArchivals.length >= 8, "required archivals");
  assert(checklist.governanceArchivals.length >= 3, "governance archivals");
  assert(checklist.opsArchivals.length >= 2, "ops archivals");
  assert(checklist.releaseArchivals.length >= 2, "release archivals");
  assert(checklist.archivalItems.some((c) => c.id === "arc-launch-closure"), "launch closure item");
  assert(checklist.archivalItems.some((c) => c.id === "arc-release-ledger"), "release ledger item");

  for (const key of CHECKLIST_KEYS) {
    assert(key in checklist, `checklist shape missing ${String(key)}`);
  }

  console.log("✓ archival checklist config");
  console.log(" ", checklist.summary);
}

function testPreservationSummary() {
  const preservation = buildPreservationSummary({ deploymentId: "h22-preservation" });
  assert(preservation.version === PRESERVATION_SUMMARY_VERSION, "preservation version");
  assert(preservation.summaryId.includes("PRS-V37H22"), "preservation id");
  assert(typeof preservation.readyForArchive === "boolean", "readyForArchive");
  assert(typeof preservation.releaseArchived === "boolean", "releaseArchived");
  assert(typeof preservation.governanceArchived === "boolean", "governanceArchived");
  assert(typeof preservation.opsArchived === "boolean", "opsArchived");
  assert(typeof preservation.auditArchived === "boolean", "auditArchived");
  assert(typeof preservation.preservationCompleted === "boolean", "preservationCompleted");
  assert(preservation.confidenceScore >= 0 && preservation.confidenceScore <= 100, "confidence score");

  for (const key of PRESERVATION_KEYS) {
    assert(key in preservation, `preservation summary missing ${String(key)}`);
  }

  console.log("✓ preservation summary");
  console.log(" ", preservation.summary);
}

function testArchivalManifest() {
  const manifest = buildArchivalManifest({ deploymentId: "h22-manifest" });
  assert(manifest.version === ARCHIVAL_MANIFEST_VERSION, "manifest version");
  assert(manifest.manifestId.includes("ARM-V37H22"), "manifest id");
  assert(manifest.ARCHIVAL_VERSION === ARCHIVAL_VERSION, "archival version");
  assert(manifest.LAUNCH_CLOSURE_VERSION.length > 0, "launch closure version");
  assert(manifest.GO_LIVE_VERSION.length > 0, "go-live version");
  assert(manifest.ROLLOUT_VERSION.length > 0, "rollout version");
  assert(manifest.LANDING_VERSION.length > 0, "landing version");
  assert(typeof manifest.readyForArchive === "boolean", "readyForArchive");
  assert(typeof manifest.readyForPreservation === "boolean", "readyForPreservation");
  assert(typeof manifest.readyForEnterprise === "boolean", "readyForEnterprise");

  for (const key of MANIFEST_KEYS) {
    assert(key in manifest, `archival manifest missing ${String(key)}`);
  }

  console.log("✓ archival manifest");
  console.log(" ", manifest.summary);
}

function testArchivalApi() {
  const foundation = buildEnterpriseArchivalFoundation({ deploymentId: "h22-api" });
  assert(foundation.version === PRODUCTION_ARCHIVAL_VERSION, "foundation version");
  for (const key of FOUNDATION_API_KEYS) {
    assert(key in foundation, `archival API missing ${String(key)}`);
  }
  assert(foundation.checklist.archivalItems.length >= 10, "foundation checklist");
  assert(foundation.preservation.confidenceScore >= 0, "foundation confidence");

  console.log("✓ enterprise archival API");
  console.log(
    " ",
    `endpoint=GET /api/commercialization/archival foundationId=${foundation.foundationId}`,
  );
}

function testArchivalPage() {
  const pagePath = join(process.cwd(), "app/dashboard/archival/page.tsx");
  const content = readFileSync(pagePath, "utf-8");
  assert(content.includes("buildEnterpriseArchivalFoundation"), "page uses archival foundation");
  assert(content.includes("preservationGroups"), "page shows preservation groups");
  assert(content.includes("governanceArchivals"), "page shows governance archivals");
  assert(content.includes("releaseArchivals"), "page shows release archivals");
  assert(content.includes("preservationCompleted"), "page shows preservation completed");
  assert(content.includes("/api/commercialization/archival"), "page links to API");

  const foundation = buildEnterpriseArchivalFoundation({ deploymentId: "h22-page" });
  assert(foundation.manifest.readyForArchive, "archive ready");
  assert(foundation.checklist.requiredArchivals.every((c) => c.status === "archived"), "required archived");

  console.log("✓ archival page");
  console.log(" ", `route=/dashboard/archival items=${foundation.checklist.archivalItems.length}`);
}

function main() {
  testArchivalChecklist();
  testPreservationSummary();
  testArchivalManifest();
  testArchivalApi();
  testArchivalPage();
  console.log("\nAll archival checks passed.");
}

main();
