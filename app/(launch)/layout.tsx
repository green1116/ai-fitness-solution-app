import { LaunchShell } from "@/components/launch/LaunchShell";

export default function LaunchLayout({ children }: { children: React.ReactNode }) {
  return <LaunchShell>{children}</LaunchShell>;
}
