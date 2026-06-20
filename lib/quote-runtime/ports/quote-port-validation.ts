import type { WorkspaceQuoteRuntimeSnapshot } from "../assembly/quote-runtime-assembly-types";
import { validateQuotePorts } from "./quote-port-guards";
import type { QuotePortValidation } from "./quote-port-types";

export function validateQuotePortFoundation(
  snapshot: WorkspaceQuoteRuntimeSnapshot,
): QuotePortValidation {
  const guards = validateQuotePorts();
  const valid =
    guards.valid &&
    snapshot.workspaceId.trim().length > 0 &&
    snapshot.version.trim().length > 0 &&
    snapshot.runtimeState.trim().length > 0;

  return {
    valid,
    summary: [
      guards.summary,
      `workspaceId=${snapshot.workspaceId}`,
      `runtimeState=${snapshot.runtimeState}`,
      `valid=${valid}`,
    ].join(" "),
  };
}
