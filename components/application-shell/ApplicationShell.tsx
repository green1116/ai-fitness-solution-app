"use client";

import { Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import { ApplicationFooter } from "@/components/application-shell/ApplicationFooter";
import { ApplicationHeader } from "@/components/application-shell/ApplicationHeader";
import { MainContentHost } from "@/components/application-shell/MainContentHost";
import { ShellContextHost } from "@/components/application-shell/ShellContextHost";
import { PresentationGuardHost } from "@/components/guards/PresentationGuardHost";
import { SignInAffordance } from "@/components/guards/SignInAffordance";
import { resolveShellMode } from "@/lib/frontend/layout-patterns";

type ApplicationShellProps = Readonly<{
  children: React.ReactNode;
}>;

function ApplicationShellInner({ children }: ApplicationShellProps) {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const shellMode = resolveShellMode(pathname);
  const showContext =
    shellMode === "work" || shellMode === "result" || shellMode === "library";
  const showFooter = shellMode === "entry";
  const showSignInAffordance =
    shellMode === "entry" && searchParams.get("signin") === "1";

  return (
    <div
      data-shell-host="LAYCMP-SHELL"
      data-shell-mode={shellMode}
      className="flex min-h-dvh flex-col bg-white text-slate-950"
    >
      <ApplicationHeader />
      {showSignInAffordance ? <SignInAffordance /> : null}
      {showContext ? <ShellContextHost /> : null}
      <MainContentHost>
        <PresentationGuardHost>{children}</PresentationGuardHost>
      </MainContentHost>
      {showFooter ? <ApplicationFooter /> : null}
    </div>
  );
}

export function ApplicationShell({ children }: ApplicationShellProps) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-white" />}>
      <ApplicationShellInner>{children}</ApplicationShellInner>
    </Suspense>
  );
}
