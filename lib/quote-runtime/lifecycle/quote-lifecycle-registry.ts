import type {
  QuoteLifecycleRegistry,
  QuoteLifecycleRegistryEntry,
  QuoteLifecycleView,
} from "./quote-lifecycle-types";

const quoteLifecycleRegistryStore = new Map<string, QuoteLifecycleView>();

export function createQuoteLifecycleRegistry(): QuoteLifecycleRegistry {
  return {
    register(view: QuoteLifecycleView): QuoteLifecycleRegistryEntry {
      const registeredView: QuoteLifecycleView = { ...view };
      quoteLifecycleRegistryStore.set(view.workspaceId.trim(), registeredView);
      return {
        workspaceId: view.workspaceId.trim(),
        view: registeredView,
      };
    },
    resolve(workspaceId: string): QuoteLifecycleView | undefined {
      return quoteLifecycleRegistryStore.get(workspaceId.trim());
    },
    has(workspaceId: string): boolean {
      return quoteLifecycleRegistryStore.has(workspaceId.trim());
    },
    clear(): void {
      quoteLifecycleRegistryStore.clear();
    },
  };
}

export function registerQuoteLifecycleView(
  registry: QuoteLifecycleRegistry,
  view: QuoteLifecycleView,
): QuoteLifecycleRegistryEntry {
  return registry.register(view);
}

export function resolveQuoteLifecycleView(
  registry: QuoteLifecycleRegistry,
  workspaceId: string,
): QuoteLifecycleView | undefined {
  return registry.resolve(workspaceId);
}
