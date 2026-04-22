"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function AcceptForm({ token }: { token: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const accept = () => {
    startTransition(async () => {
      const res = await fetch(`/api/invites/${token}/accept`, {
        method: "POST",
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        toast({
          variant: "destructive",
          title: "Could not accept invite",
          description: error ?? "Unknown error",
        });
        return;
      }
      toast({ variant: "success", title: "You joined the household." });
      router.push("/recipes");
      router.refresh();
    });
  };

  return (
    <div className="flex justify-end gap-2">
      <Button variant="outline" onClick={() => router.push("/recipes")}>
        Not now
      </Button>
      <Button onClick={accept} disabled={isPending}>
        {isPending ? "Joining…" : "Accept invite"}
      </Button>
    </div>
  );
}
