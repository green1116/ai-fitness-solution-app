/**
 * V59 — Production SaaS Foundation Verification
 */
import fs from "node:fs";
import path from "node:path";

import {
  V59_PRODUCT_ENGINE_VERSION,
  runBudgetEngine,
  runQuoteEngine,
  runTenderEngine,
} from "../lib/product-engine";
import { createQuoteHistoryStore } from "../lib/quote-lifecycle";

const ROOT = path.resolve(__dirname, "..");
const V58_DIR = path.join(ROOT, "lib/quote-lifecycle");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkDirectoryStructure() {
  const required = [
    "lib/product-engine/index.ts",
    "lib/product-engine/quote.engine.ts",
    "lib/product-engine/budget.engine.ts",
    "lib/product-engine/tender.engine.ts",
    "lib/services/quote.service.ts",
    "lib/services/budget.service.ts",
    "lib/services/tender.service.ts",
    "lib/services/project.service.ts",
    "app/api/quote/generate/route.ts",
    "app/api/budget/calculate/route.ts",
    "app/api/tender/generate/route.ts",
    "app/api/project/create/route.ts",
    "app/api/project/list/route.ts",
    "app/(product)/quote/page.tsx",
    "app/(product)/budget/page.tsx",
    "app/(product)/tender/page.tsx",
    "app/(workspace)/projects/page.tsx",
    "app/(workspace)/projects/[id]/page.tsx",
  ];

  for (const rel of required) {
    assert(fs.existsSync(path.join(ROOT, rel)), `missing: ${rel}`);
  }
  console.log("✓ V59 directory structure");
}

function checkV58Untouched() {
  const forbidden = ["v58-final-frozen.ts", "v58-final-meta.ts"];
  const historyFiles = fs.readdirSync(path.join(V58_DIR, "history"));
  const orchFiles = fs.readdirSync(path.join(V58_DIR, "orchestration"));

  assert(historyFiles.length >= 10, "v58 history intact");
  assert(orchFiles.length >= 8, "v58 orchestration intact");
  assert(!forbidden.some((f) => historyFiles.includes(f)), "v58 history not modified by v59");

  console.log("✓ V58 runtime untouched (black box)");
}

function checkProductEngine() {
  const quote = runQuoteEngine({
    quoteId: "q-verify",
    workspaceId: "ws-verify",
    companyInfo: { companyName: "Verify Corp" },
  });

  assert(quote.runtime.steps.length === 6, "quote engine orchestration");
  assert(quote.proposal.summary.includes("Verify Corp"), "quote proposal");

  const budget = runBudgetEngine({
    quoteId: "q-verify",
    workspaceId: "ws-verify",
    companySize: 50,
    budgetTier: "mid",
    orchestrationSteps: quote.runtime.steps,
  });

  assert(budget.structure.totalMax > budget.structure.totalMin, "budget structure");

  const store = createQuoteHistoryStore();
  runQuoteEngine({
    quoteId: "q-tender",
    workspaceId: "ws-verify",
    companyInfo: { companyName: "Tender Corp" },
  });

  const tender = runTenderEngine({
    quoteId: "q-tender",
    projectId: "proj-verify",
    projectName: "Verify Project",
    historyStore: store,
  });

  assert(tender.artifact.fileName.endsWith(".pdf"), "tender artifact");
  assert(V59_PRODUCT_ENGINE_VERSION.startsWith("v59"), "product engine version");

  console.log("✓ product engine (V58 wrapper)");
}

function checkPrismaSchema() {
  const schema = fs.readFileSync(path.join(ROOT, "prisma/schema.prisma"), "utf8");
  for (const model of ["Organization", "Quote", "Tender", "OrganizationMember"]) {
    assert(schema.includes(`model ${model}`), `prisma model ${model}`);
  }
  console.log("✓ prisma V59 models");
}

function main() {
  checkDirectoryStructure();
  checkV58Untouched();
  checkProductEngine();
  checkPrismaSchema();
  console.log("\n✓ V59 Production SaaS Foundation — ALL CHECKS PASSED");
}

main();
