import { redirect } from "next/navigation";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";
import { getHousehold } from "@/lib/store/households";
import { getInvite } from "@/lib/store/invites";

import { AcceptForm } from "./accept-form";

export default async function InvitePage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const invite = await getInvite(token);

  if (!invite) {
    return (
      <div className="min-h-screen grid place-items-center p-6">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Invite not found</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              This invite link is invalid or has been revoked.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=/invite/${token}`);
  }

  const expired = new Date(invite.expiresAt).getTime() < Date.now();
  const used = Boolean(invite.usedBy);
  const household = await getHousehold(invite.householdId);

  return (
    <div className="min-h-screen grid place-items-center p-6">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>
            {used
              ? "Invite already used"
              : expired
              ? "Invite expired"
              : `Join ${household?.name ?? "household"}`}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {used || expired ? (
            <p className="text-sm text-muted-foreground">
              Ask the admin for a new invite link.
            </p>
          ) : (
            <>
              <p className="text-sm text-muted-foreground">
                Signed in as <span className="font-medium">{user!.name}</span>.
                Accepting will move you into{" "}
                <span className="font-medium">{household?.name}</span>.
              </p>
              <AcceptForm token={token} />
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
