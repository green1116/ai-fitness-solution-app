"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { listWorkspacesAction } from "../client/workspace-api-actions";
import type { PortalWorkspaceListState, WorkspaceListQuery } from "../shared/portal-types";
import { applyWorkspaceListQuery, DEFAULT_WORKSPACE_LIST_QUERY } from "../workspace/workspace-list-utils";

const initialState: PortalWorkspaceListState = {
  workspaces: [],
  loading: true,
  error: null,
};

export function useWorkspaceList(initialQuery: Partial<WorkspaceListQuery> = {}) {
  const [state, setState] = useState<PortalWorkspaceListState>(initialState);
  const [query, setQuery] = useState<WorkspaceListQuery>({
    ...DEFAULT_WORKSPACE_LIST_QUERY,
    ...initialQuery,
  });

  const refresh = useCallback(async () => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const workspaces = await listWorkspacesAction();
      setState({ workspaces, loading: false, error: null });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load workspaces";
      setState({ workspaces: [], loading: false, error: message });
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const view = useMemo(() => applyWorkspaceListQuery(state.workspaces, query), [state.workspaces, query]);

  const setStatusFilter = useCallback((statusFilter: WorkspaceListQuery["statusFilter"]) => {
    setQuery((current) => ({ ...current, statusFilter, page: 1 }));
  }, []);

  const setSearch = useCallback((search: string) => {
    setQuery((current) => ({ ...current, search, page: 1 }));
  }, []);

  const setSort = useCallback((sortField: WorkspaceListQuery["sortField"], sortDirection: WorkspaceListQuery["sortDirection"]) => {
    setQuery((current) => ({ ...current, sortField, sortDirection, page: 1 }));
  }, []);

  const setPage = useCallback((page: number) => {
    setQuery((current) => ({ ...current, page }));
  }, []);

  const loadMore = useCallback(() => {
    setQuery((current) => ({ ...current, page: current.page + 1 }));
  }, []);

  return {
    ...state,
    query,
    view,
    refresh,
    setStatusFilter,
    setSearch,
    setSort,
    setPage,
    loadMore,
  };
}
