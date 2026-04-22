import type { IngredientCategory, ShoppingListItem } from "@/lib/types";

export interface MergedLine {
  key: string;
  name: string;
  unit: string;
  category: IngredientCategory;
  totalQuantity: number;
  itemIds: string[];
  recipeTitles: string[];
  allChecked: boolean;
}

function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[,(].*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function mergeByNameAndUnit(items: ShoppingListItem[]): MergedLine[] {
  const map = new Map<string, MergedLine>();
  for (const it of items) {
    const key = `${normalize(it.name)}__${it.unit.toLowerCase()}`;
    const existing = map.get(key);
    if (existing) {
      existing.totalQuantity += it.quantity;
      existing.itemIds.push(it.id);
      if (it.recipeTitle && !existing.recipeTitles.includes(it.recipeTitle)) {
        existing.recipeTitles.push(it.recipeTitle);
      }
      existing.allChecked = existing.allChecked && it.checked;
    } else {
      map.set(key, {
        key,
        name: it.name,
        unit: it.unit,
        category: it.category,
        totalQuantity: it.quantity,
        itemIds: [it.id],
        recipeTitles: it.recipeTitle ? [it.recipeTitle] : [],
        allChecked: it.checked,
      });
    }
  }
  return Array.from(map.values());
}

export function groupByCategory(
  lines: MergedLine[]
): Record<IngredientCategory, MergedLine[]> {
  const groups: Record<string, MergedLine[]> = {};
  for (const line of lines) {
    (groups[line.category] ??= []).push(line);
  }
  for (const k of Object.keys(groups)) {
    groups[k].sort((a, b) => a.name.localeCompare(b.name));
  }
  return groups as Record<IngredientCategory, MergedLine[]>;
}

export function roundQuantity(n: number): string {
  if (Number.isInteger(n)) return String(n);
  return (Math.round(n * 100) / 100).toString();
}
