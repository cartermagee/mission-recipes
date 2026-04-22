import { ShoppingListView } from "./shopping-list-view";
import { requireUser } from "@/lib/auth";
import { listShoppingItems } from "@/lib/store/shopping-list";

export default async function ShoppingListPage() {
  const user = await requireUser();
  const items = await listShoppingItems(user.id);

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Shopping list</h1>
        <p className="text-sm text-muted-foreground">
          Ingredients from recipes you&apos;ve added, merged by name and unit,
          grouped by category.
        </p>
      </div>
      <ShoppingListView initialItems={items} />
    </div>
  );
}
