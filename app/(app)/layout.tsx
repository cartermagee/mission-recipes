import { AppHeader } from "@/components/app-header";
import { requireUserWithHousehold } from "@/lib/auth";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, household, isAdmin } = await requireUserWithHousehold();
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader
        userName={user.name}
        householdName={household.name}
        isAdmin={isAdmin}
      />
      <main className="container flex-1 py-6">{children}</main>
    </div>
  );
}
