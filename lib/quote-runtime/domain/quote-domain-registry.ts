import type {
  QuoteDomainRegistry,
  QuoteDomainRegistryEntry,
  QuoteDomainView,
} from "./quote-domain-types";

const quoteDomainRegistryStore = new Map<string, QuoteDomainView>();

export function createQuoteDomainRegistry(): QuoteDomainRegistry {
  return {
    register(view: QuoteDomainView): QuoteDomainRegistryEntry {
      const registeredView: QuoteDomainView = { ...view };
      quoteDomainRegistryStore.set(view.workspaceId.trim(), registeredView);
      return {
        workspaceId: view.workspaceId.trim(),
        view: registeredView,
      };
    },
    resolve(workspaceId: string): QuoteDomainView | undefined {
      return quoteDomainRegistryStore.get(workspaceId.trim());
    },
    has(workspaceId: string): boolean {
      return quoteDomainRegistryStore.has(workspaceId.trim());
    },
    clear(): void {
      quoteDomainRegistryStore.clear();
    },
  };
}

export function registerQuoteDomainView(
  registry: QuoteDomainRegistry,
  view: QuoteDomainView,
): QuoteDomainRegistryEntry {
  return registry.register(view);
}

export function resolveQuoteDomainView(
  registry: QuoteDomainRegistry,
  workspaceId: string,
): QuoteDomainView | undefined {
  return registry.resolve(workspaceId);
}
