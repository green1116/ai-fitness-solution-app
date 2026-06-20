import type { PortalWorkspace } from "../shared/portal-types";

interface WorkspaceDetailCardProps {
  workspace: PortalWorkspace;
}

export function WorkspaceDetailCard({ workspace }: WorkspaceDetailCardProps) {
  return (
    <section className="rounded-xl border border-zinc-800 bg-zinc-900/60 p-5">
      <dl className="grid gap-4 text-sm md:grid-cols-2">
        <div>
          <dt className="text-zinc-500">Name</dt>
          <dd className="mt-1 font-medium text-white">{workspace.name}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Status</dt>
          <dd className="mt-1 font-medium text-white">{workspace.status}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Workspace ID</dt>
          <dd className="mt-1 font-medium text-white">{workspace.id}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Tenant</dt>
          <dd className="mt-1 font-medium text-white">{workspace.tenantId}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Created</dt>
          <dd className="mt-1 text-zinc-300">{workspace.createdAt}</dd>
        </div>
        <div>
          <dt className="text-zinc-500">Updated</dt>
          <dd className="mt-1 text-zinc-300">{workspace.updatedAt}</dd>
        </div>
      </dl>
    </section>
  );
}
