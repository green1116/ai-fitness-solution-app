import { UNLIMITED_QUOTA } from "./subscription-types";

export function isUnlimitedQuota(quota: number | undefined | null): boolean {
  return quota === UNLIMITED_QUOTA;
}
