import type { GovernanceIncidentRecoveryProfileRenderingPolicyRule } from "./incident-recovery-profile-rendering-policy.types";

export function renderIncidentRecoveryProfilePolicyActions(
  policy: GovernanceIncidentRecoveryProfileRenderingPolicyRule,
): string[] {
  return [
    `keepTrace=${policy.keepTrace}`,
    `compressSummary=${policy.compressSummary}`,
    `expandMigrations=${policy.expandMigrations}`,
    `keepFallbackReason=${policy.keepFallbackReason}`,
    `showDeprecatedFields=${policy.showDeprecatedFields}`,
  ];
}
