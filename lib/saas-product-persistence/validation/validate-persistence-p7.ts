import { SAAS_PRODUCT_PERSISTENCE_P7_TAG } from "../shared/persistence-constants";
import type { PersistenceP7Validation } from "../shared/persistence-types";
import { runPersistenceAuditSweep } from "../audit/audit-sweep";

export async function validatePersistenceP7(): Promise<PersistenceP7Validation> {
  const audit = await runPersistenceAuditSweep();

  return {
    valid: audit.passed,
    summary: `p7Tag=${SAAS_PRODUCT_PERSISTENCE_P7_TAG} ${audit.summary}`,
    audit,
  };
}
