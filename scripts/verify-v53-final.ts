/**
 * V53 Workspace Runtime — Final Freeze verification
 */
import { existsSync, readdirSync, readFileSync } from "fs";
import { join } from "path";
import { assertRuntimeKernelIntegrityLocked } from "../lib/workspace-runtime/freeze/v53-runtime-snapshot";
import {
  V53_RUNTIME_FINAL_FREEZE,
  V53_RUNTIME_LAYER_STACK,
  V53_RUNTIME_PHASE_TAGS,
} from "../lib/workspace-runtime/freeze/v53-runtime-final";
import { V53_RUNTIME_META } from "../lib/workspace-runtime/freeze/v53-runtime-meta";
import { V53_RUNTIME_SNAPSHOT_BASE } from "../lib/workspace-runtime/freeze/v53-runtime-snapshot";
import {
  WORKSPACE_RUNTIME_FINAL_TAG,
  WORKSPACE_RUNTIME_FINAL_VERSION,
  WORKSPACE_RUNTIME_P8_TAG,
} from "../lib/workspace-runtime/shared/runtime-constants";
import { validateRuntimeP1 } from "../lib/workspace-runtime/validation/validate-runtime-p1";
import { validateRuntimeP2 } from "../lib/workspace-runtime/validation/validate-runtime-p2";
import { validateRuntimeP3 } from "../lib/workspace-runtime/validation/validate-runtime-p3";
import { validateRuntimeP4 } from "../lib/workspace-runtime/validation/validate-runtime-p4";
import { validateRuntimeP5 } from "../lib/workspace-runtime/validation/validate-runtime-p5";
import { validateRuntimeP6 } from "../lib/workspace-runtime/validation/validate-runtime-p6";
import { validateRuntimeP7 } from "../lib/workspace-runtime/validation/validate-runtime-p7";
import { validateRuntimeP8 } from "../lib/workspace-runtime/validation/validate-runtime-p8";

const RUNTIME_ROOT = join(process.cwd(), "lib", "workspace-runtime");

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function walkTsFiles(dir: string, options?: { excludeDirNames?: string[] }): string[] {
  const excludeDirNames = options?.excludeDirNames ?? [];
  const files: string[] = [];
  if (!existsSync(dir)) return files;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory() && excludeDirNames.includes(entry.name)) {
      continue;
    }
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...walkTsFiles(fullPath, options));
      continue;
    }
    if (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }
  return files;
}

const RUNTIME_AUDIT_OPTIONS = { excludeDirNames: ["validation", "freeze"] as string[] };

function auditNoPrisma(): boolean {
  const pattern = /@prisma\/client|from\s+["']@\/lib\/prisma["']/;
  return !walkTsFiles(RUNTIME_ROOT, RUNTIME_AUDIT_OPTIONS).some((file) =>
    pattern.test(readFileSync(file, "utf8")),
  );
}

function auditNoPersistence(): boolean {
  const pattern = /saas-product-persistence|persistenceRepositories|from\s+["']@\/lib\/saas-product-persistence["']/;
  return !walkTsFiles(RUNTIME_ROOT, RUNTIME_AUDIT_OPTIONS).some((file) =>
    pattern.test(readFileSync(file, "utf8")),
  );
}

function auditNoApi(): boolean {
  const pattern = /\/api\/|from\s+["']@\/app\/api|fetch\s*\(\s*["'`]\/api/;
  return !walkTsFiles(RUNTIME_ROOT, RUNTIME_AUDIT_OPTIONS).some((file) =>
    pattern.test(readFileSync(file, "utf8")),
  );
}

function auditNoBusinessLogic(): boolean {
  const pattern =
    /handleCreateQuote|calculateQuote|handleTransitionWorkflow|handleCreateProject|handleCreateReport|QuoteEngine|ApprovalFlow/;
  return !walkTsFiles(RUNTIME_ROOT, RUNTIME_AUDIT_OPTIONS).some((file) =>
    pattern.test(readFileSync(file, "utf8")),
  );
}

async function main() {
  const p1 = await validateRuntimeP1();
  assert(p1.valid, `V53 P1: ${p1.summary}`);
  console.log("✓ V53_P1_PASS");

  const p2 = await validateRuntimeP2();
  assert(p2.valid, `V53 P2: ${p2.summary}`);
  console.log("✓ V53_P2_PASS");

  const p3 = await validateRuntimeP3();
  assert(p3.valid, `V53 P3: ${p3.summary}`);
  console.log("✓ V53_P3_PASS");

  const p4 = await validateRuntimeP4();
  assert(p4.valid, `V53 P4: ${p4.summary}`);
  console.log("✓ V53_P4_PASS");

  const p5 = await validateRuntimeP5();
  assert(p5.valid, `V53 P5: ${p5.summary}`);
  console.log("✓ V53_P5_PASS");

  const p6 = await validateRuntimeP6();
  assert(p6.valid, `V53 P6: ${p6.summary}`);
  console.log("✓ V53_P6_PASS");

  const p7 = await validateRuntimeP7();
  assert(p7.valid, `V53 P7: ${p7.summary}`);
  console.log("✓ V53_P7_PASS");

  const p8 = await validateRuntimeP8();
  assert(p8.valid, `V53 P8: ${p8.summary}`);
  console.log("✓ V53_P8_PASS");

  assert(assertRuntimeKernelIntegrityLocked(), "RUNTIME_KERNEL_INTEGRITY_LOCKED");
  console.log("✓ RUNTIME_KERNEL_INTEGRITY_LOCKED");

  assert(auditNoPrisma(), "NO_PRISMA");
  console.log("✓ NO_PRISMA");

  assert(auditNoPersistence(), "NO_PERSISTENCE");
  console.log("✓ NO_PERSISTENCE");

  assert(auditNoApi(), "NO_API");
  console.log("✓ NO_API");

  assert(auditNoBusinessLogic(), "NO_BUSINESS_LOGIC");
  console.log("✓ NO_BUSINESS_LOGIC");

  assert(existsSync(join(RUNTIME_ROOT, "freeze", "v53-runtime-final.ts")), "final freeze file");
  assert(existsSync(join(RUNTIME_ROOT, "freeze", "v53-runtime-snapshot.ts")), "snapshot file");
  assert(existsSync(join(RUNTIME_ROOT, "freeze", "v53-runtime-meta.ts")), "meta file");

  assert(V53_RUNTIME_SNAPSHOT_BASE.workspaceRuntimeVersion === WORKSPACE_RUNTIME_FINAL_VERSION, "snapshot version");
  assert(V53_RUNTIME_SNAPSHOT_BASE.status === "frozen", "snapshot status");
  assert(V53_RUNTIME_SNAPSHOT_BASE.layers === 8, "snapshot layers");
  assert(V53_RUNTIME_SNAPSHOT_BASE.kernelIntegrity === "locked", "snapshot integrity");

  assert(V53_RUNTIME_META.tag === WORKSPACE_RUNTIME_FINAL_TAG, "runtime meta tag");
  assert(V53_RUNTIME_META.phase === "v53-workspace-runtime-final", "runtime meta phase");
  assert(V53_RUNTIME_META.frozen === true, "runtime meta frozen");
  assert(V53_RUNTIME_META.layers === 8, "runtime meta layers");
  assert(V53_RUNTIME_META.kernelIntegrity === "locked", "runtime meta integrity");
  assert(V53_RUNTIME_FINAL_FREEZE.dependencyTag === WORKSPACE_RUNTIME_P8_TAG, "final dependency tag");
  assert(V53_RUNTIME_PHASE_TAGS.length === 8, "phase tags");
  assert(V53_RUNTIME_LAYER_STACK.length === 8, "layer stack");
  console.log("✓ runtime final meta ok");

  console.log(`tag=${WORKSPACE_RUNTIME_FINAL_TAG}`);
  console.log(`version=${WORKSPACE_RUNTIME_FINAL_VERSION}`);
  console.log("V53 FINAL FREEZE PASS");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
