"use client";

import { Copy, Link as LinkIcon, UserPlus } from "lucide-react";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";

interface CreatedInvite {
  token: string;
  url: string;
  expiresAt: string;
}

export function InvitePanel() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [invites, setInvites] = useState<CreatedInvite[]>([]);

  const generate = () => {
    startTransition(async () => {
      const res = await fetch("/api/household/invites", { method: "POST" });
      if (!res.ok) {
        toast({ variant: "destructive", title: "Could not create invite" });
        return;
      }
      const { invite } = await res.json();
      const url = `${window.location.origin}/invite/${invite.token}`;
      setInvites((prev) => [
        { token: invite.token, url, expiresAt: invite.expiresAt },
        ...prev,
      ]);
      try {
        await navigator.clipboard.writeText(url);
        toast({
          variant: "success",
          title: "Invite link copied",
          description: "Share it with whoever should join your household.",
        });
      } catch {
        toast({
          title: "Invite created",
          description: "Copy the link below to share.",
        });
      }
    });
  };

  const copy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ variant: "success", title: "Link copied" });
    } catch {
      toast({ variant: "destructive", title: "Clipboard unavailable" });
    }
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <div>
          <CardTitle className="text-base">Invite new members</CardTitle>
          <p className="text-sm text-muted-foreground">
            Create a shareable link. No email is sent — copy and share however
            you like.
          </p>
        </div>
        <Button onClick={generate} disabled={isPending}>
          <UserPlus className="h-4 w-4" />
          {isPending ? "Creating…" : "Create invite"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-2">
        {invites.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            No invites generated this session.
          </p>
        ) : (
          invites.map((inv) => (
            <div
              key={inv.token}
              className="flex items-center gap-2 rounded-md border p-2"
            >
              <LinkIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
              <Input readOnly value={inv.url} className="font-mono text-xs" />
              <Button
                variant="outline"
                size="sm"
                onClick={() => copy(inv.url)}
              >
                <Copy className="h-3.5 w-3.5" />
                Copy
              </Button>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
