/**
 * WP-PRODUCT-PROJECT-LIST-LATENCY-P0-1 — static verification
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(__dirname, "..");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function read(rel: string) {
  return fs.readFileSync(path.join(ROOT, rel), "utf8");
}

function main() {
  console.log("=== WP-PRODUCT-PROJECT-LIST-LATENCY-P0-1 ===\n");

  const list = read("app/api/project/list/route.ts");
  assert(list.includes("runApiProtection"), "uses runApiProtection");
  assert(list.includes("skipRateLimit: true"), "skipRateLimit enabled");
  assert(list.includes('permission: "use_product"'), "preserves org auth permission");
  assert(list.includes('endpoint: "/api/project/list"'), "endpoint labeled");
  assert(list.includes("listProjects"), "uses listProjects");
  assert(list.includes("ok: true, projects"), "response shape preserved");
  assert(
    !list.includes("await runSaasOrgGate"),
    "list calls runApiProtection directly (not runSaasOrgGate wrapper)",
  );

  const gate = read("lib/saas/api-gate.ts");
  assert(gate.includes("export async function runSaasOrgGate"), "runSaasOrgGate retained for other routes");
  assert(gate.includes('export { runApiProtection }'), "runApiProtection re-exported");

  const protection = read("lib/security/api-protection.ts");
  assert(protection.includes("skipRateLimit"), "protection supports skipRateLimit");

  console.log("✓ project list latency P0");
  console.log("\nSTATUS: PASS");
}

main();
