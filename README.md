# Mission Pet — Recipe App Demo

A fullstack Next.js 15 demo: mock auth, household-based invites, personalized preferences, LLM-generated recipes with allergen/diet warnings, filter + sort, and a mocked Walmart/Instacart shopping list export.

## Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript (strict)
- **UI:** Tailwind CSS + shadcn-style primitives + lucide-react
- **AI:** Vercel AI SDK with `@ai-sdk/openai` (`gpt-4o-mini`) + Zod-validated output
- **State (URL):** [nuqs](https://nuqs.dev) for filter URL sync
- **Persistence:** JSON files under `data/` (copied from `data/seed/` into `data/.runtime/` on first access)
- **Auth:** Mocked — pick a demo user, session is an httpOnly `demo_user_id` cookie
- **Tests:** Vitest smoke tests for `lib/match`, `lib/preferences`, `lib/shopping-merge`

## Getting started

```bash
npm install
npm run dev
```

Then open http://localhost:3000.

### Optional: real LLM recipe generation

```bash
cp .env.example .env.local
# then edit .env.local and set OPENAI_API_KEY=sk-...
```

Without a key the "Generate new recipe" button falls back to cloning a random
seed recipe tagged `[Mock]`, so the demo works completely offline.

## Demo walkthrough

1. **Sign in as Alice Smith** (admin of the Smith Family household).
2. Open **Recipes** — you'll see 20 seeded recipes, already annotated with:
   - a red "Contains: peanuts" badge on recipes that trigger Alice's allergy,
   - a green "Matches your prefs" badge on Italian/Mediterranean recipes.
3. Tweak **Filter bar**: cuisine chips, max-time slider, diet chips, sort
   selector, and "Hide allergy warnings" toggle — all URL-synced via nuqs.
4. Click **Generate new recipe**. With `OPENAI_API_KEY` set, a real LLM
   recipe is returned via `generateObject` + Zod schema and saved to
   `data/.runtime/recipes.json`. Without a key, a mock clone is added.
5. Click a recipe card, then **Add ingredients to shopping list**.
6. Open **Shopping list** — ingredients are merged by normalized name + unit
   and grouped by category.
7. Click **Export to Walmart** (or Instacart): see a formatted preview, then
   open the vendor site in a new tab (no real cart populating — this is
   the honest mock, see plan notes).
8. Visit **Household** → **Create invite** to generate a share link. Open
   the link in an incognito window and sign in as Bob to accept; he moves
   into the Smith Family.
9. Try the same flow as **Carol Lee** (admin of Lee Household, vegetarian,
   shellfish + sesame allergies) to see a completely different warning
   surface on the same recipe set.

## Data model

See `lib/types.ts` for the authoritative shapes. Preference merging lives
in `lib/preferences.ts`:

- **Allergies** are the **union** of household and personal (safety first).
- **Diets** and **cuisine likes/dislikes** are **personal overrides** — if
  personal is non-empty it fully replaces the household value.

Allergen flagging is belt-and-suspenders:

- LLM output must declare `allergens[]` in its schema, and
- `lib/allergen-detect.ts` scans ingredient names against a keyword map.

Both sources are unioned into `detectedAllergens` before matching against
user preferences in `lib/match.ts`.

## Scripts

```bash
npm run dev      # next dev
npm run build    # next build
npm run start    # next start
npm test         # vitest run
```

## Folder structure

```
app/
  (auth)/login          Demo user picker
  (app)/                Authed layout (requires cookie)
    recipes             Grid + filters + generate
    recipes/[id]        Recipe detail
    shopping-list       Merged, grouped, exportable
    preferences         Personal preferences
    household           Members, invites, household prefs
  invite/[token]        Accept invite flow
  api/                  Route handlers
components/             UI building blocks + shadcn primitives in ui/
lib/
  store/                JSON file store (auto-copies seed into .runtime)
  ai/                   Zod recipe schema + generateObject wrapper
  auth.ts               getCurrentUser / requireUser / requireAdmin
  preferences.ts        Effective-prefs merger
  match.ts              Recipe <-> prefs scoring + warnings
  allergen-detect.ts    Keyword scan
  shopping-merge.ts     Merge + group shopping list items
  recipe-query.ts       Filter + sort
data/
  seed/                 Committed initial users, households, recipes
  .runtime/             Gitignored, mutable; auto-created on first read
tests/                  Vitest smoke tests
```

## Out of scope

Real auth, email, real partner carts, nutrition macros, meal planning.

This is a demo — see `.cursor/plans/mission-pet-recipe-app_7f521ed7.plan.md`
for the plan that was executed.
