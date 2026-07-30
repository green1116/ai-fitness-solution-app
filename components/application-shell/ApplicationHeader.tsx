import Link from "next/link";

import { ShellNavigation } from "@/components/navigation/ShellNavigation";

export function ApplicationHeader() {
  return (
    <header className="border-b border-slate-200 bg-white text-slate-950">
      <a
        href="#main-content"
        className="sr-only z-50 rounded-md bg-slate-950 px-4 py-2 text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4"
      >
        Skip to main content
      </a>

      <div className="mx-auto flex w-full max-w-7xl flex-wrap items-center justify-between gap-4 px-6 py-4">
        <Link
          href="/"
          data-nav-id="NAV-HOME"
          className="text-base font-semibold tracking-tight text-slate-950"
        >
          AI Fitness Solution
        </Link>

        <ShellNavigation />
      </div>
    </header>
  );
}
