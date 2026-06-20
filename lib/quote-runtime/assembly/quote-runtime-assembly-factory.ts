import type { QuoteLifecycleView } from "../lifecycle/quote-lifecycle-types";
import { createWorkspaceQuoteRuntimeAssembly } from "./quote-runtime-assembly-view";

export function createWorkspaceQuoteRuntimeAssemblyFactory() {
  return {
    createAssembly(lifecycleView: QuoteLifecycleView) {
      return createWorkspaceQuoteRuntimeAssembly(lifecycleView);
    },
  };
}
