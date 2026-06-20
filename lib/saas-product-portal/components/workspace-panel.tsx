import type { ReactNode } from "react";

interface WorkspacePanelProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function WorkspacePanel({ title, description, children }: WorkspacePanelProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <div className="mb-4 space-y-1">
        <h4 className="text-sm font-medium text-white">{title}</h4>
        {description ? <p className="text-xs text-zinc-400">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}
