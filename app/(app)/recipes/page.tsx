import { FilterBar } from "@/components/filter-bar";
import { GenerateRecipeButton } from "@/components/generate-recipe-button";
import { RecipeCard } from "@/components/recipe-card";
import { Card, CardContent } from "@/components/ui/card";
import { requireUserWithHousehold } from "@/lib/auth";
import { mergePreferences } from "@/lib/preferences";
import {
  SORT_OPTIONS,
  annotateAndFilter,
  type SortOption,
} from "@/lib/recipe-query";
import { listRecipes } from "@/lib/store/recipes";
import { CUISINES, DIETS, type Cuisine, type Diet } from "@/lib/types";

type SP = Record<string, string | string[] | undefined>;

function toArray(value: string | string[] | undefined): string[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap((v) => v.split(","));
  return value.split(",");
}

export default async function RecipesPage({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const { user, household } = await requireUserWithHousehold();
  const prefs = mergePreferences(household.preferences, user.preferences);

  const sp = await searchParams;
  const sortRaw = typeof sp.sort === "string" ? sp.sort : undefined;
  const sort: SortOption = (SORT_OPTIONS as readonly string[]).includes(
    sortRaw ?? ""
  )
    ? (sortRaw as SortOption)
    : "best-match";
  const maxPrepRaw = typeof sp.maxPrep === "string" ? Number(sp.maxPrep) : NaN;

  const filters = {
    cuisines: toArray(sp.cuisine).filter((c): c is Cuisine =>
      (CUISINES as readonly string[]).includes(c)
    ),
    diets: toArray(sp.diet).filter((d): d is Diet =>
      (DIETS as readonly string[]).includes(d)
    ),
    maxPrepMinutes: Number.isFinite(maxPrepRaw) ? maxPrepRaw : undefined,
    sort,
    hideAllergyWarnings:
      sp.hideAllergyWarnings === "true" || sp.hideAllergyWarnings === "1",
    query: typeof sp.q === "string" ? sp.q : undefined,
  };

  const all = await listRecipes();
  const recipes = annotateAndFilter(all, prefs, filters);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Recipes</h1>
          <p className="text-sm text-muted-foreground">
            Personalized to{" "}
            <span className="font-medium text-foreground">{user.name}</span>.
            {prefs.allergies.length > 0 ? (
              <>
                {" "}Warnings shown for{" "}
                <span className="font-medium text-foreground capitalize">
                  {prefs.allergies.join(", ")}
                </span>
                .
              </>
            ) : null}
          </p>
        </div>
        <GenerateRecipeButton />
      </div>

      <FilterBar />

      {recipes.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center space-y-2">
            <div className="text-sm font-medium">No recipes match.</div>
            <p className="text-xs text-muted-foreground">
              Try clearing filters or turning off the &quot;Hide allergy
              warnings&quot; toggle.
            </p>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="text-xs text-muted-foreground">
            Showing {recipes.length} of {all.length} recipes.
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {recipes.map((r) => (
              <RecipeCard key={r.id} recipe={r} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
