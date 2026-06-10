import type { ReadinessDimension, ReadinessLevel } from "./types";

function scoreToLevel(score: number): ReadinessLevel {
  if (score >= 90) return "integration-ready";
  if (score >= 70) return "contract-ready";
  if (score >= 40) return "in-progress";
  return "not-started";
}

export function buildPaymentReadinessDimensions(input?: {
  deploymentId?: string;
}): ReadinessDimension[] {
  const deploymentId = input?.deploymentId ?? "dashboard-default";

  return [
    {
      dimensionId: `gateway-readiness-${deploymentId}`,
      label: "Gateway Readiness",
      level: "contract-ready",
      score: 85,
      blockers: ["未接入真实 Stripe/PayPal API"],
      nextSteps: ["配置生产环境 API Key", "启用沙箱端到端测试"],
    },
    {
      dimensionId: `webhook-readiness-${deploymentId}`,
      label: "Webhook Readiness",
      level: "contract-ready",
      score: 80,
      blockers: ["Webhook 端点未部署到公网"],
      nextSteps: ["部署 /api/pay/webhook 接收器", "配置签名验证中间件"],
    },
    {
      dimensionId: `subscription-readiness-${deploymentId}`,
      label: "Subscription Readiness",
      level: "contract-ready",
      score: 82,
      blockers: ["订阅状态未与 Revenue Foundation 桥接"],
      nextSteps: ["实现 activate/renew 事件处理器", "同步 entitlement 快照"],
    },
    {
      dimensionId: `settlement-readiness-${deploymentId}`,
      label: "Settlement Readiness",
      level: "contract-ready",
      score: 78,
      blockers: ["发票结算未对接账务系统"],
      nextSteps: ["实现 pending→paid 状态机", "配置逾期提醒"],
    },
  ];
}

export function computeOverallReadiness(dimensions: ReadinessDimension[]): {
  overallScore: number;
  overallLevel: ReadinessLevel;
} {
  const overallScore = Math.round(
    dimensions.reduce((sum, dim) => sum + dim.score, 0) / dimensions.length,
  );
  return {
    overallScore,
    overallLevel: scoreToLevel(overallScore),
  };
}
