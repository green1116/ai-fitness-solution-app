/**
 * V51 API Exposure — P8 Final Freeze verification
 */
import { execSync } from "child_process";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";
import {
  SAAS_PRODUCT_API_FINAL_TAG,
  SAAS_PRODUCT_API_META,
  SAAS_PRODUCT_API_P8_TAG,
  V51_META,
  validateApiP8,
} from "../lib/saas-product-api";

const REGRESSION_SCRIPTS = [
  "verify:v51-p1",
  "verify:v51-p2",
  "verify:v51-p3",
  "verify:v51-p4",
  "verify:v51-p5",
  "verify:v51-p6",
  "verify:v51-p7",
] as const;

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function main() {
  const validation = await validateApiP8();
  assert(validation.valid, `P8 final freeze validation: ${validation.summary}`);
  console.log("✓ validateApiP8 ok");

  assert(V51_META.frozen === true, "V51_META.frozen");
  assert(V51_META.auditStatus === "pass", "V51_META.auditStatus");
  assert(V51_META.routeCount > 0, "V51_META.routeCount");
  assert(V51_META.endpointCount > 0, "V51_META.endpointCount");
  console.log("✓ V51_META gates ok");

  for (const script of REGRESSION_SCRIPTS) {
    execSync(`npm run ${script}`, { stdio: "inherit", cwd: process.cwd(), env: process.env });
    console.log(`✓ ${script} ok`);
  }

  execSync("npx tsc --noEmit", { stdio: "inherit" });
  console.log("✓ tsc ok");

  const docPath = join(process.cwd(), "docs", "commercialization", "V51-FINAL-FREEZE.md");
  assert(existsSync(docPath), "V51-FINAL-FREEZE.md exists");
  console.log("✓ freeze documentation ok");

  const metaJsonPath = join(process.cwd(), "docs", "commercialization", "V51-META.json");
  writeFileSync(
    metaJsonPath,
    `${JSON.stringify(
      {
        tag: V51_META.tag,
        dependencyTag: V51_META.dependencyTag,
        routeCount: V51_META.routeCount,
        endpointCount: V51_META.endpointCount,
        tenantProtectedCount: V51_META.tenantProtectedCount,
        auditStatus: V51_META.auditStatus,
        frozen: V51_META.frozen,
      },
      null,
      2,
    )}\n`,
    "utf8",
  );
  const metaJson = JSON.parse(readFileSync(metaJsonPath, "utf8"));
  assert(metaJson.tag === SAAS_PRODUCT_API_FINAL_TAG, "V51-META.json tag");
  assert(metaJson.frozen === true, "V51-META.json frozen");
  console.log("✓ V51-META.json ok");

  assert(SAAS_PRODUCT_API_META.tag === SAAS_PRODUCT_API_FINAL_TAG, "SAAS_PRODUCT_API_META tag");
  assert(SAAS_PRODUCT_API_META.frozen === true, "SAAS_PRODUCT_API_META frozen");
  console.log("✓ SAAS_PRODUCT_API_META ok");

  console.log(`p8Tag=${SAAS_PRODUCT_API_P8_TAG}`);
  console.log(`finalTag=${SAAS_PRODUCT_API_FINAL_TAG}`);
  console.log("V51 P8 PASS");
  console.log("V51_FINAL_PASS");
  console.log("V51 API EXPOSURE LAYER FROZEN");
  console.log("Ready for V52 Portal UI");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
