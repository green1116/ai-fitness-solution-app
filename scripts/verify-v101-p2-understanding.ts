/**
 * E01-P2 — Tender Document Understanding verification
 * TenderWorkspace → DocumentStructure → RequirementIndex lifecycle
 */
import fs from "node:fs";
import path from "node:path";

import { runTenderIntakeKernelOrThrow } from "../lib/tender-intelligence/v101/intake";
import {
  assertUnderstandingKernelPass,
  buildDocumentStructure,
  buildRequirementIndex,
  buildUnderstandingKernel,
  DOCUMENT_SECTION_KINDS,
  formatUnderstandingKernelSummary,
  REQUIREMENT_CATEGORIES,
  runUnderstandingKernel,
  runUnderstandingKernelOrThrow,
  UNDERSTANDING_LIFECYCLE_STAGES,
  validateDocumentStructure,
  validateRequirementIndex,
  validateTenderWorkspaceInput,
  V101_TENDER_UNDERSTANDING_FREEZE_VERSION,
  V101_TENDER_UNDERSTANDING_VERSION,
} from "../lib/tender-intelligence/v101/understanding";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v101-p2-understanding";

const SAMPLE_TENDER = `
项目名称：星河科技园企业健身中心建设项目
招标人：星河科技园管理有限公司
建设地点：上海市浦东新区

一、项目目标
建设面积约 1200 平方米的企业健身中心，服务园区 200 名员工。

二、技术标准与功能需求
1. 有氧区配置跑步机不少于 8 台，力量区器械满足国标要求。
2. 场地面积不小于 1000 ㎡，净高不低于 3.2m。
3. 设备需符合 GB/T 22517 相关标准，提供 2 年质保。

三、商务与预算
项目预算限价 280 万元，投标截止 2026-08-01。

四、评标办法
技术标 60 分，商务标 40 分。

五、交付成果
提交方案书、设备清单、预算书及施工组织方案。
`.trim();

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/tender-intelligence/v101/understanding/understanding.types.ts",
    "lib/tender-intelligence/v101/understanding/understanding.schema.ts",
    "lib/tender-intelligence/v101/understanding/understanding.builder.ts",
    "lib/tender-intelligence/v101/understanding/understanding.entry.ts",
    "lib/tender-intelligence/v101/understanding/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testSchemaGuards() {
  check(DOCUMENT_SECTION_KINDS.length >= 6, "section kinds");
  check(REQUIREMENT_CATEGORIES.length >= 6, "requirement categories");
  check(UNDERSTANDING_LIFECYCLE_STAGES.length === 3, "lifecycle stages");

  const badWorkspace = validateTenderWorkspaceInput({ id: "x" });
  check(!badWorkspace.ok, "incomplete workspace rejected");

  console.log("✓ schema guards");
}

function testStructureAndIndex() {
  const intake = runTenderIntakeKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-upstream`,
    projectHint: "星河科技园企业健身中心",
    organizationHint: "星河科技园管理有限公司",
    source: {
      kind: "paste",
      rawText: SAMPLE_TENDER,
    },
  });

  const workspace = intake.workspace;
  check(workspace.readOnly === true, "workspace readOnly");

  const structure = buildDocumentStructure({
    workspace,
    rawText: SAMPLE_TENDER,
  });
  check(structure.workspaceId === workspace.id, "structure.workspaceId");
  check(structure.sectionCount >= 3, "section count");
  check(structure.status === "structured", "structure status");
  check(validateDocumentStructure(structure).ok, "structure schema");

  const index = buildRequirementIndex({
    workspace,
    structure,
    rawText: SAMPLE_TENDER,
  });
  check(index.structureId === structure.id, "index.structureId");
  check(index.workspaceId === workspace.id, "index.workspaceId");
  check(index.entryCount >= 3, "requirement entries");
  check(index.mustCount >= 1, "must requirements");
  check(index.status === "ready", "index ready");
  check(validateRequirementIndex(index).ok, "index schema");

  console.log("✓ workspace → structure → requirement index");
}

function testKernel() {
  const intake = runTenderIntakeKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-kernel-upstream`,
    projectHint: "星河科技园企业健身中心",
    source: {
      kind: "paste",
      rawText: SAMPLE_TENDER,
    },
  });

  const result = runUnderstandingKernel({
    deploymentId: DEPLOYMENT_ID,
    workspace: intake.workspace,
    rawText: SAMPLE_TENDER,
  });

  check(result.version === V101_TENDER_UNDERSTANDING_VERSION, "version");
  check(result.freezeVersion === V101_TENDER_UNDERSTANDING_FREEZE_VERSION, "freeze");
  check(result.ready === true, "ready");
  check(result.readinessScore === 100, "score 100");
  check(result.lifecycle.complete === true, "lifecycle complete");
  check(result.lifecycle.current === "requirements", "lifecycle at requirements");
  check(result.lifecycle.transitions.length >= 2, "transitions");
  check(result.structure !== null, "structure present");
  check(result.requirementIndex !== null, "requirement index present");

  assertUnderstandingKernelPass(result);

  const forced = runUnderstandingKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-throw`,
    workspace: intake.workspace,
    rawText: SAMPLE_TENDER,
  });
  check(forced.ready === true, "orThrow ready");

  const fromBuilder = buildUnderstandingKernel({
    deploymentId: `${DEPLOYMENT_ID}-builder`,
    workspace: intake.workspace,
    rawText: SAMPLE_TENDER,
    languageHint: "zh",
  });
  check(fromBuilder.structure?.language === "zh", "language zh");

  console.log("✓ understanding kernel");
  console.log(formatUnderstandingKernelSummary(result));
}

function main() {
  console.log("E01-P2 — Tender Document Understanding Verification\n");
  checkModuleStructure();
  testSchemaGuards();
  testStructureAndIndex();
  testKernel();
  console.log("\nPASS — V101 P2 understanding (Workspace → Structure → RequirementIndex)");
}

main();
