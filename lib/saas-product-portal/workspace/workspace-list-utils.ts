import type {
  PortalWorkspace,
  WorkspaceListQuery,
  WorkspaceListView,
  WorkspaceSortDirection,
  WorkspaceSortField,
} from "../shared/portal-types";

export const DEFAULT_WORKSPACE_LIST_QUERY: WorkspaceListQuery = {
  statusFilter: "ALL",
  sortField: "updatedAt",
  sortDirection: "desc",
  search: "",
  page: 1,
  pageSize: 8,
};

function compareStrings(a: string, b: string, direction: WorkspaceSortDirection): number {
  const result = a.localeCompare(b);
  return direction === "asc" ? result : -result;
}

function compareDates(a: string, b: string, direction: WorkspaceSortDirection): number {
  const result = new Date(a).getTime() - new Date(b).getTime();
  return direction === "asc" ? result : -result;
}

export function sortWorkspaces(
  workspaces: PortalWorkspace[],
  sortField: WorkspaceSortField,
  sortDirection: WorkspaceSortDirection,
): PortalWorkspace[] {
  const sorted = [...workspaces];
  sorted.sort((left, right) => {
    if (sortField === "name") {
      return compareStrings(left.name, right.name, sortDirection);
    }
    if (sortField === "createdAt") {
      return compareDates(left.createdAt, right.createdAt, sortDirection);
    }
    return compareDates(left.updatedAt, right.updatedAt, sortDirection);
  });
  return sorted;
}

export function applyWorkspaceListQuery(
  workspaces: PortalWorkspace[],
  query: WorkspaceListQuery,
): WorkspaceListView {
  const search = query.search.trim().toLowerCase();
  let filtered = workspaces;

  if (query.statusFilter !== "ALL") {
    filtered = filtered.filter((workspace) => workspace.status === query.statusFilter);
  }

  if (search) {
    filtered = filtered.filter(
      (workspace) =>
        workspace.name.toLowerCase().includes(search) || workspace.id.toLowerCase().includes(search),
    );
  }

  const sorted = sortWorkspaces(filtered, query.sortField, query.sortDirection);
  const total = sorted.length;
  const totalPages = Math.max(1, Math.ceil(total / query.pageSize));
  const page = Math.min(Math.max(query.page, 1), totalPages);
  const start = (page - 1) * query.pageSize;
  const items = sorted.slice(start, start + query.pageSize);

  return {
    items,
    total,
    page,
    pageSize: query.pageSize,
    totalPages,
    hasMore: page < totalPages,
  };
}
