export type UserTier = "free" | "pro" | "enterprise";

export function normalizeUserTier(value: unknown): UserTier {
  if (value === "enterprise" || value === "pro" || value === "free") {
    return value;
  }
  return "free";
}

export function canDownloadBudget(tier: UserTier): boolean {
  return tier === "pro" || tier === "enterprise";
}

export function canDownloadZip(tier: UserTier): boolean {
  return tier === "enterprise";
}
