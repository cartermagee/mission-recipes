"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";

export interface LoginOption {
  id: string;
  name: string;
  householdName: string;
  role: "Admin" | "Member";
}

export function LoginForm({
  options,
  next,
}: {
  options: LoginOption[];
  next?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [selected, setSelected] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleLogin = (userId: string) => {
    startTransition(async () => {
      setSelected(userId);
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });
      if (!res.ok) {
        const { error } = await res.json().catch(() => ({}));
        toast({
          variant: "destructive",
          title: "Login failed",
          description: error ?? "Unknown error",
        });
        setSelected(null);
        return;
      }
      router.push(next && next.startsWith("/") ? next : "/recipes");
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      {options.map((opt) => (
        <Card
          key={opt.id}
          className="transition hover:border-primary/60 hover:shadow-md"
        >
          <CardContent className="flex items-center justify-between gap-4 p-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-semibold">{opt.name}</span>
                <Badge
                  variant={opt.role === "Admin" ? "default" : "secondary"}
                  className="text-[10px]"
                >
                  {opt.role}
                </Badge>
              </div>
              <div className="text-xs text-muted-foreground">
                {opt.householdName}
              </div>
            </div>
            <Button
              size="sm"
              onClick={() => handleLogin(opt.id)}
              disabled={isPending}
            >
              {isPending && selected === opt.id ? "Signing in…" : "Sign in"}
            </Button>
          </CardContent>
        </Card>
      ))}
      <p className="text-center text-xs text-muted-foreground">
        Mock authentication — no password, demo only.
      </p>
    </div>
  );
}
