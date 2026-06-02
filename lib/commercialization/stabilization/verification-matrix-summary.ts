export const VERIFICATION_MATRIX_SUMMARY_VERSION = "3.7-verification-matrix-1" as const;

export type VerificationMatrixRow = {
  id: string;
  label: string;
  ok: boolean;
};

export type VerificationMatrixSummary = {
  version: typeof VERIFICATION_MATRIX_SUMMARY_VERSION;
  matrixId: string;
  rows: VerificationMatrixRow[];
  rowCount: number;
  passCount: number;
  allOk: boolean;
  summary: string;
};

export function buildVerificationMatrixSummary(input: {
  deploymentId: string;
  rows: VerificationMatrixRow[];
}): VerificationMatrixSummary {
  const matrixId = `VMATRIX-V37-${input.deploymentId.slice(0, 8)}`;
  const passCount = input.rows.filter((r) => r.ok).length;
  const allOk = passCount === input.rows.length && input.rows.length > 0;

  return {
    version: VERIFICATION_MATRIX_SUMMARY_VERSION,
    matrixId,
    rows: input.rows,
    rowCount: input.rows.length,
    passCount,
    allOk,
    summary: input.rows.map((r) => `${r.label}=${r.ok ? "OK" : "FAIL"}`).join(" "),
  };
}
