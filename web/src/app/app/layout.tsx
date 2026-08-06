import { AppShell } from "@/components/AppShell";

export default function LoggedInLayout({ children }: { children: React.ReactNode }) {
  return <AppShell>{children}</AppShell>;
}
