"use client";

import { useMemo, useState, useTransition } from "react";
import { Check, Download, Trash2 } from "lucide-react";

import { ExportModal } from "@/components/export-modal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/components/ui/toast";
import {
  groupByCategory,
  mergeByNameAndUnit,
  roundQuantity,
  type MergedLine,
} from "@/lib/shopping-merge";
import { INGREDIENT_CATEGORIES, type ShoppingListItem } from "@/lib/types";

const categoryLabels: Record<(typeof INGREDIENT_CATEGORIES)[number], string> = {
  produce: "Produce",
  dairy: "Dairy & Eggs",
  pantry: "Pantry",
  meat: "Meat",
  seafood: "Seafood",
  bakery: "Bakery",
  frozen: "Frozen",
  other: "Other",
};

export function ShoppingListView({
  initialItems,
}: {
  initialItems: ShoppingListItem[];
}) {
  const [items, setItems] = useState<ShoppingListItem[]>(initialItems);
  const [isPending, startTransition] = useTransition();
  const [exportVendor, setExportVendor] = useState<
    "walmart" | "instacart" | null
  >(null);
  const { toast } = useToast();

  const merged = useMemo(() => mergeByNameAndUnit(items), [items]);
  const groups = useMemo(() => groupByCategory(merged), [merged]);
  const totalLines = merged.length;
  const checkedLines = merged.filter((l) => l.allChecked).length;

  const toggleLine = (line: MergedLine) => {
    const nextChecked = !line.allChecked;
    const targetIds = new Set(line.itemIds);
    setItems((prev) =>
      prev.map((it) =>
        targetIds.has(it.id) ? { ...it, checked: nextChecked } : it
      )
    );
    startTransition(async () => {
      await Promise.all(
        line.itemIds.map((id) =>
          fetch("/api/shopping-list", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, checked: nextChecked }),
          })
        )
      );
    });
  };

  const removeLine = (line: MergedLine) => {
    const targetIds = new Set(line.itemIds);
    setItems((prev) => prev.filter((it) => !targetIds.has(it.id)));
    startTransition(async () => {
      await Promise.all(
        line.itemIds.map((id) =>
          fetch(`/api/shopping-list?id=${encodeURIComponent(id)}`, {
            method: "DELETE",
          })
        )
      );
    });
  };

  const clearChecked = () => {
    const checkedIds = new Set(
      items.filter((it) => it.checked).map((it) => it.id)
    );
    setItems((prev) => prev.filter((it) => !checkedIds.has(it.id)));
    startTransition(async () => {
      await fetch("/api/shopping-list?scope=checked", { method: "DELETE" });
    });
  };

  const clearAll = () => {
    setItems([]);
    startTransition(async () => {
      await fetch("/api/shopping-list?scope=all", { method: "DELETE" });
      toast({ title: "Shopping list cleared" });
    });
  };

  if (items.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center space-y-2">
          <div className="text-sm font-medium">
            Your shopping list is empty.
          </div>
          <p className="text-xs text-muted-foreground">
            Browse recipes and tap &quot;Add to shopping list&quot; to start
            building your cart.
          </p>
        </CardContent>
      </Card>
    );
  }

  const orderedCategories = INGREDIENT_CATEGORIES.filter(
    (c) => groups[c] && groups[c].length > 0
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm">
          <span className="font-medium">{totalLines}</span>{" "}
          <span className="text-muted-foreground">
            line{totalLines === 1 ? "" : "s"} ·{" "}
          </span>
          <span className="font-medium">{checkedLines}</span>{" "}
          <span className="text-muted-foreground">checked</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={clearChecked}
            disabled={isPending || checkedLines === 0}
          >
            <Check className="h-3.5 w-3.5" />
            Clear checked
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={clearAll}
            disabled={isPending}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear all
          </Button>
          <Button
            size="sm"
            onClick={() => setExportVendor("walmart")}
            disabled={items.length === 0}
          >
            <Download className="h-3.5 w-3.5" />
            Export to Walmart
          </Button>
          <Button
            size="sm"
            onClick={() => setExportVendor("instacart")}
            disabled={items.length === 0}
          >
            <Download className="h-3.5 w-3.5" />
            Export to Instacart
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        {orderedCategories.map((cat) => (
          <Card key={cat}>
            <CardContent className="p-4">
              <div className="mb-2 flex items-center gap-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {categoryLabels[cat]}
                </h2>
                <Badge variant="secondary" className="text-[10px]">
                  {groups[cat].length}
                </Badge>
              </div>
              <Separator className="mb-2" />
              <ul className="divide-y">
                {groups[cat].map((line) => (
                  <li
                    key={line.key}
                    className="flex items-center gap-3 py-2"
                  >
                    <Checkbox
                      checked={line.allChecked}
                      onCheckedChange={() => toggleLine(line)}
                    />
                    <div className="flex-1 min-w-0">
                      <div
                        className={
                          line.allChecked
                            ? "text-sm line-through text-muted-foreground"
                            : "text-sm"
                        }
                      >
                        <span className="font-medium tabular-nums">
                          {roundQuantity(line.totalQuantity)} {line.unit}
                        </span>{" "}
                        <span>{line.name}</span>
                      </div>
                      {line.recipeTitles.length > 0 ? (
                        <div className="text-xs text-muted-foreground truncate">
                          {line.recipeTitles.join(" · ")}
                        </div>
                      ) : null}
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => removeLine(line)}
                      title="Remove"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <ExportModal
        vendor={exportVendor}
        lines={merged}
        onClose={() => setExportVendor(null)}
      />
    </div>
  );
}
