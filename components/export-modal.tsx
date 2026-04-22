"use client";

import { ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/components/ui/toast";
import {
  groupByCategory,
  roundQuantity,
  type MergedLine,
} from "@/lib/shopping-merge";
import { INGREDIENT_CATEGORIES } from "@/lib/types";

type Vendor = "walmart" | "instacart";

const vendorLabels: Record<Vendor, string> = {
  walmart: "Walmart",
  instacart: "Instacart",
};

const deepLinks: Record<Vendor, string> = {
  walmart: "https://www.walmart.com/cart",
  instacart: "https://www.instacart.com/store",
};

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

export function ExportModal({
  vendor,
  lines,
  onClose,
}: {
  vendor: Vendor | null;
  lines: MergedLine[];
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [opened, setOpened] = useState(false);

  const unchecked = useMemo(
    () => lines.filter((l) => !l.allChecked),
    [lines]
  );
  const groups = useMemo(() => groupByCategory(unchecked), [unchecked]);

  useEffect(() => {
    if (!vendor) setOpened(false);
  }, [vendor]);

  if (!vendor) return null;

  const itemCount = unchecked.length;
  const label = vendorLabels[vendor];
  const deepLink = deepLinks[vendor];

  const handleOpen = async () => {
    try {
      const res = await fetch("/api/shopping-list/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vendor }),
      });
      const data = await res.json();
      setOpened(true);
      window.open(data.deepLink ?? deepLink, "_blank", "noopener,noreferrer");
      toast({
        variant: "success",
        title: `Sent ${data.itemCount ?? itemCount} items to ${label}`,
        description: `${label} opened in a new tab.`,
      });
    } catch {
      window.open(deepLink, "_blank", "noopener,noreferrer");
    }
  };

  const copyText = async () => {
    const text = INGREDIENT_CATEGORIES.flatMap((cat) => {
      const inCat = groups[cat];
      if (!inCat || inCat.length === 0) return [];
      return [
        `# ${categoryLabels[cat]}`,
        ...inCat.map(
          (l) => `- ${roundQuantity(l.totalQuantity)} ${l.unit} ${l.name}`
        ),
        "",
      ];
    }).join("\n");
    try {
      await navigator.clipboard.writeText(text);
      toast({ variant: "success", title: "Copied to clipboard" });
    } catch {
      toast({ variant: "destructive", title: "Clipboard unavailable" });
    }
  };

  return (
    <Dialog open={true} onOpenChange={(o) => (!o ? onClose() : null)}>
      <DialogContent className="max-w-lg max-h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {opened ? "Sent to" : "Export to"} {label}
          </DialogTitle>
          <DialogDescription>
            {itemCount} item{itemCount === 1 ? "" : "s"} · This demo opens{" "}
            {label} in a new tab without automatically populating a real cart.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-3 text-sm">
          {INGREDIENT_CATEGORIES.map((cat) => {
            const inCat = groups[cat];
            if (!inCat || inCat.length === 0) return null;
            return (
              <div key={cat}>
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {categoryLabels[cat]}
                </div>
                <ul className="mt-1 space-y-0.5 pl-4 list-disc marker:text-muted-foreground">
                  {inCat.map((l) => (
                    <li key={l.key}>
                      <span className="tabular-nums">
                        {roundQuantity(l.totalQuantity)} {l.unit}
                      </span>{" "}
                      {l.name}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
          {unchecked.length === 0 ? (
            <p className="text-xs text-muted-foreground">
              Nothing unchecked to export.
            </p>
          ) : null}
        </div>

        <DialogFooter className="gap-2 sm:justify-end">
          <Button variant="outline" onClick={copyText} disabled={itemCount === 0}>
            Copy as text
          </Button>
          <Button onClick={handleOpen} disabled={itemCount === 0}>
            <ExternalLink className="h-4 w-4" />
            Open {label}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
