import type { WorkspaceQuoteRegistry, WorkspaceQuoteRegistryEntry, WorkspaceQuoteSurface } from "./quote-workspace-surface";

const workspaceQuoteRegistryStore = new Map<string, WorkspaceQuoteSurface>();

export function createWorkspaceQuoteRegistry(): WorkspaceQuoteRegistry {
  return {
    register(surface: WorkspaceQuoteSurface): WorkspaceQuoteRegistryEntry {
      const registeredSurface: WorkspaceQuoteSurface = { ...surface };
      workspaceQuoteRegistryStore.set(surface.workspaceId.trim(), registeredSurface);
      return {
        workspaceId: surface.workspaceId.trim(),
        surface: registeredSurface,
      };
    },
    resolve(workspaceId: string): WorkspaceQuoteSurface | undefined {
      return workspaceQuoteRegistryStore.get(workspaceId.trim());
    },
    has(workspaceId: string): boolean {
      return workspaceQuoteRegistryStore.has(workspaceId.trim());
    },
    clear(): void {
      workspaceQuoteRegistryStore.clear();
    },
  };
}

export function registerWorkspaceQuoteSurface(
  registry: WorkspaceQuoteRegistry,
  surface: WorkspaceQuoteSurface,
): WorkspaceQuoteRegistryEntry {
  return registry.register(surface);
}

export function resolveWorkspaceQuoteSurface(
  registry: WorkspaceQuoteRegistry,
  workspaceId: string,
): WorkspaceQuoteSurface | undefined {
  return registry.resolve(workspaceId);
}
