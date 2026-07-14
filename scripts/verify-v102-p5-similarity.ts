/**
 * E02-P5 — Similar Tender Intelligence Engine verification
 * Tender context → Similar Tender Profile lifecycle
 */
import fs from "node:fs";
import path from "node:path";

import { runExtractionKernelOrThrow } from "../lib/tender-intelligence/v102/extraction";
import { runKnowledgeKernelOrThrow } from "../lib/tender-intelligence/v102/knowledge";
import { runRelationshipKernelOrThrow } from "../lib/tender-intelligence/v102/relationship";
import { runRetrievalKernelOrThrow } from "../lib/tender-intelligence/v102/retrieval";
import {
  assertSimilarityKernelPass,
  buildTenderFeatureFingerprint,
  formatSimilarityKernelSummary,
  matchSimilarTenders,
  SIMILARITY_DIMENSIONS,
  SIMILARITY_LIFECYCLE_STAGES,
  runSimilarityKernel,
  runSimilarityKernelOrThrow,
  validateSimilarTenderProfile,
  validateSimilarityKernelInput,
  validateTenderFeatureFingerprint,
  V102_SIMILAR_TENDER_FREEZE_VERSION,
  V102_SIMILAR_TENDER_VERSION,
} from "../lib/tender-intelligence/v102/similarity";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v102-p5-similarity";

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
    "lib/tender-intelligence/v102/similarity/similarity.types.ts",
    "lib/tender-intelligence/v102/similarity/similarity.schema.ts",
    "lib/tender-intelligence/v102/similarity/similarity.builder.ts",
    "lib/tender-intelligence/v102/similarity/similarity.entry.ts",
    "lib/tender-intelligence/v102/similarity/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testSchemaGuards() {
  check(SIMILARITY_LIFECYCLE_STAGES.length === 3, "lifecycle stages");
  check(SIMILARITY_DIMENSIONS.length === 8, "dimensions");

  const badInput = validateSimilarityKernelInput({ context: { id: "x" } });
  check(!badInput.ok, "invalid input rejected");

  const badFp = validateTenderFeatureFingerprint({ id: "fp" });
  check(!badFp.ok, "incomplete fingerprint rejected");

  console.log("✓ schema guards");
}

function testSimilarityKernel() {
  const extraction = runExtractionKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-extract`,
    rawText: SAMPLE_TENDER,
    projectHint: "星河科技园企业健身中心建设项目",
    organizationHint: "星河科技园管理有限公司",
  });

  const relationships = runRelationshipKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-rel`,
    candidates: extraction.candidates,
  });

  const knowledge = runKnowledgeKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-graph`,
    rawText: SAMPLE_TENDER,
    seedNodes: extraction.candidates.nodeSeeds,
    seedEdges: relationships.network.edgeSeeds,
    titleHint: "星河科技园知识图谱",
  });

  const retrieval = runRetrievalKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-retrieval`,
    graph: knowledge.graph,
    queryText: "健身器械 GB/T 22517 预算限价 园区",
    titleHint: "星河科技园检索上下文",
  });

  const fingerprint = buildTenderFeatureFingerprint(retrieval.context);
  check(fingerprint.readOnly === true, "fingerprint readOnly");
  check(validateTenderFeatureFingerprint(fingerprint).ok, "fingerprint schema");
  check(fingerprint.dimensions.length >= 2, "fingerprint dimensions");

  const matches = matchSimilarTenders({ fingerprint, limit: 5 });
  check(matches.length >= 2, "enough matches");
  check(matches[0]!.rank === 1, "top rank");

  const result = runSimilarityKernel({
    deploymentId: DEPLOYMENT_ID,
    context: retrieval.context,
    titleHint: "星河科技园相似招标画像",
    limit: 5,
  });

  check(result.version === V102_SIMILAR_TENDER_VERSION, "version");
  check(result.freezeVersion === V102_SIMILAR_TENDER_FREEZE_VERSION, "freeze");
  check(result.ready === true, "ready");
  check(result.readinessScore === 100, "score 100");
  check(result.profile?.status === "ready", "profile ready");
  check((result.profile?.matchCount ?? 0) >= 2, "profile matches");
  check((result.profile?.topScore ?? 0) >= 0.35, "top score");
  check(result.lifecycle.complete === true, "lifecycle complete");
  check(result.lifecycle.current === "profile", "lifecycle at profile");
  check(result.lifecycle.transitions.length === 2, "2 transitions");
  check(validateSimilarTenderProfile(result.profile).ok, "profile schema");
  check(
    result.matches.some((m) => m.sharedSignals.some((s) => s.includes("健身") || s.includes("器械") || s.includes("标准"))),
    "fitness/standard signals",
  );

  assertSimilarityKernelPass(result);

  const forced = runSimilarityKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-throw`,
    context: retrieval.context,
  });
  check(forced.ready === true, "orThrow ready");
  check(forced.profile.status === "ready", "orThrow profile");

  console.log("✓ similarity kernel");
  console.log(formatSimilarityKernelSummary(result));
}

function main() {
  console.log("E02-P5 — Similar Tender Intelligence Engine Verification\n");
  checkModuleStructure();
  testSchemaGuards();
  testSimilarityKernel();
  console.log("\nPASS — V102 P5 similarity (Context → Matches → Profile)");
}

main();
