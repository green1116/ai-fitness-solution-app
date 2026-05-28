import type {
  GovernanceIncidentRecoveryProfileRenderingPolicyMode,
  GovernanceIncidentRecoveryProfileRenderingPolicyRule,
} from "./incident-recovery-profile-rendering-policy.types";

export function loadIncidentRecoveryProfileRenderingPolicyRules(): GovernanceIncidentRecoveryProfileRenderingPolicyRule[] {
  const base = (mode: GovernanceIncidentRecoveryProfileRenderingPolicyMode): GovernanceIncidentRecoveryProfileRenderingPolicyRule => ({
    ruleId: `render-${mode}`,
    mode,
    keepTrace: mode === "strict" || mode === "audit",
    compressSummary: mode === "lenient" || mode === "compat",
    expandMigrations: mode === "strict" || mode === "audit",
    keepFallbackReason: mode !== "lenient",
    showDeprecatedFields: mode === "audit" || mode === "compat",
  });
  return [base("strict"), base("lenient"), base("audit"), base("compat")];
}
