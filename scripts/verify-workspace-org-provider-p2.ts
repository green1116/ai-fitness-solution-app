/**
 * WP workspace P2 — auth waterfall removal via WorkspaceOrganizationProvider
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
  console.log("=== Workspace Organization Provider P2 ===\n");

  const provider = read("app/(workspace)/WorkspaceOrganizationProvider.tsx");
  assert(provider.includes('"use client"'), "provider is client");
  assert(provider.includes("createContext"), "provider uses context");
  assert(provider.includes("useWorkspaceOrganizationId"), "hook exported");
  assert(!provider.includes("fetch("), "provider has no fetch");
  console.log("✓ WorkspaceOrganizationProvider");

  const layout = read("app/(workspace)/layout.tsx");
  assert(layout.includes("WorkspaceOrganizationProvider"), "layout mounts provider");
  assert(layout.includes("listOrganizationsForUser"), "layout still resolves org once");
  assert(layout.includes("organizationId={organizationId ?? \"\"}") || layout.includes('organizationId={organizationId ?? ""}'), "SSR org passed");
  console.log("✓ workspace layout");

  const client = read("app/(workspace)/projects/ProjectsPageClient.tsx");
  assert(client.includes("useWorkspaceOrganizationId"), "client uses hook");
  assert(!client.includes("/api/auth/me"), "no auth/me");
  assert(!client.includes("resolveOrganizationId"), "no client org resolver");
  assert(client.includes("/api/project/list"), "list preserved");
  assert(client.includes("/api/project/create"), "create preserved");
  assert(client.includes("x-organization-id"), "org header preserved");
  console.log("✓ ProjectsPageClient");

  const page = read("app/(workspace)/projects/page.tsx");
  assert(!page.includes("listOrganizationsForUser"), "page does not re-resolve org");
  assert(!page.includes("WorkspaceOrganizationProvider"), "page has no provider");
  console.log("✓ projects/page untouched for org");

  console.log("\nSTATUS: PASS");
}

main();
