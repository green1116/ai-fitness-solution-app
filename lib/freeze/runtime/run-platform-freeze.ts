import { buildPlatformFreezeReport } from "../reports";
import type { PlatformFreezeReport } from "../reports";

export function runPlatformFreeze(input?: {
  deploymentId?: string;
}): PlatformFreezeReport {
  return buildPlatformFreezeReport(input);
}
