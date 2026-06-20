import type { ReactNode } from "react";
import { WorkspaceProductLayout } from "@/lib/saas-product-portal";

type WorkspaceProductRouteLayoutProps = {
  children: ReactNode;
  params: Promise<{ id: string }>;
};

export default async function SaasProductWorkspaceProductLayout({
  children,
  params,
}: WorkspaceProductRouteLayoutProps) {
  const { id } = await params;
  return <WorkspaceProductLayout workspaceId={id}>{children}</WorkspaceProductLayout>;
}
