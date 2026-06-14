/**
 * V38 Brand Intelligence Network — Phase 3 verification
 */
import {
  BRAND_INTELLIGENCE_NETWORK_P3_TAG,
  buildBrandEvidenceLinkRecords,
  buildTenderBrandStubRecords,
  getEvidenceCoverageStats,
  getEvidenceLinksByBrandId,
  validateBrandIntelligenceNetworkPhase3,
} from "../lib/brand-intelligence-network";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const validation = validateBrandIntelligenceNetworkPhase3();
assert(validation.valid, "phase3 validation");
assert(validation.evidenceLinkRegistry.valid, "evidence links");
assert(validation.tenderStubRegistry.valid, "tender stubs");

const stats = getEvidenceCoverageStats();
assert(stats.totalLinks >= 8, "evidence coverage");
assert(stats.brandCoverage >= 6, "brand evidence coverage");

const lfEvidence = getEvidenceLinksByBrandId("brand-life-fitness");
assert(lfEvidence.length >= 2, "brand evidence links");
assert(lfEvidence.some((l) => l.evidenceKind === "datasheet"), "datasheet evidence");

const links = buildBrandEvidenceLinkRecords();
const refs = new Set(links.map((l) => l.evidenceRef));
assert(refs.size === links.length, "evidenceRef unique");

const stubs = buildTenderBrandStubRecords();
assert(stubs.filter((s) => s.stubReady).length >= 5, "tender stub ready");

console.log("✓ evidence links", validation.evidenceLinkRegistry.summary);
console.log("✓ tender stubs", validation.tenderStubRegistry.summary);
console.log(" ", `kinds=${Object.keys(stats.kindBreakdown).length} tag=${BRAND_INTELLIGENCE_NETWORK_P3_TAG}`);
console.log("Brand Intelligence Network Phase 3 PASS");
