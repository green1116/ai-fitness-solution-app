import type { SuccessAuditRecord } from "./types";

export function buildSuccessAuditTrail(input?: { deploymentId?: string }): SuccessAuditRecord[] {
  const deploymentId = input?.deploymentId ?? "audit-default";
  const now = new Date().toISOString();

  return [
    { recordId: `audit-${deploymentId}-1`, actor: "customer", action: "下载投标方案 PDF", outcome: "success", customerId: `customer-${deploymentId}-1`, tracedAt: now },
    { recordId: `audit-${deploymentId}-2`, actor: "customer", action: "创建新项目", outcome: "success", customerId: `customer-${deploymentId}-2`, tracedAt: now },
    { recordId: `audit-${deploymentId}-3`, actor: "success-team", action: "发送 onboarding 引导", outcome: "success", customerId: `customer-${deploymentId}-3`, tracedAt: now },
    { recordId: `audit-${deploymentId}-4`, actor: "success-team", action: "续费风险跟进", outcome: "pending", customerId: `customer-${deploymentId}-4`, tracedAt: now },
    { recordId: `audit-${deploymentId}-5`, actor: "success-team", action: "扩展机会方案演示", outcome: "success", customerId: `customer-${deploymentId}-2`, tracedAt: now },
  ];
}
