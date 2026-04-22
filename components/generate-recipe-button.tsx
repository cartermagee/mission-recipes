"use client";

import { useRouter } from "next/navigation";
import { Sparkles } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function GenerateRecipeButton({
  suggestion,
}: {
  suggestion?: string;
}) {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const generate = () => {
    startTransition(async () => {
      const res = await fetch("/api/recipes/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(suggestion ? { seedHint: suggestion } : {}),
      });
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Could not generate recipe",
        });
        return;
      }
      const { recipe } = await res.json();
      toast({
        variant: "success",
        title: "New recipe added",
        description: recipe?.title ?? "Check the top of the list.",
      });
      router.refresh();
    });
  };

  return (
    <Button onClick={generate} disabled={isPending}>
      <Sparkles className="h-4 w-4" />
      {isPending ? "Generating…" : "Generate new recipe"}
    </Button>
  );
}
