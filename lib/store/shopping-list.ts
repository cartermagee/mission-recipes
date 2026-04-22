import { mutateCollection, readCollection } from "@/lib/store/io";
import type { ShoppingListItem } from "@/lib/types";

const FILE = "shopping-list.json";

export async function listShoppingItems(
  userId: string
): Promise<ShoppingListItem[]> {
  const all = await readCollection<ShoppingListItem>(FILE);
  return all.filter((i) => i.userId === userId);
}

export async function addShoppingItems(
  items: ShoppingListItem[]
): Promise<void> {
  await mutateCollection<ShoppingListItem>(FILE, (current) => [
    ...current,
    ...items,
  ]);
}

export async function setItemChecked(
  userId: string,
  id: string,
  checked: boolean
): Promise<ShoppingListItem | undefined> {
  let updated: ShoppingListItem | undefined;
  await mutateCollection<ShoppingListItem>(FILE, (items) =>
    items.map((it) => {
      if (it.id !== id || it.userId !== userId) return it;
      updated = { ...it, checked };
      return updated;
    })
  );
  return updated;
}

export async function removeItem(userId: string, id: string): Promise<void> {
  await mutateCollection<ShoppingListItem>(FILE, (items) =>
    items.filter((it) => !(it.id === id && it.userId === userId))
  );
}

export async function clearChecked(userId: string): Promise<void> {
  await mutateCollection<ShoppingListItem>(FILE, (items) =>
    items.filter((it) => !(it.userId === userId && it.checked))
  );
}

export async function clearAll(userId: string): Promise<void> {
  await mutateCollection<ShoppingListItem>(FILE, (items) =>
    items.filter((it) => it.userId !== userId)
  );
}
