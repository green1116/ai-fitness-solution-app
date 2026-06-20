interface WorkspaceEmptyStateProps {
  onCreateClick?: () => void;
}

export function WorkspaceEmptyState({ onCreateClick }: WorkspaceEmptyStateProps) {
  return (
    <section className="rounded-xl border border-dashed border-zinc-700 bg-zinc-900/40 p-8 text-center">
      <h4 className="text-lg font-medium text-white">No workspaces yet</h4>
      <p className="mt-2 text-sm text-zinc-400">
        Create your first workspace to start organizing quotes and workflows for this tenant.
      </p>
      {onCreateClick ? (
        <button
          type="button"
          onClick={onCreateClick}
          className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-500"
        >
          Create workspace
        </button>
      ) : null}
    </section>
  );
}
