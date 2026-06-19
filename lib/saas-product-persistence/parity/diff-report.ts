import type { ParityComparisonResult, ParityMismatch, ParityRunResult } from "./parity-types";

function formatValue(value: unknown): string {
  if (value === undefined) return "undefined";
  if (value === null) return "null";
  return String(value);
}

function formatMismatchTable(mismatches: ParityMismatch[]): string {
  if (mismatches.length === 0) {
    return "_No mismatches detected._\n";
  }

  const lines = [
    "| Field | Memory | Prisma |",
    "|-------|--------|--------|",
    ...mismatches.map(
      (item) => `| \`${item.field}\` | \`${formatValue(item.memoryValue)}\` | \`${formatValue(item.prismaValue)}\` |`,
    ),
  ];
  return `${lines.join("\n")}\n`;
}

export function buildParityDiffReport(result: ParityComparisonResult | ParityRunResult): string {
  const status = result.passed ? "PASS" : "FAIL";
  const prismaStatus = result.prismaAvailable ? "available" : "unavailable";

  return `# V50 Parity Report

**Tag:** \`v50-production-persistence-p6\`  
**Status:** \`${status}\`  
**Generated:** \`${new Date().toISOString()}\`

## Scope

Compare \`memory\` backend vs \`prisma\` backend for semantic parity:

- workspace create
- workspace archive
- workflow create
- workflow approve
- history count
- event count

## Backend Status

| Backend | Status |
|---------|--------|
| memory | \`ok\` |
| prisma | \`${prismaStatus}\` |

${result.prismaError ? `**Prisma error:** \`${result.prismaError}\`\n` : ""}
## Memory Snapshot

\`\`\`json
${JSON.stringify(result.memory, null, 2)}
\`\`\`

## Prisma Snapshot

\`\`\`json
${JSON.stringify(result.prisma, null, 2)}
\`\`\`

## Mismatches

${formatMismatchTable(result.mismatches)}

## Result

\`\`\`txt
parity=${status}
mismatchCount=${result.mismatches.length}
\`\`\`
`;
}

export const DEFAULT_PARITY_REPORT_PATH = "docs/commercialization/V50-PARITY-REPORT.md";
