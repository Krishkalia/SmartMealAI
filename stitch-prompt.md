# Stitch Prompt — SmartMeal AI

Paste this into Stitch along with the attached `design.md` file. Stitch reads design.md for the visual system (colors, type, spacing, motion) — this prompt gives it the product, screens, and flow.

---

## Prompt

I'm building **SmartMeal AI**, a MERN-stack web app (using Gemini API for AI generation) that creates a personalized full-day meal plan (breakfast, lunch, dinner), optimizes grocery cost using ingredients the user already has at home, suggests substitutions, analyzes the plan against a budget, generates a shopping list, and produces a step-by-step cooking timeline for the day.

The product should feel like a modern food-editorial app — warm, confident, a little premium — not a generic "wellness/health tracker" green app. Use the attached design.md as the exact visual system (colors, typography, spacing, shadows, motion). Follow it precisely rather than defaulting to generic Material/Tailwind styling.

Design the following screens as a connected flow, desktop-first with mobile responsive states:

### 1. Landing / Hero
A short, confident hero section introducing SmartMeal AI. Serif display headline (Fraunces), one-line subhead in Inter, single primary CTA button ("Plan My Day"). No clutter — this is a single-purpose tool, not a marketing site.

### 2. Onboarding / Input Form
A single clean form (can be one step or a light 2-step wizard) collecting:
- Dietary preference (single-select pill group: Vegetarian / Non-Vegetarian / Vegan / Keto / No Restriction)
- Allergies (multi-select chips + free text add)
- Daily budget (number input with currency)
- Household size (stepper input)
- Pantry items (tag/chip input — user types an item, hits enter, it becomes a removable chip; show a few as placeholder examples)

Primary CTA at the bottom: "Generate My Plan." Show a secondary hint text like "We'll use what's already in your kitchen first."

### 3. Loading / Generating State
A full-screen or modal loading state while the Gemini API call runs. Not a generic spinner — animated rotating short status lines (e.g. "Checking your pantry…", "Balancing your budget…", "Plating your day…") paired with a subtle pulsing icon or illustration. Should feel intentional and branded, not like a system loader.

### 4. Meal Plan View (main results screen)
Three meal cards in a row (Breakfast / Lunch / Dinner), stacking to single column on mobile. Each card shows:
- Dish name (serif, prominent)
- Short description
- Prep time + cook time (small icon + label)
- Ingredient list with a clear visual distinction between "already in your pantry" (subtle checkmark/muted tag) vs "need to buy" (normal state)
- Estimated cost for that meal
- A subtle "tap to expand" for full steps

Above the cards: a summary strip showing total estimated cost vs. budget (this links to the budget component below).

### 5. Budget Analysis Section
A horizontal progress/bar visualization showing amount spent vs. total budget, with a color state (on-budget / near-budget / over-budget per design.md's success/warning/danger colors). Below it, a per-meal cost breakdown (simple horizontal bar chart or stacked list, 3 meals). If over budget, show a small inline suggestion card ("Consider swapping X to save ~₹Y").

### 6. Substitutions Panel
A list/grid of ingredient substitution cards — each shows the original ingredient, an arrow or swap icon, the suggested substitute, and a one-line reason (e.g. "dairy-free alternative," "cheaper option"). Should feel like small, scannable cards, not a dense table.

### 7. Shopping List
A clean checklist grouped by category (Produce, Dairy, Grains, Spices, Protein, Other) with category subheadings. Each item shows name + aggregated quantity. Checkbox interaction with strike-through on check. Sticky total-cost summary bar at the bottom (especially important on mobile). Include a "Copy list" or "Export" button.

### 8. Cooking Timeline
A vertical timeline (single line with time-stamped nodes) merging all steps from all three meals into one ordered sequence across the day. Each node shows a timestamp, the action, and a small tag for which meal it belongs to (color-coded or labeled). Steps reveal sequentially as the user scrolls. On mobile, this collapses to a single-column vertical line — no alternating layout.

### 9. Empty / Error States
- Empty pantry state (encouraging copy, not an error — "No pantry items? We'll build your full shopping list.")
- Gemini API failure fallback banner (calm, non-alarming — "We hit a snag generating your plan, here's a great option we had ready.")

---

## Interaction & Motion Notes
Reference design.md's motion section directly:
- Meal cards stagger-fade in on load
- Budget numbers count up from 0
- Timeline steps reveal on scroll
- Buttons scale + lift shadow on hover
- Shopping list items strike-through + fade on check

## What NOT to do
- No generic green "wellness app" palette — use the terracotta/warm palette from design.md
- No stock spinner for loading — use the branded status-line loader described above
- No dense data tables — everything should read as cards/chips/lists, food-editorial in tone
- Don't invent new colors or fonts outside design.md

## Deliverables from Stitch
Generate high-fidelity screens for all 9 states above, desktop primary, with mobile variants for: Onboarding Form, Meal Plan View, Shopping List, and Cooking Timeline (these are the screens most used on-the-go).
