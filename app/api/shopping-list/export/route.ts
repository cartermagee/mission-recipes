import { NextResponse } from "next/server";
import { z } from "zod";

import { requireUser } from "@/lib/auth";
import {
  groupByCategory,
  mergeByNameAndUnit,
  roundQuantity,
} from "@/lib/shopping-merge";
import { listShoppingItems } from "@/lib/store/shopping-list";

const schema = z.object({ vendor: z.enum(["walmart", "instacart"]) });

const deepLinks: Record<"walmart" | "instacart", string> = {
  walmart: "https://www.walmart.com/cart",
  instacart: "https://www.instacart.com/store",
};

const vendorLabels: Record<"walmart" | "instacart", string> = {
  walmart: "Walmart",
  instacart: "Instacart",
};

export async function POST(req: Request) {
  const user = await requireUser();
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const items = await listShoppingItems(user.id);
  const merged = mergeByNameAndUnit(items).filter((l) => !l.allChecked);
  const grouped = groupByCategory(merged);

  const sections = Object.entries(grouped).map(([category, lines]) => ({
    category,
    lines: lines.map((l) => ({
      name: l.name,
      unit: l.unit,
      quantity: roundQuantity(l.totalQuantity),
      recipeTitles: l.recipeTitles,
    })),
  }));

  const textPreview = sections
    .map(
      (s) =>
        `# ${s.category.toUpperCase()}\n` +
        s.lines.map((l) => `- ${l.quantity} ${l.unit} ${l.name}`).join("\n")
    )
    .join("\n\n");

  return NextResponse.json({
    ok: true,
    vendor: parsed.data.vendor,
    vendorLabel: vendorLabels[parsed.data.vendor],
    deepLink: deepLinks[parsed.data.vendor],
    itemCount: merged.length,
    sections,
    textPreview,
  });
}
