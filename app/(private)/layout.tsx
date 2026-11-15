import { requireAuth } from "@/features/auth/actions/auth.actions";
import { DashboardShell } from "@/features/dashboard/components/DashboardShell";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAuth();

  return <DashboardShell user={session.user}>{children}</DashboardShell>;
}
