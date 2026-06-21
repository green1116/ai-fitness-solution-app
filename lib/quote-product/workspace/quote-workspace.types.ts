export interface ResolvedQuoteWorkspace {
  workspaceId: string;
  title: string;
  portalRoute: string;
  tenantId?: string;
  sessionId?: string;
}

export interface QuoteWorkspaceResolveInput {
  workspaceId: string;
  tenantId?: string;
  sessionId?: string;
}
