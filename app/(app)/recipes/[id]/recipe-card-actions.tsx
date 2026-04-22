"use client";

import { Plus } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";

export function RecipeCardActions({
  recipeId,
  title,
}: {
  recipeId: string;
  title: string;
}) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const addToList = () => {
    startTransition(async () => {
      const res = await fetch("/api/shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId }),
      });
      if (!res.ok) {
        toast({
          variant: "destructive",
          title: "Could not add to shopping list",
        });
        return;
      }
      const { addedCount } = await res.json();
      toast({
        variant: "success",
        title: "Added to shopping list",
        description: `${addedCount} ingredients from ${title}.`,
      });
    });
  };

  return (
    <div>
      <Button onClick={addToList} disabled={isPending}>
        <Plus className="h-4 w-4" />
        {isPending ? "Adding…" : "Add ingredients to shopping list"}
      </Button>
    </div>
  );
}
