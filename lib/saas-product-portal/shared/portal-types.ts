import type { NavigationItem } from "@/lib/saas-portal/shared/portal-types";

export interface PortalMeData {
  tenantId: string;
  userId: string;
}

export interface PortalUser {
  userId: string;
  email?: string;
}

export interface PortalTenant {
  tenantId: string;
}

export interface PortalMembership {
  id: string;
  userId: string;
  tenantId: string;
  organizationId?: string;
  workspaceId?: string;
  roleSystemCode?: string;
  portalType?: string;
}

export type PortalSessionSource = "cookie" | "headers" | "none";

export interface PortalSessionState {
  user: PortalUser | null;
  tenant: PortalTenant | null;
  role?: string;
  membership?: PortalMembership | null;
  sessionSource?: PortalSessionSource;
  portalDisplayName?: string;
  loading: boolean;
  error: string | null;
}

export interface PortalSessionSnapshot extends PortalSessionState {
  user: PortalUser;
  tenant: PortalTenant;
  membership: PortalMembership;
  sessionSource: PortalSessionSource;
  navigation: NavigationItem[];
}

export interface SaasProductApiSuccessBody<T> {
  ok: true;
  data: T;
}

export interface SaasProductApiErrorBody {
  ok: false;
  code?: string;
  message?: string;
}

export type SaasProductApiResponseBody<T> = SaasProductApiSuccessBody<T> | SaasProductApiErrorBody;

export interface PortalKpiSnapshot {
  workspaces: number;
  quotes: number;
  workflows: number;
}

export interface PortalP1Validation {
  valid: boolean;
  summary: string;
}

export interface PortalSessionValidation {
  valid: boolean;
  summary: string;
  userId?: string;
  tenantId?: string;
  role?: string;
  membershipId?: string;
}

export type PortalWorkspaceStatus = "ACTIVE" | "ARCHIVED";

export interface PortalWorkspace {
  id: string;
  tenantId: string;
  name: string;
  status: PortalWorkspaceStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PortalWorkspaceListData {
  workspaces: PortalWorkspace[];
}

export interface PortalWorkspaceDetailData {
  workspace: PortalWorkspace;
}

export interface PortalCreateWorkspaceInput {
  name: string;
}

export interface PortalWorkspaceListState {
  workspaces: PortalWorkspace[];
  loading: boolean;
  error: string | null;
}

export interface PortalWorkspaceDetailState {
  workspace: PortalWorkspace | null;
  loading: boolean;
  error: string | null;
}

export interface PortalP3Validation {
  valid: boolean;
  summary: string;
}

export interface PortalP4Validation {
  valid: boolean;
  summary: string;
}

export interface PortalP5Validation {
  valid: boolean;
  summary: string;
}

export interface PortalP6Validation {
  valid: boolean;
  summary: string;
}

export interface QuoteEntryRegistryMount {
  key: string;
  segment: string;
  layer: "business-entry";
  status: WorkspaceProductEntryStatus;
  capability: "entry-only";
  note: string;
}

export interface QuoteEntryNavMount {
  key: string;
  label: string;
  segment: string;
  layer: "business-entry";
}

export interface QuoteEntryStatusView {
  phase: string;
  layer: "business-entry";
  capability: "entry-only";
  commercialLogic: false;
  label: string;
  summary: string;
}

export type QuoteEntryPlaceholderCardStatus = "coming-soon" | "placeholder";

export interface QuoteEntryPlaceholderCard {
  key: string;
  title: string;
  description: string;
  status: QuoteEntryPlaceholderCardStatus;
}

export interface PortalP7Validation {
  valid: boolean;
  summary: string;
}

export interface ProjectEntryRegistryMount {
  key: string;
  segment: string;
  layer: "business-entry";
  status: WorkspaceProductEntryStatus;
  capability: "entry-only";
  note: string;
}

export interface ProjectEntryNavMount {
  key: string;
  label: string;
  segment: string;
  layer: "business-entry";
}

export interface ProjectEntryStatusView {
  phase: string;
  layer: "business-entry";
  capability: "entry-only";
  projectRuntime: false;
  label: string;
  summary: string;
}

export type ProjectEntryPlaceholderCardStatus = "coming-soon" | "placeholder";

export interface ProjectEntryPlaceholderCard {
  key: string;
  title: string;
  description: string;
  status: ProjectEntryPlaceholderCardStatus;
}

export interface WorkspaceMetadataView {
  id: string;
  name: string;
  status: PortalWorkspaceStatus;
  tenantId: string;
  createdAt: string;
  updatedAt: string;
}

export interface WorkspaceProductNavItem {
  key: string;
  label: string;
  segment?: string;
  href: (workspaceId: string) => string;
}

export type WorkspaceProductEntryStatus = "registered" | "planned";

export interface WorkspaceProductEntry {
  key: string;
  label: string;
  description: string;
  segment: string;
  status: WorkspaceProductEntryStatus;
  capability: "entry-only";
}

export interface WorkspaceContextValue {
  workspaceId: string;
  workspace: PortalWorkspace | null;
  status: PortalWorkspaceStatus | null;
  metadata: WorkspaceMetadataView | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export type WorkspaceSortField = "name" | "updatedAt" | "createdAt";

export type WorkspaceSortDirection = "asc" | "desc";

export type WorkspaceStatusFilter = "ALL" | PortalWorkspaceStatus;

export interface WorkspaceListQuery {
  statusFilter: WorkspaceStatusFilter;
  sortField: WorkspaceSortField;
  sortDirection: WorkspaceSortDirection;
  search: string;
  page: number;
  pageSize: number;
}

export interface WorkspaceListView {
  items: PortalWorkspace[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasMore: boolean;
}

export interface PortalUpdateWorkspaceStatusInput {
  status: PortalWorkspaceStatus;
}
