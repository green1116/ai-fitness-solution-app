/**
 * V64 P1 — V58 runtime stub reference (read-only, no V58 modification)
 */

import { V58_P8_NAME, V58_FINAL_STATE } from "@/lib/quote-lifecycle";

export function getDemoRuntimeStubLabel(): string {
  return `${V58_P8_NAME} · ${V58_FINAL_STATE} · demo-stub`;
}

export function assertDemoUsesStubOnly(): true {
  return true;
}
