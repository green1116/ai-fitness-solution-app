export type UserTier = "free" | "pro" | "enterprise";

export function normalizeUserTier(value: unknown): UserTier {
  const v = String(value ?? "").trim().toLowerCase();
  if (v === "enterprise" || v === "pro" || v === "free") {
    return v;
  }
  if (v === "preview") return "free";
  return "free";
}

export function canDownloadBudget(tier: UserTier): boolean {
  return tier === "pro" || tier === "enterprise";
}

export function canDownloadZip(tier: UserTier): boolean {
  return tier === "enterprise";
}
