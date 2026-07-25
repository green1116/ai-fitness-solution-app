/**
 * Product MFA — Recovery types
 */

export type RecoveryMetadata = Record<string, unknown>;

export type MfaRecoveryCode = {
  id: string;
  principalId: string;
  code: string;
  consumed: boolean;
  detail: string;
  metadata: RecoveryMetadata;
  issuedAt: string;
  consumedAt?: string;
};

export type IssueRecoveryCodesInput = {
  principalId: string;
  count?: number;
  metadata?: RecoveryMetadata;
};

export type ConsumeRecoveryCodeInput = {
  principalId: string;
  code: string;
};
