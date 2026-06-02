import { commercialTierAmountCents } from "./commercial/pricing";
import { issueUnlockToken } from "@/lib/unlock-token";

export type UpgradeTargetLevel = "pro" | "enterprise";

/** 与 UpgradeOrder.targetLevel、unlockToken.planLevel 对齐 */
export async function issueUnlockTokenForPaidUpgrade(input: {
  planId: string;
  targetLevel: UpgradeTargetLevel;
  email?: string;
}) {
  const safePlan = String(input.planId || "").trim();
  const email =
    String(input.email || "").trim().toLowerCase() ||
    `upgrade+${safePlan.replace(/[^a-zA-Z0-9]/g, "") || "plan"}@local.invalid`;

  return issueUnlockToken({
    planId: safePlan,
    intent: "unlock_enterprise",
    email,
    mode: "pack",
    planLevel: input.targetLevel,
  });
}

/** 与 UpgradeOrder.amount 一致（分）；默认来自 pricing.ts，可用环境变量覆盖（分） */
export function upgradeAmountForLevel(level: UpgradeTargetLevel): number {
  const envRaw =
    level === "enterprise"
      ? process.env.UPGRADE_ENTERPRISE_AMOUNT_CENTS
      : process.env.UPGRADE_PRO_AMOUNT_CENTS;
  const envParsed = Number(String(envRaw || "").trim());
  if (Number.isFinite(envParsed) && envParsed > 0) {
    return Math.floor(envParsed);
  }
  return commercialTierAmountCents(level);
}
