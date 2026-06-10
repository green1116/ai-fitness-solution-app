import type {
  TrialConversion,
  TrialExpiration,
  TrialLimits,
  TrialPlan,
} from "./types";

const TRIAL_DURATION_DAYS = 14;

function addDays(isoDate: string, days: number): string {
  const date = new Date(isoDate);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString();
}

function daysBetween(from: string, to: string): number {
  const start = new Date(from).getTime();
  const end = new Date(to).getTime();
  return Math.max(0, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));
}

export function buildTrialPlan(input?: { deploymentId?: string }): TrialPlan {
  const deploymentId = input?.deploymentId ?? "trial-default";
  return {
    planId: `trial-plan-${deploymentId}`,
    tier: "pro-preview",
    name: "Pro 试用版",
    durationDays: TRIAL_DURATION_DAYS,
    description: "14 天 Pro 功能试用，含 Plan/Budget 生成与 PDF 导出预览",
  };
}

export function buildTrialLimits(input?: { deploymentId?: string }): TrialLimits {
  const deploymentId = input?.deploymentId ?? "trial-default";
  return {
    limitsId: `trial-limits-${deploymentId}`,
    planGeneration: 5,
    budgetGeneration: 3,
    proposalPdf: 5,
    enterpriseZip: 0,
    workspaceLimit: 1,
    userLimit: 3,
  };
}

export function buildTrialExpiration(input?: {
  deploymentId?: string;
  referenceDate?: string;
  daysUsed?: number;
}): TrialExpiration {
  const deploymentId = input?.deploymentId ?? "trial-default";
  const referenceDate = input?.referenceDate ?? new Date().toISOString();
  const daysUsed = input?.daysUsed ?? 5;
  const startedAt = addDays(referenceDate, -daysUsed);
  const expiresAt = addDays(startedAt, TRIAL_DURATION_DAYS);
  const daysRemaining = daysBetween(referenceDate, expiresAt);
  const isExpired = daysRemaining <= 0;

  let status: TrialExpiration["status"] = "active";
  if (isExpired) {
    status = "expired";
  } else if (daysRemaining <= 3) {
    status = "expiring";
  }

  return {
    expirationId: `trial-expiration-${deploymentId}`,
    startedAt,
    expiresAt,
    daysRemaining,
    isExpired,
    status,
  };
}

export function buildTrialConversion(input?: {
  deploymentId?: string;
  expiration?: TrialExpiration;
}): TrialConversion {
  const deploymentId = input?.deploymentId ?? "trial-default";
  const expiration =
    input?.expiration ?? buildTrialExpiration({ deploymentId });
  const eligible = !expiration.isExpired;

  return {
    conversionId: `trial-conversion-${deploymentId}`,
    eligible,
    target: eligible ? "pro-annual" : "pro-monthly",
    incentive: eligible ? "试用期内升级享首年 9 折" : "试用已结束，可订阅 Pro 恢复访问",
    nextStep: eligible
      ? "创建订单并选择 Pro 年付订阅"
      : "创建新订单重新开通 Pro",
  };
}
