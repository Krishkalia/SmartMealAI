---
name: SmartMeal AI
colors:
  surface: '#FFFFFF'
  surface-dim: '#e2d8d0'
  surface-bright: '#fff8f3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fcf2e9'
  surface-container: '#f6ece4'
  surface-container-high: '#f0e7de'
  surface-container-highest: '#eae1d8'
  on-surface: '#1f1b16'
  on-surface-variant: '#59413b'
  inverse-surface: '#34302a'
  inverse-on-surface: '#f9efe6'
  outline: '#8c7169'
  outline-variant: '#e0bfb7'
  surface-tint: '#ab350f'
  primary: '#9f2c05'
  on-primary: '#ffffff'
  primary-container: '#c1441e'
  on-primary-container: '#ffeeea'
  inverse-primary: '#ffb5a0'
  secondary: '#506355'
  on-secondary: '#ffffff'
  secondary-container: '#d0e5d4'
  on-secondary-container: '#54675a'
  tertiary: '#005a90'
  on-tertiary: '#ffffff'
  tertiary-container: '#0073b6'
  on-tertiary-container: '#ebf3ff'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbd1'
  primary-fixed-dim: '#ffb5a0'
  on-primary-fixed: '#3b0900'
  on-primary-fixed-variant: '#872100'
  secondary-fixed: '#d3e8d7'
  secondary-fixed-dim: '#b7ccbb'
  on-secondary-fixed: '#0e1f15'
  on-secondary-fixed-variant: '#394b3e'
  tertiary-fixed: '#cfe5ff'
  tertiary-fixed-dim: '#98cbff'
  on-tertiary-fixed: '#001d33'
  on-tertiary-fixed-variant: '#004a78'
  background: '#FBF7F0'
  on-background: '#1f1b16'
  surface-variant: '#eae1d8'
  surface-alt: '#F3ECE0'
  text-secondary: '#6B6259'
  success: '#4C7A5E'
  warning: '#D98E2B'
  danger: '#B4432E'
  border: '#E5DDD0'
  primary-hover: '#A63715'
typography:
  hero:
    fontFamily: Newsreader
    fontSize: 64px
    fontWeight: '600'
    lineHeight: '1.1'
  hero-mobile:
    fontFamily: Newsreader
    fontSize: 40px
    fontWeight: '600'
    lineHeight: '1.2'
  h1:
    fontFamily: Newsreader
    fontSize: 32px
    fontWeight: '600'
    lineHeight: '1.3'
  h2:
    fontFamily: Newsreader
    fontSize: 24px
    fontWeight: '600'
    lineHeight: '1.4'
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: '1.6'
  body-sm:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
  label-caps:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: '1.0'
    letterSpacing: 0.05em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  gutter: 24px
  margin: 32px
  max-width: 1200px
  section-gap-sm: 64px
  section-gap-lg: 96px
---

# SmartMeal AI — Visual Design System
Aesthetic direction: Modern, clean, warm — food-tech feel without being cliché-green-wellness-app. Confident typography, soft depth, purposeful motion.

## 1. Design Principles
* **Clarity over decoration** — every animation should communicate state (loading, success, transition), not just look nice.
* **Warmth without cliché** — avoid the generic "health app green," lean into an editorial food-magazine feel.
* **Data made scannable** — budget numbers, pantry matches, and timelines are the product; typography hierarchy must make them instantly readable.

## 2. Color Palette
* `--color-bg`: #FBF7F0 /* warm off-white */
* `--color-surface`: #FFFFFF
* `--color-surface-alt`: #F3ECE0
* `--color-primary`: #C1441E /* burnt terracotta */
* `--color-primary-hover`: #A63715
* `--color-secondary`: #2E4034 /* deep forest */
* `--color-text-primary`: #1F1B16
* `--color-text-secondary`: #6B6259
* `--color-success`: #4C7A5E /* under-budget */
* `--color-warning`: #D98E2B /* near-budget */
* `--color-danger`: #B4432E /* over-budget */
* `--color-border`: #E5DDD0

## 3. Typography
* `--font-display`: 'Fraunces', serif;
* `--font-body`: 'Inter', sans-serif;
* `--text-hero`: clamp(2.5rem, 5vw, 4rem); font-weight: 600;
* `--text-h1`: 2rem; font-weight: 600;
* `--text-h2`: 1.5rem; font-weight: 600;
* `--text-body`: 1rem; font-weight: 400;
* `--text-small`: 0.875rem; font-weight: 400;

## 4. Spacing & Layout
* 8px base unit grid.
* Max content width: 1200px, centered.
* Card-based layout for meals, generous padding (24–32px), rounded corners at 16px.
* Section spacing: 64–96px vertical rhythm.

## 5. Elevation & Depth
* `--shadow-sm`: 0 1px 2px rgba(31,27,22,0.06);
* `--shadow-md`: 0 4px 12px rgba(31,27,22,0.08);
* `--shadow-lg`: 0 12px 32px rgba(31,27,22,0.12);

## 6. Component Styles
* **Cards**: White surface, 1px border, --shadow-sm, --shadow-md on hover.
* **Buttons**: Primary = filled terracotta, pill-shaped. Secondary = outline.
* **Tags/Chips**: Rounded-full, --color-surface-alt bg.
* **Budget Indicator**: Horizontal progress bar, color shifts success -> warning -> danger.
* **Timeline**: Vertical line with time-stamped nodes.
