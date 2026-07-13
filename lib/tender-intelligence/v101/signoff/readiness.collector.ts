/**
 * E01-P8 — Collect per-phase readiness via P1–P7 chain (read-only)
 */

import { runAgentKernelOrThrow } from "../agent";
import { runDeliveryKernelOrThrow } from "../delivery";

import type { DeliveryBaselineSnapshot, ReadinessReport } from "./signoff.types";

const SIGNOFF_SAMPLE_TENDER = `
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

export function collectDeliveryBaseline(deploymentId: string): DeliveryBaselineSnapshot {
  const orchestration = runAgentKernelOrThrow({
    deploymentId: `${deploymentId}-baseline-orch`,
    projectHint: "星河科技园企业健身中心",
    organizationHint: "星河科技园管理有限公司",
    rawText: SIGNOFF_SAMPLE_TENDER,
    estimatedValueHint: 2_800_000,
    preferredEmphasis: ["compliance", "commercial"],
    titleHint: "星河科技园投标方案蓝图",
  });

  const delivery = runDeliveryKernelOrThrow({
    deploymentId: `${deploymentId}-baseline-delivery`,
    orchestration,
    titleHint: "星河科技园企业交付包",
    ownerHint: "enterprise-delivery",
  });

  return {
    ready: delivery.ready,
    reportId: delivery.reportId,
    packageId: delivery.package.id,
    packageStatus: delivery.package.status,
    sealHash: delivery.package.seal?.packageHash ?? null,
    completenessRatio: delivery.package.completenessRatio,
    readinessScore: delivery.readinessScore,
  };
}

export function collectTenderPhaseReadiness(deploymentId: string): ReadinessReport {
  try {
    const orchestration = runAgentKernelOrThrow({
      deploymentId: `${deploymentId}-readiness-orch`,
      projectHint: "星河科技园企业健身中心",
      organizationHint: "星河科技园管理有限公司",
      rawText: SIGNOFF_SAMPLE_TENDER,
      estimatedValueHint: 2_800_000,
      preferredEmphasis: ["compliance", "commercial"],
      titleHint: "星河科技园投标方案蓝图",
    });

    const delivery = runDeliveryKernelOrThrow({
      deploymentId: `${deploymentId}-readiness-delivery`,
      orchestration,
    });

    const p1 = Boolean(orchestration.artifacts.workspaceId);
    const p2 = Boolean(orchestration.artifacts.requirementIndexId);
    const p3 = Boolean(orchestration.artifacts.opportunityId);
    const p4 = Boolean(orchestration.artifacts.strategyId);
    const p5 = Boolean(orchestration.artifacts.blueprintId);
    const p6 = orchestration.ready;
    const p7 = delivery.ready && delivery.package.status === "sealed";

    const ready = p1 && p2 && p3 && p4 && p5 && p6 && p7;
    const blocked = !ready;

    return {
      p1,
      p2,
      p3,
      p4,
      p5,
      p6,
      p7,
      ready,
      blocked,
      summary: [
        `readiness ready=${ready}`,
        `phases=${[p1, p2, p3, p4, p5, p6, p7].filter(Boolean).length}/7`,
        `blocked=${blocked}`,
      ].join(" "),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "readiness failed";
    return {
      p1: false,
      p2: false,
      p3: false,
      p4: false,
      p5: false,
      p6: false,
      p7: false,
      ready: false,
      blocked: true,
      summary: `readiness ready=false blocked=true error=${message}`,
    };
  }
}
