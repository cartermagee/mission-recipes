import { LoginForm } from "./login-form";
import { listHouseholds } from "@/lib/store/households";
import { listUsers } from "@/lib/store/users";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [users, households] = await Promise.all([
    listUsers(),
    listHouseholds(),
  ]);
  const householdById = new Map(households.map((h) => [h.id, h]));
  const options = users.map((u) => {
    const household = householdById.get(u.householdId);
    const isAdmin = household?.adminUserId === u.id;
    return {
      id: u.id,
      name: u.name,
      householdName: household?.name ?? "—",
      role: isAdmin ? ("Admin" as const) : ("Member" as const),
    };
  });

  const { next } = await searchParams;

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {process.env.NEXT_PUBLIC_APP_NAME ?? "Mission Recipes"}
          </h1>
          <p className="text-muted-foreground">
            Pick a demo user to explore the app.
          </p>
        </div>
        <LoginForm options={options} next={next} />
      </div>
    </div>
  );
}
