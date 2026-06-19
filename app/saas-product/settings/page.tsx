import { SettingsPageContent, requirePortalSession } from "@/lib/saas-product-portal";

export default async function SaasProductSettingsPage() {
  const session = await requirePortalSession();
  return <SettingsPageContent session={session} />;
}
