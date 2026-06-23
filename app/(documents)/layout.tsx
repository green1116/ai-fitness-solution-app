import { DocumentShell } from "@/components/documents/DocumentShell";

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
  return <DocumentShell>{children}</DocumentShell>;
}
