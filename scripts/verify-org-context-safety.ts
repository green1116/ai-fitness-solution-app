/**
 * WP-ORG-CONTEXT-SAFETY-1 — static + pure resolution verification
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

const TARGETS = [
  "app/(workspace)/layout.tsx",
  "app/(workspace)/WorkspaceCrmWorkSurfacePanel.tsx",
  "app/api/lead/create/route.ts",
] as const;

function checkHelper() {
  const src = read("lib/organization/single-org-context.ts");
  assert(src.includes("ORG_CONTEXT_SAFETY_ID"), "wp id");
  assert(
    src.includes("export async function resolveExactSingleOrganizationForUser"),
    "resolve exported",
  );
  assert(
    src.includes("export async function resolveExactSingleOrganizationIdForUser"),
    "id helper exported",
  );
  assert(src.includes("listOrganizationsForUser"), "reuses list");
  assert(src.includes('reason: "organization-missing"'), "0 org fail closed");
  assert(src.includes('reason: "organization-ambiguous"'), ">1 org fail closed");
  assert(src.includes("memberships.length === 0"), "missing branch");
  assert(src.includes("memberships.length > 1"), "ambiguous branch");
  assert(src.includes("memberships.length === 0") || src.includes("length === 0"), "zero check");
  assert(!src.includes("orgs[0]"), "helper never indexes orgs[0]");
  assert(!src.includes("ensureOrganizationForUser"), "no auto-create");
  assert(!src.includes("prisma migrate"), "no migration");
  console.log("✓ single-org-context helper");
}

function checkTargets() {
  for (const file of TARGETS) {
    const src = read(file);
    assert(
      src.includes("resolveExactSingleOrganizationIdForUser") ||
        src.includes("resolveExactSingleOrganizationForUser"),
      `${file} uses shared helper`,
    );
    assert(!src.includes("orgs[0]"), `${file} no orgs[0]`);
    assert(
      !src.includes("listOrganizationsForUser"),
      `${file} does not call list directly`,
    );
  }
  console.log("✓ layout / CRM panel / lead create fail-closed wiring");
}

function checkSingleOrgPathPreserved() {
  const layout = read("app/(workspace)/layout.tsx");
  assert(layout.includes("WorkspaceOrganizationProvider"), "provider retained");
  assert(
    layout.includes("organizationId={organizationId ?? \"\"}") ||
      layout.includes('organizationId={organizationId ?? ""}'),
    "SSR org still passed when resolved",
  );
  assert(
    layout.includes("WorkspaceActionSurfacePanel"),
    "ops panel retained",
  );

  const crm = read("app/(workspace)/WorkspaceCrmWorkSurfacePanel.tsx");
  assert(crm.includes("assembleCrmWorkSurface"), "CRM surface retained");
  assert(crm.includes("if (!organizationId) return null"), "CRM fail closed");

  const lead = read("app/api/lead/create/route.ts");
  assert(lead.includes("resolveTrustedTenantPayload"), "tenant resolve retained");
  assert(lead.includes("if (!organizationId) return {}"), "lead fail closed");
  console.log("✓ single-org success path shape unchanged");
}

function checkRuntimeOpsUntouched() {
  const files = [
    "lib/runtime-ops/tenant-ops-operability.ts",
    "lib/runtime-ops/tenant-ops-org-gate.ts",
    "lib/runtime-ops/tenant-ops-execute.ts",
    "app/(workspace)/load-tenant-ops-operability.ts",
  ];
  for (const file of files) {
    const src = read(file);
    assert(!src.includes("single-org-context"), `${file} untouched`);
    assert(!src.includes("ORG_CONTEXT_SAFETY"), `${file} untouched`);
  }
  console.log("✓ Runtime Ops / WP1 untouched");
}

function main() {
  console.log("=== WP-ORG-CONTEXT-SAFETY-1 ===\n");
  checkHelper();
  checkTargets();
  checkSingleOrgPathPreserved();
  checkRuntimeOpsUntouched();
  console.log("\nSTATUS: PASS");
}

main();
