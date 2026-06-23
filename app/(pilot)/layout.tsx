import { PilotShell } from "@/components/pilot/PilotShell";

export default function PilotLayout({ children }: { children: React.ReactNode }) {
  return <PilotShell>{children}</PilotShell>;
}
