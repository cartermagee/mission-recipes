import { NextResponse } from "next/server";

import { requireUser } from "@/lib/auth";
import { getInvite, markInviteUsed } from "@/lib/store/invites";
import { setUserHousehold } from "@/lib/store/users";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const user = await requireUser();
  const { token } = await params;
  const invite = await getInvite(token);
  if (!invite) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  }
  if (invite.usedBy) {
    return NextResponse.json(
      { error: "This invite has already been used" },
      { status: 410 }
    );
  }
  if (new Date(invite.expiresAt).getTime() < Date.now()) {
    return NextResponse.json(
      { error: "This invite has expired" },
      { status: 410 }
    );
  }

  await setUserHousehold(user.id, invite.householdId);
  await markInviteUsed(invite.token, user.id);

  return NextResponse.json({ ok: true, householdId: invite.householdId });
}
