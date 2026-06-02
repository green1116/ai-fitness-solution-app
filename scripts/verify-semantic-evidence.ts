/**
 * V3.1 Semantic Evidence Intelligence 冒烟验证
 */
import { analyzeTender } from "../lib/tender/analyzeTender";
import { buildSemanticGraph } from "../lib/tender/semantic";
import { buildEvidenceFromPipeline } from "../lib/tender/evidence/bridge";
import { buildSkuMappings } from "../lib/tender/sku";
import { buildTechnicalCompliancePackage } from "../lib/tender/compliance";
import {
  inferSemanticEvidenceNeeds,
  runSemanticEvidenceReasoning,
} from "../lib/tender/semantic-evidence";

function assert(cond: boolean, msg: string) {
  if (!cond) throw new Error(`ASSERT: ${msg}`);
}

const SAMPLE = `
技术要求：跑步机最大速度 ≥ 20km/h，功率 ≥ 3HP
资质要求：投标人须具备 ISO9001 质量管理体系认证
评分标准：技术参数响应完整性占 30 分，须提供检测报告
`;

async function testInferNeeds() {
  const parsed = await analyzeTender({
    rawText: SAMPLE,
    fileName: "test.txt",
  });
  const { graph } = buildSemanticGraph(parsed);
  const needs = inferSemanticEvidenceNeeds(graph);
  assert(needs.length > 0, "needs inferred");
  assert(
    needs.some((n) => n.expectedTypes.includes("certification")),
    "qualification needs certification",
  );
  console.log("✓ inferSemanticEvidenceNeeds", needs.length);
}

async function testFullReasoning() {
  const parsed = await analyzeTender({
    rawText: SAMPLE,
    fileName: "test.txt",
  });
  const { graph } = buildSemanticGraph(parsed);
  const sku = buildSkuMappings(graph);
  const compliance = buildTechnicalCompliancePackage({ graph, skuResult: sku });
  const evidence = buildEvidenceFromPipeline({ graph, compliance, skuResult: sku });

  const result = runSemanticEvidenceReasoning(
    { graph, registry: evidence.registry },
    { registryCoverage: evidence.coverage },
  );

  assert(result.version === "3.1", "version");
  assert(result.executionGraph.nodes.length > 0, "graph nodes");
  assert(result.executionGraph.edges.length > 0, "graph edges");
  assert(result.evidenceNeeds.length > 0, "needs");
  assert(result.inferences.length > 0, "inferences");
  assert(result.reasoningTrace.length === 5, "5 reasoning steps");
  assert(result.coverage.rows.length > 0, "coverage rows");

  console.log("✓ runSemanticEvidenceReasoning");
  console.log("  nodes:", result.executionGraph.summary.nodeCount);
  console.log("  needs:", result.evidenceNeeds.length);
  console.log(
    "  alignment:",
    Math.round(result.coverage.alignmentRatio * 100) + "%",
  );
  console.log(
    "  trace:",
    result.reasoningTrace.map((s) => s.stepId).join(" → "),
  );
}

async function main() {
  await testInferNeeds();
  await testFullReasoning();
  console.log("\nAll semantic evidence intelligence checks passed.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
