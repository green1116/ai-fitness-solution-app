/**
 * V3.2 Semantic Runtime Reasoning 冒烟验证
 */
import { analyzeTender } from "../lib/tender/analyzeTender";
import { buildSemanticGraph } from "../lib/tender/semantic";
import { buildEvidenceFromPipeline } from "../lib/tender/evidence/bridge";
import { buildSkuMappings } from "../lib/tender/sku";
import { buildTechnicalCompliancePackage } from "../lib/tender/compliance";
import { runSemanticRuntimeReasoning } from "../lib/tender/semantic-runtime";
import { buildSemanticRuntimeDecision } from "../lib/tender/semantic-runtime/decision/buildSemanticRuntimeDecision";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const SAMPLE = `
技术要求：跑步机最大速度 ≥ 20km/h
资质：ISO9001 认证
评分：技术参数完整性 30 分，须附检测报告
`;

async function testRuntimeReasoning() {
  const parsed = await analyzeTender({ rawText: SAMPLE, fileName: "t.txt" });
  const { graph } = buildSemanticGraph(parsed);
  const sku = buildSkuMappings(graph);
  const compliance = buildTechnicalCompliancePackage({ graph, skuResult: sku });
  const evidence = buildEvidenceFromPipeline({ graph, compliance, skuResult: sku });

  const result = runSemanticRuntimeReasoning({ graph, registry: evidence.registry });

  assert(result.version === "3.2", "version");
  assert(result.phases.length === 6, "6 phases");
  assert(result.vocabulary.termCount > 0, "vocabulary");
  assert(result.intents.length > 0, "intents");
  assert(result.decision.action != null, "decision");
  assert(
    ["allow", "warn", "block"].includes(result.decision.action),
    "valid action",
  );

  console.log("✓ runSemanticRuntimeReasoning");
  console.log("  decision:", result.decision.action, result.decision.title);
  console.log("  intents:", result.intents.length);
  console.log("  matches:", result.matches.length);
  console.log("  profiles:", result.profiles.length);
  console.log(
    "  phases:",
    result.phases.map((p) => p.phaseId).join(" → "),
  );
}

function testDecisionBlock() {
  const decision = buildSemanticRuntimeDecision({
    intents: [
      {
        requirementId: "R1",
        intentType: "demonstrate_compliance",
        priority: "mandatory",
        keywords: ["ISO9001"],
        expectedEvidenceTypes: ["certification"],
        measurable: false,
        evidenceRequired: true,
      },
    ],
    matches: [],
    coverage: {
      rows: [
        {
          requirementId: "R1",
          requirementText: "ISO",
          semanticStatus: "unsupported",
          aligned: false,
          satisfiedNeeds: 0,
          totalNeeds: 1,
          missingTypes: ["certification"],
          notes: [],
        },
      ],
      fullyEvidenced: 0,
      partiallyEvidenced: 0,
      unsupported: 1,
      risky: 0,
      alignmentRatio: 0,
    },
  });
  assert(decision.action === "block", "mandatory gap blocks");
  console.log("✓ semantic runtime decision block on mandatory gap");
}

async function main() {
  testDecisionBlock();
  await testRuntimeReasoning();
  console.log("\nAll semantic runtime reasoning checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
