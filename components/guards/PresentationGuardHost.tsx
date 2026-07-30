"use client";

import { Suspense, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ContextSoftGuide } from "@/components/guards/ContextSoftGuide";
import {
  requiresSessionObservation,
  resolvePresentationGuard,
  type SessionObservation,
} from "@/lib/frontend/presentation-guards";
import { observeSessionPresentation } from "@/lib/frontend/session-observation";

type PresentationGuardHostProps = Readonly<{
  children: React.ReactNode;
}>;

function PresentationGuardHostInner({
  children,
}: PresentationGuardHostProps) {
  const pathname = usePathname() ?? "/";
  const searchParams = useSearchParams();
  const router = useRouter();
  const projectId = searchParams.get("projectId");
  const [session, setSession] = useState<SessionObservation | null>(null);
  const [ready, setReady] = useState(
    () => !requiresSessionObservation(pathname),
  );
  const [softContext, setSoftContext] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      setSoftContext(false);

      if (!requiresSessionObservation(pathname)) {
        const openDecision = resolvePresentationGuard({
          pathname,
          projectId,
          session: null,
        });
        if (openDecision.action === "redirect") {
          setReady(false);
          router.replace(openDecision.to);
          return;
        }
        setSession(null);
        setReady(true);
        return;
      }

      setReady(false);
      const observation = await observeSessionPresentation();
      if (cancelled) return;
      setSession(observation);

      const decision = resolvePresentationGuard({
        pathname,
        projectId,
        session: observation,
      });

      if (decision.action === "redirect") {
        router.replace(decision.to);
        return;
      }

      setSoftContext(decision.action === "soft-context");
      setReady(true);
    })();

    return () => {
      cancelled = true;
    };
  }, [pathname, projectId, router]);

  if (!ready) {
    return (
      <div
        data-guard="pending"
        className="mx-auto w-full max-w-7xl px-6 py-10 text-sm text-slate-500"
      >
        Checking access…
      </div>
    );
  }

  return (
    <>
      {softContext ? <ContextSoftGuide /> : null}
      <div
        data-guard-session={
          session?.presentedSession ? "presented" : "none"
        }
      >
        {children}
      </div>
    </>
  );
}

export function PresentationGuardHost({
  children,
}: PresentationGuardHostProps) {
  return (
    <Suspense fallback={<>{children}</>}>
      <PresentationGuardHostInner>{children}</PresentationGuardHostInner>
    </Suspense>
  );
}
