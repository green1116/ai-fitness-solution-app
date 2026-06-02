/**
 * V3.4-E14 Runtime Policy Engine 冒烟验证
 */
import {
  DEFAULT_ENTERPRISE_RUNTIME_POLICIES,
  evaluateRuntimePolicy,
  RUNTIME_POLICY_ENGINE_CONTRACT,
  runExecutiveApprovalGateRuntime,
  runExecutiveOversightRuntime,
  runExecutiveReleaseSurfaceRuntime,
  runExternalEvidenceRuntime,
  runRuntimeCorrelationIntelligence,
  runRuntimePolicyEngine,
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

async function testPolicyFromFixture() {
  assert(
    RUNTIME_POLICY_ENGINE_CONTRACT.pipeline.join("→") ===
      "collect_metrics→load_policies→evaluate_rules→aggregate_actions→debug",
    "contract",
  );
  assert(DEFAULT_ENTERPRISE_RUNTIME_POLICIES.length >= 10, "default policies");

  const { requirements, linking, registry, attachments, ocrDocuments } =
    await buildFixtureLinking();
  const coverageRuntime = runEvidenceCoverageRuntime({ requirements, linking });
  const tenderValidation = runTenderValidationRuntime({
    document: { documentId: "pol-1" },
    requirements,
    coverageRuntime,
    linking,
    registry,
    attachments,
  });
  const tenderAudit = runTenderAuditRuntime({
    runId: "pol-1",
    documentId: "pol-1",
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
    runId: "pol-1",
    documentId: "pol-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    linking,
  });
  const tenderGovernance = runTenderGovernanceRuntime({
    runId: "pol-1",
    documentId: "pol-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
  });
  const executiveOversight = runExecutiveOversightRuntime({
    runId: "pol-1",
    documentId: "pol-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });
  const gate = runExecutiveApprovalGateRuntime({
    runId: "pol-1",
    documentId: "pol-1",
    executiveOversight,
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderDecision,
    tenderGovernance,
    linking,
    ocrDocuments,
  });
  const surface = runExecutiveReleaseSurfaceRuntime({
    runId: "pol-1",
    documentId: "pol-1",
    executiveOversight,
    executiveApprovalGate: gate,
  });
  const correlation = runRuntimeCorrelationIntelligence({
    runId: "pol-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderGovernance,
    executiveOversight,
    executiveApprovalGate: gate,
    executiveReleaseSurface: surface,
    linking,
    ocrDocuments,
  });

  const pkg = evaluateRuntimePolicy({
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderGovernance,
    executiveOversight,
    executiveApprovalGate: gate,
    executiveReleaseSurface: surface,
    runtimeCorrelation: correlation,
    linking,
    ocrDocuments,
  });

  assert(pkg.version === "3.4-e14", "version");
  assert(pkg.blocked === true, "fixture should block");
  assert(pkg.actions.includes("block-release"), "block action");
  assert(pkg.triggeredPolicies.length > 0, "triggered");
  assert(pkg.debug.summary.includes("[RuntimePolicyEngine]"), "debug");

  const engine = runRuntimePolicyEngine({
    runId: "pol-1",
    coverageRuntime,
    tenderValidation,
    tenderAudit,
    tenderGovernance,
    executiveOversight,
    executiveApprovalGate: gate,
    executiveReleaseSurface: surface,
    runtimeCorrelation: correlation,
    linking,
    ocrDocuments,
  });

  assert(engine.blocked === pkg.blocked, "wrapper blocked");

  console.log("✓ evaluateRuntimePolicy (V3.4-E14)");
  console.log(" ", `triggered=${engine.triggeredPolicies.length} blocked=${engine.blocked}`);
}

async function testApprovePathPolicies() {
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
    tenderDocument: { documentId: "pol-bid", tenderTitle: "Policy 测试" },
  });

  assert(result.ok, "runtime ok");
  if (!result.ok) return;

  const policy = result.runtimePolicy;
  assert(policy?.version === "3.4-e14", "runtimePolicy");
  const runtimePolicy = policy;
  if (!runtimePolicy) return;
  assert(!runtimePolicy.blocked, "approve path not blocked");
  assert(
    typeof runtimePolicy.metrics.executiveScore !== "number" ||
      runtimePolicy.metrics.executiveScore >= 75,
    "score",
  );

  console.log("✓ Full pipeline policy (approve)");
  console.log("  triggered:", runtimePolicy.triggeredPolicies.length);
  console.log("  actions:", runtimePolicy.actions.join(", ") || "(none)");
}

async function testCustomPolicy() {
  const executiveOversight = {
    version: "3.4-e9" as const,
    executiveApproved: true,
    executiveScore: 95,
    findings: [],
    recommendation: "approve" as const,
    risk: { executiveRisk: "acceptable" as const, executiveScore: 95 },
    recommendations: [],
    debug: {
      summary: "",
      findings: "",
      criticalFindings: "",
      recommendations: "",
    },
  };
  const executiveApprovalGate = {
    version: "3.4-e10" as const,
    status: "approved" as const,
    releasable: true,
    reasons: [],
    executiveScore: 95,
    recommendation: "release" as const,
    tenderReleaseDecision: "release-authorized" as const,
    debug: {
      summary: "",
      gateStatus: "",
      blockReasons: "",
      releaseConditions: "",
    },
    runId: "pol-custom",
    ranAt: new Date().toISOString(),
    durationMs: 0,
    documentId: "pol-custom",
    trace: {
      version: "3.4-e10" as const,
      runId: "pol-custom",
      events: [],
    },
  };

  const pkg = evaluateRuntimePolicy({
    policies: [
      {
        id: "POL_CUSTOM_HIGH_SCORE",
        metric: "executiveScore",
        operator: "gte",
        value: 90,
        action: "raise-governance-warning",
        deterministic: true,
      },
    ],
    executiveOversight,
    executiveApprovalGate,
  });

  assert(
    pkg.triggeredPolicies.includes("POL_CUSTOM_HIGH_SCORE"),
    "custom rule",
  );
  assert(pkg.actions.includes("raise-governance-warning"), "warning action");

  console.log("✓ Custom policy rule");
}

async function main() {
  await testPolicyFromFixture();
  await testApprovePathPolicies();
  await testCustomPolicy();
  console.log("\nAll runtime policy engine checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
