/**
 * V67 P7 — Postmortem Foundation Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  ACTION_ITEM_RULE_CATALOG,
  ARCHIVE_INDEX_CATALOG,
  INCIDENT_REPORT_TYPE_CATALOG,
  RCA_CATALOG,
  V67_POSTMORTEM_FOUNDATION_ARTIFACT_SURFACE,
  V67_POSTMORTEM_FOUNDATION_VERSION,
  assertPostmortemFoundationPass,
  buildActionItemContractManifest,
  buildArchiveIndexManifest,
  buildIncidentReportTypeManifest,
  buildPostmortemFoundationReport,
  buildRcaCatalogManifest,
  formatPostmortemFoundationSummary,
  getActionItemsByRcaRef,
  getArchiveByStatus,
  getRcaByIncidentType,
  getReportTypeById,
  getReportTypesByKind,
  isPostmortemRefsAligned,
  runPostmortemFoundation,
} from "../lib/monitoring/v67";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v67-p7-postmortem-foundation";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/monitoring/v67/postmortem/postmortem.ts",
    "lib/monitoring/v67/postmortem/governance.types.ts",
    "lib/monitoring/v67/postmortem/governance.surface.ts",
    "lib/monitoring/v67/postmortem/governance.builder.ts",
    "lib/monitoring/v67/postmortem/governance.entry.ts",
    "lib/monitoring/v67/postmortem/report.types.catalog.ts",
    "lib/monitoring/v67/postmortem/rca.catalog.ts",
    "lib/monitoring/v67/postmortem/action.item.contract.ts",
    "lib/monitoring/v67/postmortem/archive.index.ts",
    "lib/monitoring/v67/postmortem/alignment.catalog.ts",
    "docs/monitoring/V67-POSTMORTEM-FOUNDATION.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V67 postmortem foundation module structure");
}

function testInventories() {
  check(INCIDENT_REPORT_TYPE_CATALOG.length >= 6, "incident report type catalog");
  check(RCA_CATALOG.length >= 6, "RCA catalog");
  check(ACTION_ITEM_RULE_CATALOG.length >= 6, "action item catalog");
  check(ARCHIVE_INDEX_CATALOG.length >= 6, "archive index catalog");
  console.log("✓ report types, RCA, action items & archive inventories");
}

function testCrossReferences() {
  check(isPostmortemRefsAligned(), "postmortem refs aligned");

  const irt001 = getReportTypeById("IRT-001");
  check(irt001?.eventRef === "EVT-001", "IRT-001 event mapping");

  const postmortemTypes = getReportTypesByKind("postmortem_final");
  check(postmortemTypes.length >= 1, "postmortem_final report types");

  const availabilityRca = getRcaByIncidentType("availability");
  check(availabilityRca.length >= 1, "availability RCA entries");

  const rca001Actions = getActionItemsByRcaRef("RCA-001");
  check(rca001Actions.length >= 1, "RCA-001 action items");

  const publishedArchives = getArchiveByStatus("published");
  check(publishedArchives.length >= 1, "published archive entries");
  console.log("✓ cross-references & upstream alignment");
}

function testManifests() {
  check(buildIncidentReportTypeManifest().catalogComplete, "report types complete");
  check(buildRcaCatalogManifest().catalogComplete, "RCA catalog complete");
  check(buildActionItemContractManifest().contractComplete, "action item contract complete");
  check(buildArchiveIndexManifest().catalogComplete, "archive index complete");
  console.log("✓ postmortem manifests");
}

function testReport() {
  const incomplete = runPostmortemFoundation({
    deploymentId: DEPLOYMENT_ID,
    signals: { observabilityReady: false },
  });
  check(!incomplete.foundationReady, "incomplete observability not ready");

  const ready = buildPostmortemFoundationReport({ deploymentId: DEPLOYMENT_ID });

  check(ready.version === V67_POSTMORTEM_FOUNDATION_VERSION, "foundation version");
  check(ready.observabilityReady, "observability ready");
  check(ready.reportTypes.catalogComplete, "report types complete");
  check(ready.rcaCatalog.catalogComplete, "RCA catalog complete");
  check(ready.actionItemContract.contractComplete, "action items complete");
  check(ready.archiveIndex.catalogComplete, "archive index complete");
  check(ready.foundationReady, "foundation ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertPostmortemFoundationPass(ready);

  check(
    V67_POSTMORTEM_FOUNDATION_ARTIFACT_SURFACE.verifyFoundation.includes("verify:v67-p7"),
    "artifact surface verify script",
  );

  console.log("✓ postmortem foundation report");
  console.log(formatPostmortemFoundationSummary(ready));
  console.log("\n✅ V67 P7 Incident Report & Postmortem Foundation — verify PASS");
}

function main() {
  console.log("V67 P7 Incident Report & Postmortem Foundation Verification\n");
  checkModuleStructure();
  testInventories();
  testCrossReferences();
  testManifests();
  testReport();
}

main();
