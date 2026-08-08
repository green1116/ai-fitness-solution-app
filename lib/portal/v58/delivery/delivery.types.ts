/**
 * Minimal DeliveryRecord type for Pilot P1 artifact visibility.
 */

export type DeliveryRecord = {
  id: string;
  projectId?: string;
  title?: string;
  fileName?: string;
  status: string;
  createdAt?: string;
  downloadUrl?: string;
  openUrl?: string;
  slot?: string;
  kind?: string;
  artifactType?:
    | "plan_pdf"
    | "budget_pdf"
    | "quote_pdf"
    | "zip_package"
    | string;
};
