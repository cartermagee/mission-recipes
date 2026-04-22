"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock, Plus, Sparkles, Users } from "lucide-react";
import { useTransition } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { useToast } from "@/components/ui/toast";
import { WarningBadges } from "@/components/warning-badge";
import type { AnnotatedRecipe } from "@/lib/match";

export function RecipeCard({ recipe }: { recipe: AnnotatedRecipe }) {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();

  const total = recipe.prepMinutes + recipe.cookMinutes;

  const addToList = () => {
    startTransition(async () => {
      const res = await fetch("/api/shopping-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recipeId: recipe.id }),
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
        description: `${addedCount} ingredients from ${recipe.title}.`,
      });
    });
  };

  return (
    <Card className="overflow-hidden flex flex-col group transition hover:shadow-md">
      <Link href={`/recipes/${recipe.id}`} className="block relative aspect-[3/2] bg-muted">
        <Image
          src={recipe.image}
          alt={recipe.title}
          fill
          sizes="(max-width: 768px) 100vw, 33vw"
          className="object-cover transition group-hover:scale-105"
        />
        <div className="absolute left-2 top-2 flex gap-1">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur">
            {recipe.cuisine}
          </Badge>
          {recipe.source === "llm" ? (
            <Badge variant="default" className="gap-1 bg-primary/90 backdrop-blur">
              <Sparkles className="h-3 w-3" />
              AI
            </Badge>
          ) : recipe.source === "mock" ? (
            <Badge variant="outline" className="bg-background/90 backdrop-blur">
              Mock
            </Badge>
          ) : null}
        </div>
      </Link>
      <CardContent className="flex-1 space-y-3 p-4">
        <div className="space-y-1">
          <Link href={`/recipes/${recipe.id}`} className="block">
            <h3 className="font-semibold leading-tight hover:text-primary transition-colors">
              {recipe.title}
            </h3>
          </Link>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {total} min
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-3 w-3" />
              Serves {recipe.servings}
            </span>
          </div>
        </div>
        <WarningBadges recipe={recipe} />
        {recipe.dietTags.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {recipe.dietTags.map((d) => (
              <Badge key={d} variant="outline" className="capitalize text-[10px]">
                {d}
              </Badge>
            ))}
          </div>
        ) : null}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={addToList}
          disabled={isPending}
        >
          <Plus className="h-4 w-4" />
          {isPending ? "Adding…" : "Add to shopping list"}
        </Button>
      </CardFooter>
    </Card>
  );
}
