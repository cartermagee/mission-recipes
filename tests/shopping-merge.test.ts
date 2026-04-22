import { describe, expect, it } from "vitest";

import { groupByCategory, mergeByNameAndUnit } from "@/lib/shopping-merge";
import type { ShoppingListItem } from "@/lib/types";

function mkItem(partial: Partial<ShoppingListItem>): ShoppingListItem {
  return {
    id: Math.random().toString(36).slice(2),
    userId: "u1",
    recipeId: "r1",
    recipeTitle: "Test",
    name: "olive oil",
    quantity: 1,
    unit: "tbsp",
    category: "pantry",
    checked: false,
    createdAt: new Date().toISOString(),
    ...partial,
  };
}

describe("mergeByNameAndUnit", () => {
  it("merges items with the same normalized name and unit", () => {
    const items = [
      mkItem({ name: "olive oil", quantity: 2, unit: "tbsp" }),
      mkItem({ name: "Olive Oil", quantity: 1, unit: "tbsp" }),
    ];
    const merged = mergeByNameAndUnit(items);
    expect(merged).toHaveLength(1);
    expect(merged[0].totalQuantity).toBe(3);
  });

  it("does not merge items with different units", () => {
    const items = [
      mkItem({ name: "olive oil", quantity: 2, unit: "tbsp" }),
      mkItem({ name: "olive oil", quantity: 100, unit: "ml" }),
    ];
    const merged = mergeByNameAndUnit(items);
    expect(merged).toHaveLength(2);
  });

  it("marks a merged line as allChecked only when every underlying item is checked", () => {
    const items = [
      mkItem({ name: "salt", unit: "tsp", checked: true }),
      mkItem({ name: "salt", unit: "tsp", checked: false }),
    ];
    const merged = mergeByNameAndUnit(items);
    expect(merged[0].allChecked).toBe(false);
  });
});

describe("groupByCategory", () => {
  it("groups lines into their categories", () => {
    const items = [
      mkItem({ name: "olive oil", unit: "tbsp", category: "pantry" }),
      mkItem({ name: "carrot", unit: "whole", category: "produce" }),
    ];
    const groups = groupByCategory(mergeByNameAndUnit(items));
    expect(groups.pantry).toHaveLength(1);
    expect(groups.produce).toHaveLength(1);
  });
});
