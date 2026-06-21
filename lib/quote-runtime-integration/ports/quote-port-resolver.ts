import type { WorkspaceQuoteRuntimeSnapshot } from "@/lib/quote-runtime/assembly/quote-runtime-assembly-types";
import { createQuotePortRegistry } from "@/lib/quote-runtime/ports";
import type { QuotePortRegistry, QuotePortRegistryStub } from "@/lib/quote-runtime/ports/quote-port-types";

export interface QuotePortResolver {
  resolvePersistence(workspaceId: string): QuotePortRegistry["persistence"];
  resolveApi(workspaceId: string): QuotePortRegistry["api"];
  resolveCommercial(workspaceId: string): QuotePortRegistry["commercial"];
  resolve(workspaceId: string): QuotePortRegistry;
}

export function createQuotePortStubBundle(snapshot: WorkspaceQuoteRuntimeSnapshot): QuotePortRegistry {
  return {
    persistence: {
      loadQuoteSnapshot: () => snapshot,
      exists: () => snapshot.workspaceId.trim().length > 0,
    },
    api: {
      getQuoteSurface: () => ({ key: "quote", workspaceId: snapshot.workspaceId }),
      getQuoteReadiness: () => snapshot.quoteReadiness,
    },
    commercial: {
      getQuoteEligibility: () => "ELIGIBLE" as const,
      getQuoteSurfaceFlags: () => ({
        eligible: true,
        visible: snapshot.runtimeState !== "SHELL",
        active: snapshot.runtimeState === "ACTIVE",
      }),
    },
  };
}

export function createQuotePortResolver(stubs: QuotePortRegistry): QuotePortResolver {
  const wired = createQuotePortRegistry(stubs);

  return {
    resolvePersistence(workspaceId: string) {
      void workspaceId;
      return wired.persistence;
    },
    resolveApi(workspaceId: string) {
      void workspaceId;
      return wired.api;
    },
    resolveCommercial(workspaceId: string) {
      void workspaceId;
      return wired.commercial;
    },
    resolve(workspaceId: string): QuotePortRegistry {
      void workspaceId;
      return wired;
    },
  };
}

export type { QuotePortRegistry, QuotePortRegistryStub };
