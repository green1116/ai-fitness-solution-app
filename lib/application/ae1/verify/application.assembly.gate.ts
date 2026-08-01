/**
 * AE-1 — Application Assembly verification gate.
 * Verification-first — registry / composition / contract only.
 */
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import {
  AE1_ASSEMBLY_GATE,
  AE1_ASSEMBLY_ID,
  AE1_BASE_FREEZE_REF,
  AE1_MODULE_PATH,
  AE1_NON_GOALS,
  AE1_PACKAGE_ID,
  AE1_PIG_REF,
  AE1_PRODUCT_DEFINITION_REF,
  APPLICATION_DEFINITION,
} from "../application.definition";
import {
  APPLICATION_CONTRACT,
  AE1_CONTRACT_ID,
  AE1_CONTRACT_INVARIANT_IDS,
} from "../application.contract";
import { resolveApplicationComposition } from "../application.composition";
import { resolveApplicationManifest } from "../application.manifest";
import { APPLICATION_METADATA } from "../application.metadata";
import {
  AE1_DOMAIN_IDS,
  AE1_DOMAIN_MODULE_PATHS,
  AE1_PACKAGE_IDS,
  AE1_PACKAGE_REGISTRY,
  AE1_SURFACE_IDS,
  AE1_SURFACE_REGISTRY,
} from "../application.registry";

export type ApplicationAssemblyCheck = Readonly<{
  id: string;
  source: "AE-1" | "PI-8" | "PD" | "PIG";
  title: string;
  status: "PASS" | "FAIL";
  evidence: string;
}>;

export type ApplicationAssemblyReport = Readonly<{
  layer: "AE-1";
  assemblyId: typeof AE1_ASSEMBLY_ID;
  gateId: typeof AE1_ASSEMBLY_GATE;
  baseFreezeRef: typeof AE1_BASE_FREEZE_REF;
  passed: boolean;
  checks: readonly ApplicationAssemblyCheck[];
  summary: Readonly<{
    surfaces: number;
    packages: number;
    domains: number;
    slots: number;
    invariants: number;
    tscPassed: boolean;
  }>;
}>;

function check(
  id: string,
  source: ApplicationAssemblyCheck["source"],
  title: string,
  ok: boolean,
  evidence: string,
): ApplicationAssemblyCheck {
  return {
    id,
    source,
    title,
    status: ok ? "PASS" : "FAIL",
    evidence,
  };
}

function resolveRoot(rootDir?: string): string {
  return rootDir
    ? path.resolve(rootDir)
    : path.resolve(__dirname, "../../../..");
}

function listTsFiles(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listTsFiles(full));
    else if (full.endsWith(".ts") || full.endsWith(".tsx")) out.push(full);
  }
  return out;
}

export function runApplicationAssemblyGate(
  rootDir?: string,
): ApplicationAssemblyReport {
  const root = resolveRoot(rootDir);
  const checks: ApplicationAssemblyCheck[] = [];

  checks.push(
    check(
      "AE1-IDS",
      "AE-1",
      "Application assembly IDs locked to AE-1 / Product Closure base",
      AE1_ASSEMBLY_ID === "application-assembly-ae1-v1" &&
        AE1_ASSEMBLY_GATE === "application-assembly-ae1-gate" &&
        AE1_PACKAGE_ID === "AE-1" &&
        AE1_BASE_FREEZE_REF === "pi-8-product-closure-v1" &&
        APPLICATION_DEFINITION.baseFreezeRef === AE1_BASE_FREEZE_REF &&
        APPLICATION_METADATA.baseFreezeRef === AE1_BASE_FREEZE_REF,
      `${AE1_ASSEMBLY_ID} / base=${AE1_BASE_FREEZE_REF}`,
    ),
  );

  checks.push(
    check(
      "AE1-UPSTREAM",
      "PD",
      "Product Definition and PIG refs locked (no redesign)",
      AE1_PRODUCT_DEFINITION_REF === "product-definition-v1" &&
        AE1_PIG_REF === "product-implementation-governance-v1" &&
        APPLICATION_DEFINITION.productDefinitionRef ===
          AE1_PRODUCT_DEFINITION_REF &&
        APPLICATION_DEFINITION.pigRef === AE1_PIG_REF,
      `pd=${AE1_PRODUCT_DEFINITION_REF} pig=${AE1_PIG_REF}`,
    ),
  );

  const manifest = resolveApplicationManifest();
  const composition = resolveApplicationComposition();
  checks.push(
    check(
      "AE1-REGISTRY",
      "AE-1",
      "Registry-based assembly over frozen surfaces",
      AE1_SURFACE_REGISTRY.length === AE1_SURFACE_IDS.length &&
        AE1_PACKAGE_REGISTRY.length === AE1_PACKAGE_IDS.length &&
        AE1_SURFACE_IDS.length === 10 &&
        AE1_PACKAGE_IDS.length === 8 &&
        manifest.matchesRegistry &&
        composition.registryAligned,
      `surfaces=${AE1_SURFACE_REGISTRY.length} packages=${AE1_PACKAGE_REGISTRY.length}`,
    ),
  );

  checks.push(
    check(
      "AE1-COMPOSITION",
      "AE-1",
      "Composition only — slots align with registry",
      composition.slots.length === AE1_SURFACE_REGISTRY.length &&
        composition.chain ===
          "PRODUCT_DEFINITION→PIG→DOMAIN→FRONTEND→BACKEND→DATA→INTEGRATION→DELIVERY→IMPLEMENTATION→CLOSURE" &&
        manifest.compositionOnly,
      `slots=${composition.slots.length} chain=${composition.chain}`,
    ),
  );

  const modulePaths = AE1_SURFACE_REGISTRY.filter(
    (s) => s.modulePath !== null,
  ).map((s) => s.modulePath as string);
  const missingModules = modulePaths.filter(
    (rel) => !fs.existsSync(path.join(root, rel)),
  );
  const missingEvidence = AE1_PACKAGE_REGISTRY.filter(
    (p) =>
      p.evidenceScript !== null &&
      !fs.existsSync(path.join(root, p.evidenceScript)),
  ).map((p) => p.evidenceScript);
  checks.push(
    check(
      "AE1-REUSE",
      "AE-1",
      "Existing layers / packages reused (paths + evidence present)",
      missingModules.length === 0 && missingEvidence.length === 0,
      missingModules.length || missingEvidence.length
        ? `missingModules=${missingModules.join(",")} missingEvidence=${missingEvidence.join(",")}`
        : `modules=${modulePaths.length} packages=${AE1_PACKAGE_REGISTRY.length}`,
    ),
  );

  const domainPathsOk = AE1_DOMAIN_IDS.every((id) =>
    fs.existsSync(path.join(root, AE1_DOMAIN_MODULE_PATHS[id])),
  );
  const forbiddenDomains = [
    "lib/product/m16",
    "lib/product/m17",
    "lib/domains",
  ].filter((p) => fs.existsSync(path.join(root, p)));
  checks.push(
    check(
      "AE1-DOMAINS",
      "AE-1",
      "Existing domains reused — no new Domain",
      domainPathsOk &&
        forbiddenDomains.length === 0 &&
        AE1_DOMAIN_IDS.join(",") === "M11,M12,M13,M14,M15" &&
        manifest.domains.join(",") === "M11,M12,M13,M14,M15",
      forbiddenDomains.length
        ? forbiddenDomains.join(",")
        : `domains=${AE1_DOMAIN_IDS.length}`,
    ),
  );

  checks.push(
    check(
      "AE1-CONTRACT",
      "AE-1",
      "Assembly contract invariants hold (no business / runtime / workflow / deployment)",
      APPLICATION_CONTRACT.contractId === AE1_CONTRACT_ID &&
        AE1_CONTRACT_INVARIANT_IDS.length === 9 &&
        APPLICATION_METADATA.hasBusinessLogic === false &&
        APPLICATION_METADATA.hasRuntime === false &&
        APPLICATION_METADATA.hasWorkflow === false &&
        APPLICATION_METADATA.hasDeployment === false &&
        AE1_NON_GOALS.includes("business-logic") &&
        AE1_NON_GOALS.includes("runtime") &&
        AE1_NON_GOALS.includes("workflow") &&
        AE1_NON_GOALS.includes("deployment"),
      `invariants=${AE1_CONTRACT_INVARIANT_IDS.length} kind=${APPLICATION_METADATA.kind}`,
    ),
  );

  const ae1Root = path.join(root, AE1_MODULE_PATH);
  const forbiddenTrees = [
    "runtime",
    "workflow",
    "deployment",
    "business",
    "engines",
    "new-architecture",
  ].filter((name) => fs.existsSync(path.join(ae1Root, name)));
  checks.push(
    check(
      "AE1-NO-ARCH",
      "AE-1",
      "No new architecture / runtime / workflow / deployment under AE-1",
      forbiddenTrees.length === 0 &&
        fs.existsSync(path.join(ae1Root, "application.definition.ts")) &&
        fs.existsSync(path.join(ae1Root, "application.registry.ts")) &&
        fs.existsSync(path.join(ae1Root, "application.composition.ts")) &&
        fs.existsSync(path.join(ae1Root, "application.manifest.ts")) &&
        fs.existsSync(path.join(ae1Root, "application.metadata.ts")) &&
        fs.existsSync(path.join(ae1Root, "application.contract.ts")) &&
        fs.existsSync(
          path.join(ae1Root, "verify/application.assembly.gate.ts"),
        ),
      forbiddenTrees.length
        ? forbiddenTrees.join(",")
        : `tree=${AE1_MODULE_PATH}`,
    ),
  );

  const ae1Files = listTsFiles(ae1Root);
  const coupleHits = ae1Files.filter((file) => {
    const text = fs.readFileSync(file, "utf8");
    return /from\s+["']@\/lib\/(frontend|backend|data|integration|delivery|implementation|closure|product)|from\s+["'][^"']*lib\/(frontend|backend|data|integration|delivery|implementation|closure|product)/.test(
      text,
    );
  });
  checks.push(
    check(
      "AE1-NO-COUPLE",
      "AE-1",
      "No cross-layer coupling (path/ID refs only)",
      coupleHits.length === 0,
      coupleHits.length
        ? coupleHits.map((f) => path.relative(root, f)).join(",")
        : `scanned=${ae1Files.length}`,
    ),
  );

  checks.push(
    check(
      "AE1-BASE",
      "PI-8",
      "Base freeze is Product Closure pi-8-product-closure-v1",
      manifest.baseFreezeRef === "pi-8-product-closure-v1" &&
        AE1_SURFACE_REGISTRY.some(
          (s) =>
            s.surfaceId === "CLOSURE" &&
            s.freezeOrBaselineRef === "pi-8-product-closure-v1",
        ) &&
        AE1_PACKAGE_REGISTRY.some(
          (p) =>
            p.packageId === "PI-8" && p.freezeId === "pi-8-product-closure-v1",
        ),
      AE1_BASE_FREEZE_REF,
    ),
  );

  const tscBin = path.join(root, "node_modules", "typescript", "bin", "tsc");
  const tsc = fs.existsSync(tscBin)
    ? spawnSync(
        process.execPath,
        [
          tscBin,
          "--noEmit",
          "--pretty",
          "false",
          "--strict",
          "--module",
          "esnext",
          "--moduleResolution",
          "bundler",
          "--target",
          "ES2017",
          "--esModuleInterop",
          "--skipLibCheck",
          ...ae1Files.map((f) => path.relative(root, f)),
        ],
        { cwd: root, encoding: "utf8" },
      )
    : spawnSync(
        "npx",
        [
          "tsc",
          "--noEmit",
          "--pretty",
          "false",
          "--strict",
          "--module",
          "esnext",
          "--moduleResolution",
          "bundler",
          "--target",
          "ES2017",
          "--esModuleInterop",
          "--skipLibCheck",
          ...ae1Files.map((f) => path.relative(root, f)),
        ],
        { cwd: root, encoding: "utf8", shell: true },
      );
  const tscPassed = tsc.status === 0;
  checks.push(
    check(
      "AE1-TSC",
      "AE-1",
      "TypeScript check passes for AE-1 assembly tree",
      tscPassed,
      tscPassed
        ? `files=${ae1Files.length}`
        : (tsc.stdout || tsc.stderr || "tsc failed").slice(0, 500),
    ),
  );

  const passed = checks.every((c) => c.status === "PASS");
  return {
    layer: "AE-1",
    assemblyId: AE1_ASSEMBLY_ID,
    gateId: AE1_ASSEMBLY_GATE,
    baseFreezeRef: AE1_BASE_FREEZE_REF,
    passed,
    checks,
    summary: {
      surfaces: AE1_SURFACE_REGISTRY.length,
      packages: AE1_PACKAGE_REGISTRY.length,
      domains: AE1_DOMAIN_IDS.length,
      slots: composition.slots.length,
      invariants: AE1_CONTRACT_INVARIANT_IDS.length,
      tscPassed,
    },
  };
}

export function assertApplicationAssemblyGate(
  report: ApplicationAssemblyReport = runApplicationAssemblyGate(),
): void {
  if (!report.passed) {
    const failed = report.checks.filter((c) => c.status === "FAIL");
    throw new Error(
      `Application assembly gate FAILED: ${failed.map((f) => f.id).join(", ")}`,
    );
  }
}
