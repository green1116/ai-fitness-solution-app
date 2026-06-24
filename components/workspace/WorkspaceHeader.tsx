"use client";

import { useWorkspace } from "./WorkspaceProvider";

export function WorkspaceHeader() {
  const { organization, currentProject, user, membership, loading } = useWorkspace();

  if (loading) {
    return (
      <header className="border-b border-zinc-800 bg-zinc-950/80 px-6 py-4">
        <div className="mx-auto max-w-6xl animate-pulse text-sm text-zinc-500">加载 Workspace…</div>
      </header>
    );
  }

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 px-6 py-4">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-emerald-500/90">
            AI Fitness Workspace
          </p>
          <h1 className="text-lg font-semibold text-white">
            {organization?.name ?? "未命名组织"}
          </h1>
        </div>
        <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-zinc-400">
          <span>
            项目：<span className="text-zinc-200">{currentProject?.name ?? "—"}</span>
          </span>
          <span>
            用户：<span className="text-zinc-200">{user?.email ?? "—"}</span>
          </span>
          <span>
            角色：<span className="text-zinc-200">{membership?.role ?? "—"}</span>
          </span>
        </div>
      </div>
    </header>
  );
}
