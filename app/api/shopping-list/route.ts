import { randomBytes } from "node:crypto";
import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import { getRecipe } from "@/lib/store/recipes";
import {
  addShoppingItems,
  clearAll,
  clearChecked,
  listShoppingItems,
  removeItem,
  setItemChecked,
} from "@/lib/store/shopping-list";
import { INGREDIENT_CATEGORIES, type ShoppingListItem } from "@/lib/types";

const addSchema = z.union([
  z.object({ recipeId: z.string().min(1) }),
  z.object({
    name: z.string().min(1),
    quantity: z.number().positive(),
    unit: z.string().min(1),
    category: z.enum(INGREDIENT_CATEGORIES),
  }),
]);

const patchSchema = z.object({
  id: z.string().min(1),
  checked: z.boolean(),
});

export async function GET() {
  const user = await requireUser();
  const items = await listShoppingItems(user.id);
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await requireUser();
  const body = await req.json().catch(() => null);
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid payload", issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const now = new Date().toISOString();
  const newItems: ShoppingListItem[] = [];

  if ("recipeId" in parsed.data) {
    const recipe = await getRecipe(parsed.data.recipeId);
    if (!recipe) {
      return NextResponse.json({ error: "Recipe not found" }, { status: 404 });
    }
    for (const ing of recipe.ingredients) {
      newItems.push({
        id: `sli_${randomBytes(6).toString("hex")}`,
        userId: user.id,
        recipeId: recipe.id,
        recipeTitle: recipe.title,
        name: ing.name,
        quantity: ing.quantity,
        unit: ing.unit,
        category: ing.category,
        checked: false,
        createdAt: now,
      });
    }
  } else {
    newItems.push({
      id: `sli_${randomBytes(6).toString("hex")}`,
      userId: user.id,
      recipeId: null,
      recipeTitle: null,
      name: parsed.data.name,
      quantity: parsed.data.quantity,
      unit: parsed.data.unit,
      category: parsed.data.category,
      checked: false,
      createdAt: now,
    });
  }

  await addShoppingItems(newItems);
  return NextResponse.json({ addedCount: newItems.length, items: newItems });
}

export async function PATCH(req: Request) {
  const user = await requireUser();
  const body = await req.json().catch(() => null);
  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }
  const updated = await setItemChecked(
    user.id,
    parsed.data.id,
    parsed.data.checked
  );
  if (!updated) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }
  return NextResponse.json({ item: updated });
}

export async function DELETE(req: Request) {
  const user = await requireUser();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  const scope = searchParams.get("scope");

  if (scope === "checked") {
    await clearChecked(user.id);
    return NextResponse.json({ ok: true });
  }
  if (scope === "all") {
    await clearAll(user.id);
    return NextResponse.json({ ok: true });
  }
  if (!id) {
    return NextResponse.json({ error: "id or scope required" }, { status: 400 });
  }
  await removeItem(user.id, id);
  return NextResponse.json({ ok: true });
}
