import { SAAS_PRODUCT_PERSISTENCE_P7_TAG } from "../shared/persistence-constants";
import type { PersistenceAuditResult } from "./audit-types";

function formatCheckRows(checks: PersistenceAuditResult["checks"]): string {
  return checks
    .map(
      (check) =>
        `| ${check.id} | ${check.title} | \`${check.status.toUpperCase()}\` | ${check.detail.replace(/\|/g, "\\|")} |`,
    )
    .join("\n");
}

export function buildPersistenceAuditReport(audit: PersistenceAuditResult): string {
  const status = audit.passed ? "PASS" : "FAIL";

  return `# V50 Audit Report

**Tag:** \`${SAAS_PRODUCT_PERSISTENCE_P7_TAG}\`  
**Status:** \`${status}\`  
**Generated:** \`${new Date().toISOString()}\`

## Goal

Freeze-pre audit for V50 Production Persistence:

1. tenant isolation
2. repository boundary
3. runtime boundary
4. V49 frozen boundary
5. V48 frozen boundary
6. commercial readiness

## Checks

| ID | Check | Status | Detail |
|----|-------|--------|--------|
${formatCheckRows(audit.checks)}

## Summary

\`\`\`txt
${audit.summary}
readyToFreeze=${audit.passed}
\`\`\`
`;
}

export const DEFAULT_AUDIT_REPORT_PATH = "docs/commercialization/V50-AUDIT-REPORT.md";
