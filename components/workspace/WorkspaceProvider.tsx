"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export type WorkspaceUser = {
  id: string;
  email: string;
  name: string | null;
};

export type WorkspaceMembership = {
  id: string;
  role: string;
  organizationId: string;
};

export type WorkspaceOrganization = {
  id: string;
  name: string;
  slug: string;
};

export type WorkspaceProjectRef = {
  id: string;
  name: string;
};

export type WorkspaceStats = {
  projectsCount: number;
  quotesCount: number;
  reportsCount: number;
};

export type WorkspaceSummaryPayload = {
  organization: WorkspaceOrganization | null;
  currentProject: WorkspaceProjectRef | null;
  projectsCount: number;
  quotesCount: number;
  reportsCount: number;
  recentProjects: {
    id: string;
    name: string;
    clientName: string | null;
    quoteCount: number;
    createdAt: string;
  }[];
  recentQuotes: {
    id: string;
    projectId: string;
    status: string;
    createdAt: string;
  }[];
};

type WorkspaceContextValue = {
  loading: boolean;
  error: string | null;
  authenticated: boolean;
  user: WorkspaceUser | null;
  organization: WorkspaceOrganization | null;
  organizationId: string | null;
  membership: WorkspaceMembership | null;
  currentProject: WorkspaceProjectRef | null;
  stats: WorkspaceStats;
  recentProjects: WorkspaceSummaryPayload["recentProjects"];
  recentQuotes: WorkspaceSummaryPayload["recentQuotes"];
  refresh: () => Promise<void>;
  trackEvent: (
    event: string,
    meta?: Record<string, unknown> & { projectId?: string; quoteId?: string },
  ) => void;
};

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [user, setUser] = useState<WorkspaceUser | null>(null);
  const [membership, setMembership] = useState<WorkspaceMembership | null>(null);
  const [summary, setSummary] = useState<WorkspaceSummaryPayload | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/workspace/summary");
      const data = await res.json();
      if (!res.ok || !data.ok) {
        if (res.status === 401) {
          router.replace("/register");
          return;
        }
        setError(data.message || "加载 Workspace 失败");
        setAuthenticated(false);
        return;
      }
      setAuthenticated(true);
      setUser(data.user);
      setMembership(data.membership ?? null);
      setSummary(data.summary);
    } catch {
      setError("网络错误");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const trackEvent = useCallback(
    (event: string, meta?: Record<string, unknown> & { projectId?: string; quoteId?: string }) => {
      void fetch("/api/workspace/analytics", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          projectId: meta?.projectId,
          quoteId: meta?.quoteId,
          meta,
        }),
      });
    },
    [],
  );

  const value = useMemo<WorkspaceContextValue>(
    () => ({
      loading,
      error,
      authenticated,
      user,
      organization: summary?.organization ?? null,
      organizationId: summary?.organization?.id ?? membership?.organizationId ?? null,
      membership,
      currentProject: summary?.currentProject ?? null,
      stats: {
        projectsCount: summary?.projectsCount ?? 0,
        quotesCount: summary?.quotesCount ?? 0,
        reportsCount: summary?.reportsCount ?? 0,
      },
      recentProjects: summary?.recentProjects ?? [],
      recentQuotes: summary?.recentQuotes ?? [],
      refresh,
      trackEvent,
    }),
    [loading, error, authenticated, user, membership, summary, refresh, trackEvent],
  );

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error("useWorkspace must be used within WorkspaceProvider");
  return ctx;
}
