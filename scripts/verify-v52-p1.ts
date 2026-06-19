/**
 * V52 Portal UI — P1 Portal Shell Foundation verification
 */
import { readFileSync } from "fs";
import { join } from "path";
import {
  SAAS_PRODUCT_PORTAL_META,
  SAAS_PRODUCT_PORTAL_P1_TAG,
  runPortalBoundaryAudit,
  validatePortalP1,
} from "../lib/saas-product-portal";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function assertRouteLinesUnderLimit(routePath: string, maxLines: number) {
  const lines = readFileSync(routePath, "utf8").split("\n").filter((line) => line.trim().length > 0);
  assert(lines.length < maxLines, `${routePath} must stay thin (<${maxLines} lines)`);
}

async function main() {
  const validation = await validatePortalP1();
  assert(validation.valid, `P1 portal shell validation: ${validation.summary}`);
  console.log("✓ P1 portal shell validation ok");

  const audit = runPortalBoundaryAudit();
  assert(audit.PORTAL_NO_PRISMA, "PORTAL_NO_PRISMA");
  console.log("✓ PORTAL_NO_PRISMA");

  assert(audit.PORTAL_API_ONLY, "PORTAL_API_ONLY");
  console.log("✓ PORTAL_API_ONLY");

  assert(audit.PORTAL_NO_V49_V50, "PORTAL_NO_V49_V50");
  console.log("✓ PORTAL_NO_V49_V50");

  const appRoot = join(process.cwd(), "app", "saas-product");
  assertRouteLinesUnderLimit(join(appRoot, "layout.tsx"), 15);
  assertRouteLinesUnderLimit(join(appRoot, "page.tsx"), 15);
  assertRouteLinesUnderLimit(join(appRoot, "settings", "page.tsx"), 15);
  console.log("✓ portal app routes boundary ok");

  assert(SAAS_PRODUCT_PORTAL_META.tag === SAAS_PRODUCT_PORTAL_P1_TAG, "portal meta tag");
  assert(SAAS_PRODUCT_PORTAL_META.phase === "v52-portal-ui-p1", "portal meta phase");
  console.log("✓ portal meta ok");

  console.log(`tag=${SAAS_PRODUCT_PORTAL_P1_TAG}`);
  console.log("V52 P1 PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
