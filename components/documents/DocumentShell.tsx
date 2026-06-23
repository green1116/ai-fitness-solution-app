"use client";

import { DocumentProvider } from "./DocumentProvider";
import { DocumentHeader } from "./DocumentHeader";
import { DocumentNav } from "./DocumentNav";

export function DocumentShell({ children }: { children: React.ReactNode }) {
  return (
    <DocumentProvider>
      <div className="min-h-screen bg-zinc-950 text-white">
        <DocumentHeader />
        <DocumentNav />
        <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
      </div>
    </DocumentProvider>
  );
}
