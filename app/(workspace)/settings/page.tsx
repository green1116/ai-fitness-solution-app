"use client";

import { WorkspaceLoading } from "@/components/workspace/WorkspaceLoading";
import { useWorkspace } from "@/components/workspace/WorkspaceProvider";

export default function SettingsPage() {
  const { loading, user, organization, membership, refresh } = useWorkspace();

  if (loading) return <WorkspaceLoading message="加载设置…" />;

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      <section className="rounded-2xl border border-zinc-800 bg-black/40 p-6 space-y-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Account</p>
          <p className="mt-1 text-white">{user?.email}</p>
          {user?.name ? <p className="text-sm text-zinc-400">{user.name}</p> : null}
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Organization</p>
          <p className="mt-1 text-white">{organization?.name ?? "—"}</p>
          <p className="font-mono text-xs text-zinc-500">{organization?.id}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-widest text-zinc-500">Membership</p>
          <p className="mt-1 text-white">{membership?.role ?? "—"}</p>
        </div>
        <button
          type="button"
          onClick={() => void refresh()}
          className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500"
        >
          刷新 Workspace 数据
        </button>
      </section>
    </div>
  );
}
