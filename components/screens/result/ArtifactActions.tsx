type ArtifactAction = Readonly<{
  id: string;
  label: string;
  actionId: string;
  intId:
    | "INT-ARTIFACT-PREVIEW"
    | "INT-ARTIFACT-DOWNLOAD"
    | "INT-ARTIFACT-SHARE";
}>;

type ArtifactActionsProps = Readonly<{
  actions: readonly ArtifactAction[];
}>;

/**
 * CMP-ARTIFACT-ACTIONS — download / share / preview affordances.
 * Commands only; does not define file formats or share channels.
 */
export function ArtifactActions({ actions }: ArtifactActionsProps) {
  return (
    <div data-cmp="CMP-ARTIFACT-ACTIONS">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
        Artifact actions
      </p>
      <ul className="mt-4 flex flex-wrap gap-4">
        {actions.map((action) => (
          <li key={action.id}>
            <button
              type="button"
              data-int-id={action.intId}
              data-action-id={action.actionId}
              className="text-sm font-semibold text-slate-950 underline underline-offset-4"
            >
              {action.label}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
