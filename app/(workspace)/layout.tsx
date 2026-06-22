import Link from "next/link";

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <header className="border-b border-zinc-800 px-6 py-4">
        <nav className="mx-auto flex max-w-5xl items-center gap-6 text-sm">
          <Link href="/dashboard" className="text-zinc-400 hover:text-white">
            控制台
          </Link>
          <Link href="/projects" className="font-semibold">
            项目 Workspace
          </Link>
        </nav>
      </header>
      <main className="mx-auto max-w-5xl px-6 py-8">{children}</main>
    </div>
  );
}
