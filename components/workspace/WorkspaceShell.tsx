"use client";

import { WorkspaceProvider } from "./WorkspaceProvider";
import { WorkspaceHeader } from "./WorkspaceHeader";
import { WorkspaceNav } from "./WorkspaceNav";

export function WorkspaceShell({ children }: { children: React.ReactNode }) {
  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-zinc-950 text-white">
        <WorkspaceHeader />
        <WorkspaceNav />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </WorkspaceProvider>
  );
}
