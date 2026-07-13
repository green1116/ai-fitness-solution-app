/**
 * E01-P1 — Tender Intake Kernel verification
 * TenderSource → TenderIntakeRecord → TenderWorkspace lifecycle
 */
import fs from "node:fs";
import path from "node:path";

import {
  advanceTenderIntakeRecord,
  assertTenderIntakeKernelPass,
  buildTenderIntakeKernel,
  buildTenderIntakeRecord,
  buildTenderSource,
  buildTenderWorkspace,
  canAdvanceIntakeStatus,
  formatTenderIntakeKernelSummary,
  runTenderIntakeKernel,
  runTenderIntakeKernelOrThrow,
  TENDER_INTAKE_LIFECYCLE_STAGES,
  TENDER_SOURCE_KINDS,
  validateTenderSourceInput,
  V101_TENDER_INTAKE_FREEZE_VERSION,
  V101_TENDER_INTAKE_VERSION,
} from "../lib/tender-intelligence/v101/intake";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v101-p1-tender-intake";

function check(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

function checkModuleStructure() {
  const required = [
    "lib/tender-intelligence/v101/intake/intake.types.ts",
    "lib/tender-intelligence/v101/intake/intake.schema.ts",
    "lib/tender-intelligence/v101/intake/intake.builder.ts",
    "lib/tender-intelligence/v101/intake/intake.entry.ts",
    "lib/tender-intelligence/v101/intake/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testSourceSchema() {
  check(TENDER_SOURCE_KINDS.length === 4, "source kinds");

  const badUpload = validateTenderSourceInput({ kind: "upload" });
  check(!badUpload.ok, "upload without fileName fails");

  const okPaste = validateTenderSourceInput({
    kind: "paste",
    rawText: "项目名称：星河科技园企业健身中心",
  });
  check(okPaste.ok, "paste source valid");

  const okUrl = validateTenderSourceInput({
    kind: "url",
    uri: "https://example.com/tender.pdf",
  });
  check(okUrl.ok, "url source valid");

  let threw = false;
  try {
    buildTenderSource({ kind: "upload", fileName: "a.pdf" });
  } catch {
    threw = true;
  }
  check(threw, "invalid upload throws");

  console.log("✓ source schema");
}

function testLifecycleChain() {
  const source = buildTenderSource({
    kind: "upload",
    fileName: "xinghe-gym-tender.pdf",
    mimeType: "application/pdf",
    byteLength: 2048,
    rawText: "项目名称：星河科技园企业健身中心建设项目",
  });
  check(source.readOnly === true, "source readOnly");
  check(Boolean(source.contentHash), "content hash");

  let intake = buildTenderIntakeRecord({
    source,
    projectHint: "星河科技园企业健身中心",
    organizationHint: "星河科技园管理有限公司",
  });
  check(intake.status === "received", "intake received");
  check(canAdvanceIntakeStatus("received", "validated"), "received→validated");
  check(!canAdvanceIntakeStatus("received", "workspace_ready"), "skip advance blocked");

  intake = advanceTenderIntakeRecord(intake, "validated", source);
  intake = advanceTenderIntakeRecord(intake, "normalized", source);
  check(Boolean(intake.normalizedTitle), "normalized title");
  intake = advanceTenderIntakeRecord(intake, "workspace_ready", source);

  const workspace = buildTenderWorkspace({ intake, source });
  check(workspace.status === "draft", "workspace draft");
  check(workspace.intakeId === intake.id, "workspace links intake");
  check(workspace.sourceId === source.id, "workspace links source");
  check(workspace.title.includes("星河"), "workspace title");

  console.log("✓ source → intake → workspace chain");
}

function testKernel() {
  const result = runTenderIntakeKernel({
    deploymentId: DEPLOYMENT_ID,
    projectHint: "星河科技园企业健身中心",
    organizationHint: "星河科技园管理有限公司",
    source: {
      kind: "paste",
      rawText: [
        "项目名称：星河科技园企业健身中心建设项目",
        "招标人：星河科技园管理有限公司",
        "建设地点：上海市浦东新区",
      ].join("\n"),
    },
  });

  check(result.version === V101_TENDER_INTAKE_VERSION, "version");
  check(result.freezeVersion === V101_TENDER_INTAKE_FREEZE_VERSION, "freeze");
  check(result.ready === true, "ready");
  check(result.readinessScore === 100, "score 100");
  check(result.lifecycle.complete === true, "lifecycle complete");
  check(result.lifecycle.current === "workspace", "lifecycle at workspace");
  check(result.lifecycle.stages.length === TENDER_INTAKE_LIFECYCLE_STAGES.length, "stages");
  check(result.lifecycle.transitions.length >= 2, "transitions");
  check(result.workspace !== null, "workspace present");
  check(result.intake.sourceId === result.source.id, "intake.sourceId");
  check(result.workspace!.intakeId === result.intake.id, "workspace.intakeId");

  assertTenderIntakeKernelPass(result);
  const forced = runTenderIntakeKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-throw`,
    source: {
      kind: "api",
      uri: "https://api.example.com/tenders/1",
      rawText: "企业健身中心设备采购",
    },
  });
  check(forced.ready === true, "orThrow ready");

  const fromBuilder = buildTenderIntakeKernel({
    deploymentId: `${DEPLOYMENT_ID}-builder`,
    source: {
      kind: "url",
      uri: "https://example.com/docs/tender.pdf",
    },
    projectHint: "URL Tender Project",
  });
  check(fromBuilder.workspace?.title === "URL Tender Project", "builder title hint");

  console.log("✓ tender intake kernel");
  console.log(formatTenderIntakeKernelSummary(result));
}

function main() {
  console.log("E01-P1 — Tender Intake Kernel Verification\n");
  checkModuleStructure();
  testSourceSchema();
  testLifecycleChain();
  testKernel();
  console.log("\nPASS — V101 P1 tender intake (TenderSource → Intake → Workspace)");
}

main();
