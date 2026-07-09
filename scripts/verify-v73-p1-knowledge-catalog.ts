/**
 * V73 P1 — Knowledge Catalog Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  assertKnowledgeCatalogPass,
  buildKnowledgeCatalog,
  formatKnowledgeCatalogSummary,
  getKnowledgeByAccess,
  getKnowledgeByCategory,
  getKnowledgeById,
  getKnowledgeBySource,
  KNOWLEDGE_CATALOG,
  runKnowledgeCatalog,
  V73_KNOWLEDGE_FREEZE_VERSION,
  V73_KNOWLEDGE_VERSION,
} from "../lib/knowledge/v73/knowledge.entry";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v73-p1-knowledge-catalog";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/knowledge/v73/knowledge.types.ts",
    "lib/knowledge/v73/knowledge.catalog.ts",
    "lib/knowledge/v73/knowledge.builder.ts",
    "lib/knowledge/v73/knowledge.entry.ts",
    "docs/V73-P1-KNOWLEDGE-CATALOG.md",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ V73 knowledge catalog module structure");
}

function testCatalogFields() {
  check(KNOWLEDGE_CATALOG.length >= 6, "knowledge catalog entries");
  for (const item of KNOWLEDGE_CATALOG) {
    check(item.document.length > 0, `${item.id} document`);
    check(item.topic.length > 0, `${item.id} topic`);
    check(item.category.length > 0, `${item.id} category`);
    check(item.tag.length > 0, `${item.id} tag`);
    check(item.owner.length > 0, `${item.id} owner`);
    check(item.status.length > 0, `${item.id} status`);
    check(item.source.length > 0, `${item.id} source`);
    check(item.version.length > 0, `${item.id} version`);
    check(item.confidence.length > 0, `${item.id} confidence`);
    check(item.access.length > 0, `${item.id} access`);
  }
  console.log("✓ knowledge catalog field coverage");
}

function testCatalogQueries() {
  const item = getKnowledgeById("KNW-001");
  check(item?.source === "v72-intelligence-freeze-1", "KNW-001 upstream intelligence freeze");
  check(item?.confidence === "high", "KNW-001 confidence high");

  const v72 = getKnowledgeBySource("v72-intelligence-policy-1");
  check(v72.length >= 1, "v72-intelligence-policy-1 source items");

  const governance = getKnowledgeByCategory("governance");
  check(governance.length >= 2, "governance category items");

  const restricted = getKnowledgeByAccess("restricted");
  check(restricted.length >= 2, "restricted access items");

  console.log("✓ knowledge catalog queries");
}

function testReport() {
  const incomplete = runKnowledgeCatalog({
    deploymentId: DEPLOYMENT_ID,
    signals: { catalogComplete: false },
  });
  check(!incomplete.catalogReady, "incomplete catalog not ready");

  const ready = buildKnowledgeCatalog({ deploymentId: DEPLOYMENT_ID });
  check(ready.version === V73_KNOWLEDGE_VERSION, "knowledge version");
  check(ready.freezeVersion === V73_KNOWLEDGE_FREEZE_VERSION, "freeze version declared");
  check(ready.manifest.catalogComplete, "manifest complete");
  check(ready.catalogReady, "catalog ready");
  check(ready.readinessScore === 100, "readiness score 100");
  assertKnowledgeCatalogPass(ready);

  console.log("✓ knowledge catalog report");
  console.log(formatKnowledgeCatalogSummary(ready));
  console.log("\n✅ V73 P1 Knowledge Catalog — verify PASS");
}

function main() {
  console.log("V73 P1 Knowledge Catalog Verification\n");
  checkModuleStructure();
  testCatalogFields();
  testCatalogQueries();
  testReport();
}

main();
