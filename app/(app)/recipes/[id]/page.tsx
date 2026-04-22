import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Clock, Users } from "lucide-react";

import { RecipeCardActions } from "./recipe-card-actions";
import { WarningBadges } from "@/components/warning-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireUserWithHousehold } from "@/lib/auth";
import { annotateRecipe } from "@/lib/match";
import { mergePreferences } from "@/lib/preferences";
import { getRecipe } from "@/lib/store/recipes";

export default async function RecipeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, household } = await requireUserWithHousehold();
  const prefs = mergePreferences(household.preferences, user.preferences);
  const recipe = await getRecipe(id);
  if (!recipe) notFound();
  const annotated = annotateRecipe(recipe, prefs);
  const total = recipe.prepMinutes + recipe.cookMinutes;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" asChild>
        <Link href="/recipes">
          <ArrowLeft className="h-4 w-4" />
          Back to recipes
        </Link>
      </Button>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="relative aspect-[3/2] overflow-hidden rounded-lg bg-muted">
          <Image
            src={recipe.image}
            alt={recipe.title}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover"
          />
        </div>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{recipe.cuisine}</Badge>
            {recipe.dietTags.map((d) => (
              <Badge key={d} variant="outline" className="capitalize">
                {d}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{recipe.title}</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {total} min ({recipe.prepMinutes} prep + {recipe.cookMinutes} cook)
            </span>
            <span className="inline-flex items-center gap-1">
              <Users className="h-4 w-4" />
              Serves {recipe.servings}
            </span>
          </div>
          <WarningBadges recipe={annotated} />
          <RecipeCardActions recipeId={recipe.id} title={recipe.title} />
        </div>
      </div>

      <Separator />

      <div className="grid md:grid-cols-5 gap-8">
        <section className="md:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold">Ingredients</h2>
          <Card>
            <CardContent className="p-4">
              <ul className="space-y-2 text-sm">
                {recipe.ingredients.map((ing, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="tabular-nums text-muted-foreground">
                      {ing.quantity} {ing.unit}
                    </span>
                    <span>{ing.name}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </section>
        <section className="md:col-span-3 space-y-3">
          <h2 className="text-lg font-semibold">Steps</h2>
          <ol className="space-y-4">
            {recipe.steps.map((step, idx) => (
              <li key={idx} className="flex gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
                  {idx + 1}
                </span>
                <p className="text-sm pt-0.5">{step}</p>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}
