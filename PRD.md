# SmartMeal AI — Product Requirements Document

**Version:** 1.0
**Stack:** MERN (MongoDB, Express, React, Node.js) + Google Gemini API
**Author:** Krish Kalia
**Purpose:** Take-home assignment submission — Emeritus

---

## 1. Overview

SmartMeal AI is a web application that generates personalized, budget-aware daily meal plans (breakfast, lunch, dinner). It factors in what the user already has in their pantry, suggests ingredient substitutions when items are missing or restricted, analyzes cost against a stated budget, produces a consolidated shopping list, and lays out a step-by-step cooking timeline so all three meals can be prepared efficiently in a single day.

The core "intelligence" (meal generation, substitutions, timeline sequencing) is powered by the Gemini API, constrained by a structured recipe/pantry dataset and deterministic budget math on the backend — so the app is useful and correct, not just a chat wrapper.

## 2. Problem Statement

People waste money and time because they:
- Don't know what to cook with what they already have.
- Buy duplicate ingredients across separate recipes.
- Don't track whether their grocery list fits their budget until checkout.
- Don't know what to substitute when they're missing one ingredient or have a dietary restriction.
- Struggle to time-manage cooking three meals in a day without idle gaps or clashing stove/oven use.

## 3. Goals

| Goal | Success Signal |
|---|---|
| Generate a full-day, 3-meal plan personalized to diet/allergies | Plan respects all hard constraints (allergies) 100% of the time |
| Minimize new grocery spend via pantry awareness | Shopping list excludes any item already in pantry above required quantity |
| Offer usable substitutions | Every "missing/restricted" ingredient has ≥1 valid substitute suggested |
| Give clear budget analysis | User sees estimated total cost vs. budget with over/under delta |
| Produce one consolidated shopping list | No duplicate line items; quantities aggregated across all 3 meals |
| Produce a realistic cooking timeline | Steps ordered so total active time is minimized and no two "hands-on" steps overlap for a single user |

## 4. Non-Goals (Out of Scope for v1)

- Real grocery store price API integration (v1 uses a local/simulated price dataset).
- Multi-day / weekly meal planning (v1 is single-day: breakfast, lunch, dinner).
- Real payment or grocery ordering integration.
- Multi-user households with per-person meals (v1 assumes one plan for the household as a unit, with a "servings" input).
- Native mobile app (v1 is responsive web only).

## 5. User Personas

**Priya, 29, working professional** — Wants quick, healthy dinners on a budget, hates food waste, has a semi-stocked pantry.

**Rahul, 35, parent of two** — Cooks for a family of 4, vegetarian household, needs to plan meals that stay within a weekly grocery budget.

**Alex, 24, student** — Very tight budget, minimal pantry, wants the cheapest viable plan and doesn't mind eating simply.

## 6. Core Features (Detailed)

### 6.1 User Profile & Preferences Input
**Description:** A form where the user provides the inputs needed to personalize the plan.

**Fields:**
- Household size / servings (integer, default 2)
- Dietary preference (Vegetarian / Vegan / Non-Vegetarian / Eggetarian)
- Allergies / exclusions (multi-select + free text: e.g., peanuts, gluten, dairy, shellfish)
- Cuisine preference (Indian, Continental, Asian, Mexican, Mixed/No preference)
- Daily grocery budget (currency amount, e.g., ₹500 / $10)
- Cooking time available (Quick <30 min/meal, Standard, Elaborate)
- Pantry items on hand (multi-entry: ingredient name + quantity + unit — e.g., "Rice — 2 kg", "Onion — 3 pcs")

**Behavior:**
- Allergies are **hard constraints** — no recipe or substitution may ever include an allergen.
- Diet preference is a **hard constraint**.
- Budget and cooking time are **soft constraints** used to rank/select among valid recipes.
- Pantry list can be added via manual rows, with an "add another item" control, and edited/removed inline.

**Edge cases:**
- Empty pantry → treated as zero on-hand inventory; all ingredients go to shopping list.
- Conflicting inputs (e.g., Vegan diet + dairy pantry item) → pantry item is simply not matched against any recipe requiring dairy; no error, just unused pantry item flagged in UI ("not used in today's plan").
- No budget entered → budget analysis section is skipped/hidden, shopping list still generated with total cost shown as informational only.

### 6.2 Meal Plan Generation (Breakfast / Lunch / Dinner)
**Description:** Given the profile, the system selects or generates one recipe per meal slot for the day.

**Logic:**
1. Filter the recipe dataset by hard constraints (diet, allergies).
2. Score remaining candidates by: pantry overlap (higher = more pantry ingredients reused), cost estimate vs. remaining budget, cuisine preference match, and cook-time fit.
3. Send the filtered/scored candidate shortlist + user profile to Gemini with a structured prompt asking it to pick the best breakfast/lunch/dinner combination and explain why in 1–2 lines each, returning strict JSON.
4. Backend validates the JSON response against the known recipe IDs (never trusts free-form model output for structured fields) before rendering.

**Output per meal:** Recipe name, short description, servings, prep + cook time, macro/cost summary, "why this was picked" rationale line.

**Edge cases:**
- No recipe satisfies all hard constraints → user is shown a clear message ("No matching recipes for these restrictions — try relaxing X") rather than a silent fallback.
- Gemini returns malformed/unschema'd JSON → backend retries once with a stricter prompt, then falls back to the top-scored candidate from step 2 (deterministic, non-AI fallback) so the app never hard-fails.

### 6.3 Pantry-Aware Grocery Optimization
**Description:** Before building the shopping list, the system nets out what the user already has.

**Logic:**
- For each ingredient required across all 3 recipes, sum the required quantity.
- Subtract quantity already in pantry (unit-normalized, e.g., grams vs kg).
- If pantry quantity ≥ required → ingredient excluded from shopping list entirely, shown in a separate "Using from your pantry" list.
- If pantry quantity < required → only the **deficit** is added to the shopping list.

**Edge cases:**
- Unit mismatch (pantry has "2 cups flour", recipe needs "300g flour") → normalize via a static unit-conversion table; if conversion isn't possible for that ingredient, treat as non-matching and log a warning shown subtly in UI ("couldn't auto-match units for Flour — verify manually").

### 6.4 Ingredient Substitution Engine
**Description:** For any ingredient that's either missing from pantry+affordable-to-buy, or conflicts with an allergy/diet, suggest a valid swap.

**Logic:**
- Maintain a static substitution map (ingredient → list of {substitute, ratio, notes}) as seed data.
- Filter candidate substitutes by the user's diet/allergy constraints.
- If a direct match exists in the static map, use it (fast, deterministic, free).
- If no static match exists, call Gemini with the ingredient + recipe context + constraints, asking for 1–2 safe substitutes with a conversion ratio, returned as JSON.
- Every AI-suggested substitute is re-validated against the allergy/diet exclusion list before being shown — AI output is never trusted blindly for a hard constraint.

**Output:** Ingredient → Substitute, conversion ratio (e.g., "1:1", "use ¾ the amount"), one-line usage note.

**Edge cases:**
- No safe substitute exists at all → ingredient is flagged "no safe substitute found, consider omitting" rather than showing a hallucinated option.

### 6.5 Budget Analysis
**Description:** Shows the user whether their day of meals fits their stated budget.

**Logic:**
- Sum estimated cost of all shopping-list items (using the local price dataset) — this is deterministic backend math, not AI-generated, since a monetary figure must be reliable.
- Compare to `dailyBudget` input.
- Display: Total estimated cost, Budget, Difference (over/under), and a per-meal cost breakdown.
- If over budget, highlight the 1–2 most expensive line items and (optionally) suggest a cheaper substitute for them using the substitution engine.

**Edge cases:**
- Item not in price dataset → priced at a category-average fallback and flagged as "estimated" in the UI.

### 6.6 Shopping List Generation
**Description:** One clean, consolidated list of everything that needs to be bought.

**Logic:**
- Aggregate ingredient deficits (post pantry-netting) across all 3 recipes.
- Merge duplicate ingredients (e.g., onions needed in 2 recipes → single combined line).
- Group by grocery category (Produce, Dairy, Grains, Spices, Protein, Other) for easier in-store use.
- Each line shows: item, quantity needed, estimated price, and which meal(s) it's used in.

**Edge cases:**
- Ingredient appears with incompatible units across recipes → normalize to a common unit before merging; if not possible, list separately with a note.

### 6.7 Cooking Timeline (Full Day)
**Description:** A single ordered timeline that sequences prep and cook steps across all three meals so the user can execute the day efficiently — not three separate, disconnected recipe cards.

**Logic:**
- Extract steps (with type: prep/active vs. passive/wait, and duration) from all 3 recipes.
- Backend builds a scheduling model: passive steps (e.g., "marinate 20 min", "rice cooker running") can overlap with active steps of another meal; two active/hands-on steps cannot overlap.
- Gemini is used to produce the natural-language ordering and step phrasing (e.g., "While the rice cooks, start chopping vegetables for lunch"), but the underlying overlap/conflict rules are enforced deterministically in code, not left to the model.
- Output is a single chronological list, anchored to a user-chosen start time, with each step showing: time, meal tag (B/L/D), instruction, and duration.

**Edge cases:**
- Total active time exceeds a reasonable single-day cooking window → user is warned ("this plan needs ~3.5 hrs of active cooking time") so they can adjust cooking-time preference and regenerate.

## 7. User Flow

1. Landing page → "Get Started"
2. Profile & Preferences form (6.1) → Submit
3. Loading state (Gemini + backend processing) with a short animated status ("Analyzing pantry…", "Finding recipes…", "Optimizing budget…")
4. Results Dashboard, tabbed/sectioned:
   - Meal Plan (6.2)
   - Budget Analysis (6.5)
   - Shopping List (6.6, with pantry-excluded items shown separately)
   - Substitutions (6.4, inline on each recipe + a consolidated view)
   - Cooking Timeline (6.7)
5. "Regenerate" option (re-roll meal plan with same constraints) and "Edit preferences" (back to step 2, preserving inputs)

## 8. Technical Architecture

**Frontend:** React (Vite), React Router, Context API or Redux Toolkit for state, Axios for API calls, Framer Motion for animation (see `design.md`).

**Backend:** Node.js + Express, REST API, Mongoose ODM.

**Database (MongoDB):**
- `recipes` — seeded recipe dataset (id, name, mealType, diet tags, cuisine, ingredients[{name, qty, unit}], steps[{text, duration, type}], allergens[])
- `ingredients` — canonical ingredient list with unit-conversion factors and average price
- `substitutions` — static substitution map
- `users` (optional, if auth is included) — saved profiles/history
- `plans` — generated plan history per session/user (recipe refs, shopping list, cost snapshot, timestamp)

**AI Layer:** Google Gemini API (`gemini-2.5-flash` or similar), called server-side only (API key never exposed to client). All Gemini calls use structured/JSON-mode prompting with schema validation on response; deterministic fallback logic on failure (see 6.2–6.4, 6.7).

**API Endpoints (indicative):**
- `POST /api/profile` — save/validate user profile & pantry
- `POST /api/plan/generate` — run full pipeline (filter → score → Gemini → validate) → returns meal plan
- `POST /api/plan/:id/substitutes` — get substitutes for a specific ingredient
- `GET /api/plan/:id/shopping-list`
- `GET /api/plan/:id/budget`
- `GET /api/plan/:id/timeline`
- `POST /api/plan/:id/regenerate`

## 9. Assumptions

- Prices are simulated via a static local dataset (no live grocery API), clearly labeled as "estimated" in UI and README.
- Single-day planning only; no persistence of multi-day history required for v1 (though schema supports it).
- One household-level plan, not per-individual-member plans.
- English-only UI for v1.
- Gemini is used for personalization/ranking/phrasing, never for hard-constraint enforcement (allergies, diet) — those are always code-enforced.

## 10. Edge Cases Summary (Cross-Cutting)

- No internet/Gemini API failure → deterministic fallback path for meal selection and substitutions so the app degrades gracefully instead of breaking.
- Extremely low budget with no viable recipe combination → explicit "budget too low for available recipes, suggest raising to ₹X" message instead of forcing a plan.
- Pantry item names that don't exactly match recipe ingredient names (e.g., "tomato" vs "tomatoes") → fuzzy matching (case-insensitive, singular/plural normalization) before falling back to "no match."

## 11. Success Metrics (for this assignment's self-evaluation)

- 100% of hard constraints (allergy/diet) respected in generated output, tested against seed edge-case profiles.
- Shopping list has zero duplicate line items in test runs.
- Budget delta is mathematically correct against the seed price dataset (verifiable by manual calculation).
- Full user flow (profile → dashboard with all 5 outputs) completes without manual intervention on seed data.

## 12. Milestones (Suggested Build Order)

1. Data modeling + seed dataset (recipes, ingredients, substitutions, prices)
2. Backend: pantry-netting + budget math + shopping list logic (pure deterministic code, fully testable without AI)
3. Backend: Gemini integration for meal selection + substitutions + timeline phrasing, with schema validation & fallback
4. Frontend: profile form → dashboard, wired to backend
5. Design pass: animations, polish (see `design.md`)
6. README, deployment, demo data
