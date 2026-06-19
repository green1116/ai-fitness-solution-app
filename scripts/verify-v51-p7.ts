/**
 * V51 API Exposure — P7 Audit Sweep verification
 */
import {
  SAAS_PRODUCT_API_META,
  SAAS_PRODUCT_API_P7_TAG,
  V50_PERSISTENCE_DEPENDENCY_TAG,
  validateApiP7,
} from "../lib/saas-product-api";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateApiP7({ includeRegression: true });
  const report = validation.report;

  assert(validation.valid, `P7 audit validation: ${validation.summary}`);
  console.log("✓ P7 audit validation ok");

  for (const check of report?.checks ?? []) {
    assert(check.status === "pass", `${check.id}: ${check.detail}`);
    console.log(`✓ ${check.id}`);
  }

  console.log("SAAS_PRODUCT_API_AUDIT_REPORT", JSON.stringify({
    routeCount: report?.routeCount,
    endpointCount: report?.endpointCount,
    tenantProtectedCount: report?.tenantProtectedCount,
    auditStatus: report?.auditStatus,
    findings: report?.findings,
  }, null, 2));

  assert(report?.routeCount === 11, "routeCount");
  assert(report?.endpointCount === 15, "endpointCount");
  assert(report?.tenantProtectedCount === 14, "tenantProtectedCount");
  assert(report?.auditStatus === "pass", "auditStatus");
  assert((report?.findings?.length ?? 0) === 0, "findings");
  console.log("✓ audit report metrics ok");

  assert(
    SAAS_PRODUCT_API_META.tag.startsWith("v51-api-exposure-"),
    "API meta tag must remain in v51 exposure lineage",
  );
  assert(SAAS_PRODUCT_API_META.dependencyTag === V50_PERSISTENCE_DEPENDENCY_TAG, "V50 dependency");
  console.log("✓ API meta ok (P7 audit regression; current meta tag may advance beyond P7)");

  console.log(`tag=${SAAS_PRODUCT_API_P7_TAG}`);
  console.log("V51 P7 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
