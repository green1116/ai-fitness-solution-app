import { SAAS_PRODUCT_API_P7_TAG } from "../shared/api-constants";
import { runSaasProductApiAuditSweep } from "../audit/api-audit-sweep";
import type { ApiP7Validation } from "../shared/api-types";

export async function validateApiP7(options?: { includeRegression?: boolean }): Promise<ApiP7Validation> {
  const sweep = await runSaasProductApiAuditSweep(options);

  return {
    valid: sweep.passed,
    summary: `p7Tag=${SAAS_PRODUCT_API_P7_TAG} ${sweep.report.summary}`,
    report: sweep.report,
  };
}
