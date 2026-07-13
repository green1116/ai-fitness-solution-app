/**
 * E01-P7 — Enterprise Delivery Intelligence verification
 * Assemble P1–P6 outputs into Enterprise Delivery Package lifecycle
 */
import fs from "node:fs";
import path from "node:path";

import { runAgentKernelOrThrow } from "../lib/tender-intelligence/v101/agent";
import {
  assertDeliveryKernelPass,
  buildEnterpriseDeliveryPackage,
  DELIVERY_ARTIFACT_KINDS,
  DELIVERY_LIFECYCLE_STAGES,
  formatDeliveryKernelSummary,
  runDeliveryKernel,
  runDeliveryKernelOrThrow,
  validateDeliveryKernelInput,
  validateDeliveryPackage,
  validateOrchestrationInput,
  V101_ENTERPRISE_DELIVERY_FREEZE_VERSION,
  V101_ENTERPRISE_DELIVERY_VERSION,
} from "../lib/tender-intelligence/v101/delivery";

const ROOT = path.resolve(__dirname, "..");
const DEPLOYMENT_ID = "v101-p7-delivery";

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
    "lib/tender-intelligence/v101/delivery/delivery.types.ts",
    "lib/tender-intelligence/v101/delivery/delivery.schema.ts",
    "lib/tender-intelligence/v101/delivery/delivery.builder.ts",
    "lib/tender-intelligence/v101/delivery/delivery.entry.ts",
    "lib/tender-intelligence/v101/delivery/index.ts",
  ];
  for (const rel of required) {
    check(fs.existsSync(path.join(ROOT, rel)), `missing module: ${rel}`);
  }
  console.log("✓ module structure");
}

function testSchemaGuards() {
  check(DELIVERY_LIFECYCLE_STAGES.length === 3, "lifecycle stages");
  check(DELIVERY_ARTIFACT_KINDS.length === 11, "artifact kinds");

  const badOrch = validateOrchestrationInput({ reportId: "x", ready: false });
  check(!badOrch.ok, "incomplete orchestration rejected");

  const badInput = validateDeliveryKernelInput({ orchestration: { ready: false } });
  check(!badInput.ok, "bad kernel input rejected");

  console.log("✓ schema guards");
}

function testDeliveryKernel() {
  const orchestration = runAgentKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-upstream`,
    projectHint: "星河科技园企业健身中心",
    organizationHint: "星河科技园管理有限公司",
    rawText: SAMPLE_TENDER,
    estimatedValueHint: 2_800_000,
    preferredEmphasis: ["compliance", "commercial"],
    titleHint: "星河科技园投标方案蓝图",
  });

  check(validateOrchestrationInput(orchestration).ok, "orchestration valid for delivery");

  const pkg = buildEnterpriseDeliveryPackage({
    orchestration,
    deploymentId: DEPLOYMENT_ID,
    titleHint: "星河科技园企业交付包",
    ownerHint: "delivery-ops",
  });
  check(validateDeliveryPackage(pkg).ok, "package schema");
  check(pkg.status === "sealed", "package sealed");
  check(pkg.itemCount === 11, "11 inventory items");
  check(pkg.presentCount === 11, "all items present");
  check(pkg.completenessRatio === 1, "completeness 1");
  check(pkg.seal !== null, "seal present");
  check(pkg.checklistPassCount === pkg.checklistCount, "all checklist pass");

  const result = runDeliveryKernel({
    deploymentId: DEPLOYMENT_ID,
    orchestration,
    titleHint: "星河科技园企业交付包",
    ownerHint: "delivery-ops",
  });

  check(result.version === V101_ENTERPRISE_DELIVERY_VERSION, "version");
  check(result.freezeVersion === V101_ENTERPRISE_DELIVERY_FREEZE_VERSION, "freeze");
  check(result.ready === true, "ready");
  check(result.readinessScore === 100, "score 100");
  check(result.lifecycle.complete === true, "lifecycle complete");
  check(result.lifecycle.current === "seal", "lifecycle at seal");
  check(result.lifecycle.transitions.length === 2, "2 transitions");
  check(result.package?.status === "sealed", "result package sealed");
  check(Boolean(result.package?.seal?.packageHash), "seal hash");

  assertDeliveryKernelPass(result);

  const forced = runDeliveryKernelOrThrow({
    deploymentId: `${DEPLOYMENT_ID}-throw`,
    orchestration,
  });
  check(forced.ready === true, "orThrow ready");
  check(forced.package.status === "sealed", "orThrow sealed");

  console.log("✓ delivery kernel");
  console.log(formatDeliveryKernelSummary(result));
}

function main() {
  console.log("E01-P7 — Enterprise Delivery Intelligence Verification\n");
  checkModuleStructure();
  testSchemaGuards();
  testDeliveryKernel();
  console.log("\nPASS — V101 P7 delivery (Orchestration → Package → Seal)");
}

main();
