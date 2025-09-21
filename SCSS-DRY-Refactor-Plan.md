# SCSS DRY Refactor Plan

Goal
- Reduce duplication across SCSS modules by extracting common patterns into shared mixins while preserving the current visuals and behavior.

Scope
- Frontend styles only. No JSX or runtime logic changes.
- Keep visuals identical. Only refactor to reuse common mixins and utilities.

Summary of Findings
- Section headings: Multiple pages define `.sectionHeading` with similar margins.
- Link buttons: Modules use button mixins then manually remove underline via `text-decoration: none` on Links/anchors.
- Grids: Pages define responsive grid columns via repetitive media queries.
- Card patterns: Repeated patterns for card backgrounds, shadows, hover scale/box-shadows.
- Chips/Badges: Repeated inline-flex chip styles (esp. in Produits page).
- Base mixins already exist in `styles/_mixins.scss`, and variables in `styles/_variables.scss`—good foundation for consolidation.

Proposed Additions to styles/_mixins.scss
These mixins centralize common patterns so individual modules don’t need to redefine them.

1) Section heading
```scss
// Section heading utility
@mixin section-heading($mt: 1.5rem, $mb: 1rem, $fw: 700) {
  margin: $mt 0 $mb;
  font-weight: $fw;
}
```

2) Link reset (for Link/anchor treated as button)
```scss
// Reset link visuals when using button mixins on anchors/Links
@mixin link-reset {
  text-decoration: none;
  color: inherit;
}
```

3) Responsive grid columns
```scss
// Responsive grid columns generator
// Example: @include grid-cols(5, 1rem, 4, 3, 2, 1);
@mixin grid-cols(
  $desktop,
  $gap: 1rem,
  $cols-1200: null,
  $cols-992: null,
  $cols-768: null,
  $cols-480: 1
) {
  display: grid;
  grid-template-columns: repeat($desktop, 1fr);
  gap: $gap;

  @media (max-width: 1200px) {
    @if $cols-1200 {
      grid-template-columns: repeat($cols-1200, 1fr);
    }
  }
  @media (max-width: 992px) {
    @if $cols-992 {
      grid-template-columns: repeat($cols-992, 1fr);
    }
  }
  @media (max-width: 768px) {
    @if $cols-768 {
      grid-template-columns: repeat($cols-768, 1fr);
    }
  }
  @media (max-width: 480px) {
    @if $cols-480 {
      grid-template-columns: repeat($cols-480, 1fr);
    }
  }
}
```

4) Card base with hover animation
```scss
// Base card styling with subtle hover/scale/shadow
// Keeps current animation cues while consolidating styles
@mixin card-base(
  $bg: color.adjust($primary, $lightness: 30%),
  $padding: 1rem,
  $radius: $radius-md,
  $shadow: 0 1px 4px rgba(0,0,0,0.08)
) {
  background: $bg;
  padding: $padding;
  border-radius: $radius;
  box-shadow: $shadow;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15);
  }
}
```

5) Chip base (for badges/filters)
```scss
// Base chip/badge style for tag-like UI
@mixin chip-base {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  border-radius: $radius-sm;
  font-size: 0.85rem;
  font-weight: 500;
  transition: transform $transition-fast, box-shadow $transition-fast, background-color $transition-fast;
}
```

File-by-File Refactor Plan
All changes will only replace duplicated declarations with the mixins above. No visual changes expected.

1) frontend/src/pages/Accueil/Accueil.module.scss
- .sectionHeading: replace existing margin declarations with `@include section-heading();`
- .cta: keep existing `@include button-primary;` and add `@include link-reset;` to replace manual `text-decoration: none;`
- .retryBtn: keep `@include button-primary;`, add `@include link-reset;`

2) frontend/src/pages/Fermier/Fermier.module.scss
- .sectionHeading: replace with `@include section-heading();`
- .grid4: replace manual grid and media queries with `@include grid-cols(4, 1rem, 3, 2, 2, 1);`
- .backLink: keep `@include button-secondary;`, add `@include link-reset;` (remove manual `text-decoration: none;`)

3) frontend/src/pages/Produits/Produits.module.scss
- .sectionHeading: replace with `@include section-heading();`
- .grid: replace multi-breakpoint declarations with `@include grid-cols(5, 1rem, 4, 3, 2, 1);`
- .chip: add `@include chip-base;` and keep page-specific colors/active states.

4) frontend/src/pages/Nosfermiers/Nosfermiers.module.scss
- .sectionHeading: replace with `@include section-heading();`
- .grid: replace with `@include grid-cols(3, 1rem, 2, 2, 1, 1);`
- .producerCard: replace repeated hover/scale/shadow with `@include card-base();` then keep specific overrides already present (e.g., padding/spacing if different).

5) frontend/src/pages/NotFound/NotFound.module.scss
- .linkBtn and .linkBtnSecondary: keep button mixins (`button-primary`, `button-secondary`) and add `@include link-reset;` (remove `text-decoration: none;`)

6) frontend/src/components/ProducerShowcase/ProducerShowcase.module.scss (opportunistic)
- If product card and tags mirror patterns above:
  - Product card container: `@include card-base();`
  - Tag/chip styles: `@include chip-base;`
- Only apply if it preserves exact spacing/size rules. Otherwise, skip or partially adopt.

Out-of-Scope (No Change)
- Global utilities in `styles/main.scss` (e.g., `.btn-primary`, `.btn-secondary`, `.nav-link`) remain as-is to avoid JSX churn.
- Any mixin/variable renaming.

Commit Plan (refactoring/frontend)
- feat(styles): add shared mixins (section-heading, link-reset, grid-cols, card-base, chip-base)
- refactor(styles): DRY Accueil module (section heading + link reset)
- refactor(styles): DRY Fermier module (section heading + grid + link reset)
- refactor(styles): DRY Produits module (section heading + grid + chip-base)
- refactor(styles): DRY Nosfermiers module (section heading + grid + card-base)
- refactor(styles): DRY NotFound module (link reset for link buttons)
- refactor(styles): optional ProducerShowcase module (if parity holds)

Validation After Changes
- Visually compare before/after on:
  - Accueil: headings, CTA, retry button
  - Fermier: section heading, 4-col grid responsiveness, back link
  - Produits: headings, 5→1 col responsiveness, chips interactions
  - Nosfermiers: headings, 3→1 col responsiveness, card hovers
  - NotFound: link buttons styling without underlines
  - ProducerShowcase (if touched): card and tags
- Ensure no regression in hover/active/focus states and spacing.

Notes
- All mixins leverage existing variables in `_variables.scss`.
- No class names change. No React changes necessary.
