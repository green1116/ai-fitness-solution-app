/**
 * SHELL-CONTEXT presentation host.
 * Structural project cue slot only — no Domain project resolution.
 */
export function ShellContextHost() {
  return (
    <div
      data-shell-region="context"
      className="border-b border-slate-200 bg-slate-50"
    >
      <div className="mx-auto flex w-full max-w-7xl items-center px-6 py-2 text-xs text-slate-500">
        Project context
      </div>
    </div>
  );
}
