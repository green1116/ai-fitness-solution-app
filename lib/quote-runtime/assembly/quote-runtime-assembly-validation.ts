import type { QuoteLifecycleView } from "../lifecycle/quote-lifecycle-types";
import { validateWorkspaceQuoteRuntimeAssembly } from "./quote-runtime-assembly-guards";
import { createWorkspaceQuoteRuntimeAssemblyFactory } from "./quote-runtime-assembly-factory";
import type { WorkspaceQuoteRuntimeValidation } from "./quote-runtime-assembly-types";
import {
  assertWorkspaceQuoteRuntimeAssemblyShape,
  describeWorkspaceQuoteRuntimeAssembly,
} from "./quote-runtime-assembly-view";
import {
  createWorkspaceQuoteRuntimeSnapshot,
  describeWorkspaceQuoteRuntimeSnapshot,
} from "./quote-runtime-snapshot";

export function validateWorkspaceQuoteRuntime(
  lifecycleView: QuoteLifecycleView,
): WorkspaceQuoteRuntimeValidation {
  const factory = createWorkspaceQuoteRuntimeAssemblyFactory();
  const assembly = factory.createAssembly(lifecycleView);
  const guard = validateWorkspaceQuoteRuntimeAssembly(assembly);
  const snapshot = createWorkspaceQuoteRuntimeSnapshot(assembly);

  const valid =
    assertWorkspaceQuoteRuntimeAssemblyShape(assembly) &&
    guard.valid &&
    snapshot.runtimeState === assembly.runtimeState &&
    snapshot.lifecycleStatus === assembly.lifecycleStatus;

  return {
    valid,
    summary: [
      describeWorkspaceQuoteRuntimeAssembly(assembly),
      guard.summary,
      describeWorkspaceQuoteRuntimeSnapshot(snapshot),
      `valid=${valid}`,
    ].join(" "),
  };
}
