import { PreferenceForm } from "@/components/preference-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { requireUserWithHousehold } from "@/lib/auth";
import { listUsersInHousehold } from "@/lib/store/users";

import { InvitePanel } from "./invite-panel";

export default async function HouseholdPage() {
  const { user, household, isAdmin } = await requireUserWithHousehold();
  const members = await listUsersInHousehold(household.id);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">{household.name}</h1>
        <p className="text-muted-foreground">
          {isAdmin
            ? "As admin, you can set the household's default preferences and invite people to join."
            : "Your household's default preferences are shown below. Only the admin can change them."}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Members</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {members.map((m) => (
            <div
              key={m.id}
              className="flex items-center justify-between rounded-md border p-3"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="font-medium">{m.name}</span>
                {m.id === household.adminUserId ? (
                  <Badge variant="default" className="text-[10px]">
                    Admin
                  </Badge>
                ) : null}
                {m.id === user.id ? (
                  <Badge variant="outline" className="text-[10px]">
                    You
                  </Badge>
                ) : null}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {isAdmin ? <InvitePanel /> : null}

      <div className="space-y-2">
        <h2 className="text-lg font-semibold">
          Household preferences {isAdmin ? "" : "(read only)"}
        </h2>
        <PreferenceForm
          scope="household"
          initial={household.preferences}
          readOnly={!isAdmin}
          endpoint="/api/household"
        />
      </div>
    </div>
  );
}
