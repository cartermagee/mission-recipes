import { mutateCollection, readCollection } from "@/lib/store/io";
import type { Recipe } from "@/lib/types";

const FILE = "recipes.json";

export async function listRecipes(): Promise<Recipe[]> {
  return readCollection<Recipe>(FILE);
}

export async function getRecipe(id: string): Promise<Recipe | undefined> {
  const all = await listRecipes();
  return all.find((r) => r.id === id);
}

export async function addRecipe(recipe: Recipe): Promise<Recipe> {
  await mutateCollection<Recipe>(FILE, (items) => [recipe, ...items]);
  return recipe;
}
