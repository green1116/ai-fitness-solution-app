/**
 * V3.4-E15 Runtime State Machine 冒烟验证
 */
import {
  buildRuntimeStateMachine,
  RUNTIME_STATE_MACHINE_CONTRACT,
  runExecutiveApprovalGateRuntime,
  runExecutiveOversightRuntime,
  runExecutiveReleaseSurfaceRuntime,
  runExternalEvidenceRuntime,
  runRuntimeCorrelationIntelligence,
  runRuntimePolicyEngine,
  runRuntimeStateMachine,
  runTenderGovernanceRuntime,
} from "../lib/evidence";
import { runEvidenceCoverageRuntime } from "../lib/evidence/coverage";
import { runTenderAuditRuntime } from "../lib/evidence/audit";
import { runTenderDecisionRuntime } from "../lib/evidence/decision";
import { runTenderValidationRuntime } from "../lib/evidence/validation";
import { buildFixtureLinking } from "./helpers/evidence-fixture";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

async function buildFullStack() {
  const { requirements, linking, registry, attachments, ocrDocuments } =
    await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const tenderValidation = runTenderValidationRuntime({
    document: { documentId: "fsm-1" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments,
  });
  const tenderAudit = runTenderAuditRuntime({
    runId: "fsm-1",
    documentId: "fsm-1",
    startedAt: new Date().toISOString(),
    requirements,
    ocrDocuments,
    linking,
    coverageRuntime,
    tenderValidation,
    registry,
    attachments,
  });
  const tenderDecision = runTenderDecisionRuntime({
    runId: "fsm-1",
    documentId: "fsm-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    linking,
  });
  const tenderGovernance = runTenderGovernanceRuntime({
    runId: "fsm-1",
    documentId: "fsm-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
  });
  const executiveOversight = runExecutiveOversightRuntime({
    runId: "fsm-1",
    documentId: "fsm-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });
  const executiveApprovalGate = runExecutiveApprovalGateRuntime({
    runId: "fsm-1",
    documentId: "fsm-1",
    executiveOversight,
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });
  const executiveReleaseSurface = runExecutiveReleaseSurfaceRuntime({
    runId: "fsm-1",
    documentId: "fsm-1",
    executiveOversight,
    executiveApprovalGate,
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });
  const runtimeCorrelation = runRuntimeCorrelationIntelligence({
    runId: "fsm-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderGovernance,
    executiveOversight,
    executiveApprovalGate,
    executiveReleaseSurface,
    linking,
    ocrDocuments,
  });
  const runtimePolicy = runRuntimePolicyEngine({
    runId: "fsm-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderGovernance,
    executiveOversight,
    executiveApprovalGate,
    executiveReleaseSurface,
    runtimeCorrelation,
    linking,
    ocrDocuments,
  });
  return {
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    executiveOversight,
    executiveApprovalGate,
    executiveReleaseSurface,
    runtimeCorrelation,
    runtimePolicy,
    linking,
    ocrDocuments,
  };
}

async function testStateMachineBlocked() {
  assert(
    RUNTIME_STATE_MACHINE_CONTRACT.pipeline.join("→") ===
      "initialize_draft→progress_evidence→progress_governance→resolve_terminal_state→debug",
    "contract",
  );

  const ctx = await buildFullStack();
  const pkg = buildRuntimeStateMachine({
    runId: "fsm-1",
    ranAt: new Date().toISOString(),
    attachmentCount: 1,
    ...ctx,
  });

  assert(pkg.version === "3.4-e15", "version");
  assert(pkg.currentState === "release-blocked", "blocked terminal");
  assert(pkg.transitions.length > 0, "transitions");
  assert(pkg.transitions.every((t) => t.deterministic === true), "deterministic");
  assert(!pkg.releasable, "not releasable");
  assert(pkg.debug.summary.includes("[RuntimeStateMachine]"), "debug");

  const fsm = runRuntimeStateMachine({ runId: "fsm-1", attachmentCount: 1, ...ctx });
  assert(fsm.currentState === pkg.currentState, "wrapper state");

  console.log("✓ buildRuntimeStateMachine blocked (V3.4-E15)");
  console.log(" ", `state=${fsm.currentState} transitions=${fsm.transitions.length}`);
}

async function testReleasedPath() {
  const result = await runExternalEvidenceRuntime({
    attachments: [
      {
        buffer: Buffer.from("ISO9001 质量管理体系认证证书", "utf8"),
        fileName: "cert.txt",
        mimeType: "text/plain",
      },
    ],
    requirementItems: [
      {
        id: "req-1",
        title: "ISO9001",
        text: "ISO9001 质量管理体系认证",
        keywords: ["ISO9001"],
        mandatory: true,
        category: "qualification",
      },
    ],
    tenderDocument: { documentId: "fsm-bid", tenderTitle: "状态机测试" },
  });

  assert(result.ok, "runtime ok");
  if (!result.ok) return;

  const fsm = result.runtimeStateMachine;
  assert(fsm?.version === "3.4-e15", "runtimeStateMachine");
  assert(
    ["released", "release-approved", "executive-approved"].includes(fsm.currentState),
    `release path got ${fsm.currentState}`,
  );
  if (fsm.currentState === "released" || fsm.currentState === "release-approved") {
    assert(fsm.releasable === true, "releasable when release-approved");
  }
  assert(fsm.transitions.some((t) => t.to === "ocr-verified"), "ocr transition");

  console.log("✓ Full pipeline lifecycle");
  console.log("  currentState:", fsm.currentState);
  console.log("  last transition:", fsm.transitions[fsm.transitions.length - 1]?.to);
}

async function testEvidencePending() {
  const pkg = buildRuntimeStateMachine({
    runId: "fsm-empty",
    attachmentCount: 0,
  });
  assert(pkg.currentState === "evidence-pending", "no evidence");
  console.log("✓ Evidence pending path");
}

async function main() {
  await testStateMachineBlocked();
  await testReleasedPath();
  await testEvidencePending();
  console.log("\nAll runtime state machine checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
