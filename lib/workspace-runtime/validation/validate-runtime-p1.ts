import { existsSync, readFileSync } from "fs";
import { join } from "path";
import { assertRuntimeContractRegistryFoundationOnly } from "../foundation-runtime-contracts";
import {
  assertWorkspaceRuntimeContextContract,
  createWorkspaceRuntimeContext,
} from "../runtime-context";
import { assertRuntimeSchemaFoundationOnly } from "../runtime-validation";
import type { RuntimeP1Validation } from "../runtime-types";
import { WORKSPACE_RUNTIME_P1_TAG } from "../shared/runtime-constants";

const RUNTIME_ROOT = join(process.cwd(), "lib", "workspace-runtime");

export async function validateRuntimeP1(): Promise<RuntimeP1Validation> {
  const context = createWorkspaceRuntimeContext({ workspaceId: "p1-validate" });
  const valid =
    existsSync(join(RUNTIME_ROOT, "runtime-types.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-contracts.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-context.ts")) &&
    existsSync(join(RUNTIME_ROOT, "runtime-validation.ts")) &&
    assertRuntimeSchemaFoundationOnly() &&
    assertRuntimeContractRegistryFoundationOnly() &&
    assertWorkspaceRuntimeContextContract(context);

  return {
    valid,
    summary: [
      `p1Tag=${WORKSPACE_RUNTIME_P1_TAG}`,
      `context=${assertWorkspaceRuntimeContextContract(context)}`,
      `schema=${assertRuntimeSchemaFoundationOnly()}`,
      `contracts=${assertRuntimeContractRegistryFoundationOnly()}`,
      `valid=${valid}`,
    ].join(" "),
  };
}

export function assertRuntimeTypesContract(): boolean {
  const typesPath = join(RUNTIME_ROOT, "runtime-types.ts");
  const content = readFileSync(typesPath, "utf8");
  return (
    content.includes("WorkspaceRuntime") &&
    content.includes("QuoteRuntime") &&
    content.includes("ProjectRuntime") &&
    content.includes("ReportRuntime") &&
    content.includes("RuntimeStatus") &&
    content.includes("RuntimeCapability")
  );
}

export function assertRuntimeContractsContract(): boolean {
  const contractsPath = join(RUNTIME_ROOT, "runtime-contracts.ts");
  const foundationPath = join(RUNTIME_ROOT, "foundation-runtime-contracts.ts");
  const contracts = readFileSync(contractsPath, "utf8");
  const foundation = readFileSync(foundationPath, "utf8");
  return (
    contracts.includes("RuntimeContract") &&
    foundation.includes("WORKSPACE_RUNTIME_CONTRACT_REGISTRY") &&
    foundation.includes("WORKSPACE_RUNTIME_CONTRACT")
  );
}

export function assertRuntimeContextContract(): boolean {
  const contextPath = join(RUNTIME_ROOT, "runtime-context.ts");
  const content = readFileSync(contextPath, "utf8");
  return (
    content.includes("WorkspaceRuntimeContext") &&
    content.includes("createWorkspaceRuntimeContext") &&
    content.includes("assertWorkspaceRuntimeContextContract")
  );
}

export function assertRuntimeValidationContract(): boolean {
  const validationPath = join(RUNTIME_ROOT, "runtime-validation.ts");
  const content = readFileSync(validationPath, "utf8");
  return (
    content.includes("validateWorkspaceRuntime") &&
    content.includes("validateQuoteRuntime") &&
    content.includes("validateProjectRuntime") &&
    content.includes("validateReportRuntime") &&
    content.includes("assertRuntimeSchemaFoundationOnly")
  );
}

export function assertRuntimeFoundationOnlyScope(): boolean {
  const files = [
    join(RUNTIME_ROOT, "runtime-types.ts"),
    join(RUNTIME_ROOT, "runtime-contracts.ts"),
    join(RUNTIME_ROOT, "runtime-context.ts"),
    join(RUNTIME_ROOT, "runtime-validation.ts"),
    join(RUNTIME_ROOT, "foundation-runtime-contracts.ts"),
  ];
  const forbidden = [
    /@prisma\/client/,
    /from\s+["']@\/lib\/prisma["']/,
    /saas-product-persistence/,
    /persistenceRepositories/,
    /handleCreateQuote/,
    /calculateQuote/,
    /handleTransitionWorkflow/,
    /handleCreateProject/,
    /handleCreateReport/,
  ];
  return files.every((file) => {
    const content = readFileSync(file, "utf8");
    return !forbidden.some((pattern) => pattern.test(content));
  });
}
