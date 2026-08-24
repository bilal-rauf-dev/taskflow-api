<design-system>

# Quiet Precision Design System

## Design Philosophy

**Quiet Precision** is built for products that need to be trusted, not just liked. It replaces "impressive" with **credible** — the sense that every decision was deliberate, tested, and refined, even when the person using it can't quite articulate why it feels that way.

The core concept is **"Calm Surface, Considered Depth."** At rest, the interface is restrained — near-monochrome, generously spaced, quiet. The sophistication doesn't live in decoration; it lives in what happens when something moves: a button responds with the weight of a real object, a list reflows instead of jumping, a number counts instead of appearing. Depth is revealed through interaction, not announced through visual noise.

### The Vibe

**Composed. Deliberate. Precise. Unhurried.**

It feels like a well-made instrument — a good watch, a car door closing with a solid, single click. Nothing about it asks for attention, but everything about it rewards a closer look.

### Visual Signatures

- **Near-Monochrome Base, One Signal Color**: The interface is built almost entirely from ink, graphite, and paper tones. Color is reserved for the accent and for meaning (status, priority) — never for decoration.
- **Whisper Borders, Layered Shadows**: Hairline 1px borders define structure; soft, multi-layer elevation shadows (never hard-offset) communicate hierarchy.
- **Typography Does the Talking**: A confident serif/sans pairing carries the visual weight that shapes and patterns carry in louder systems.
- **Motion With a Reason**: Every animation exists to explain a state change, a relationship, or cause-and-effect — never to decorate.
- **Earned Density**: Generous whitespace by default. Density only increases where content genuinely demands it (data tables, dense lists).

---

## Design Token System

### Colors (Light Mode)

A restrained, near-monochrome palette anchored by a single confident accent.

~~~
background: #FAFAF8       // Warm paper white — not stark white
surface: #FFFFFF          // Cards, panels, elevated content
foreground: #14171F       // Ink — not pure black, slightly warm
foregroundMuted: #5B6270  // Secondary text, captions, metadata
border: #E7E6E2           // Hairline structural border
borderStrong: #D8D7D2     // Input borders, slightly more present
accent: #2B4EFF           // Signal Blue — primary actions only
accentMuted: #EEF1FF      // Accent tint — badges, subtle highlight backgrounds
success: #1F9D6E          // Muted emerald — status only, not decorative
warning: #B9832A          // Muted bronze/amber — status only
danger: #C4433A           // Muted brick red — status/destructive only
~~~

**Usage Rule**: `accent` appears on primary actions and active/selected states only — if more than one element per view is competing for attention with color, dial it back. `success`/`warning`/`danger` communicate meaning (status, priority, validation) and should never be used decoratively. Everything else stays in the ink/graphite/paper range.

### Typography

**Display / Headings**: `"Fraunces", Georgia, serif`

- A warm, editorial serif with real optical presence. Reserved for H1–H3 and moments that need gravity — page titles, empty states, hero statements.
- **Weights**: Medium (500) for most headings, SemiBold (600) sparingly for the single most important heading on a page.

**Body / UI**: `"Inter", system-ui, sans-serif`

- Does the actual work — labels, body copy, buttons, table data. Chosen for legibility at small sizes over character.
- **Weights**: Regular (400) for body, Medium (500) for UI labels/buttons, SemiBold (600) reserved for emphasis only.

**Scale Ratio**: 1.2 (Minor Third) — tighter and more controlled than a typical marketing-site scale. Precision over drama.

### Radius & Border

~~~
radius-xs: 4px      // chips, small badges
radius-sm: 8px      // inputs, buttons
radius-md: 12px     // cards, dropdowns
radius-lg: 20px     // modals, large panels
radius-full: 9999px // avatars, status dots, pill badges only — not a default
border-width: 1px   // hairline by default
~~~

**Rule**: Radius increases with elevation, not the other way around. A resting card is `radius-md`; a modal floating above everything is `radius-lg`. Full-pill radius is reserved for genuinely circular/pill content, not applied everywhere as a "friendly" treatment.

### Shadows & Elevation

Soft, layered, physically-plausible elevation — light from one consistent source, never a hard offset.

~~~
shadow-xs:    0 1px 2px rgba(20, 23, 31, 0.04)
shadow-sm:    0 2px 8px rgba(20, 23, 31, 0.06), 0 1px 2px rgba(20, 23, 31, 0.04)
shadow-md:    0 8px 24px rgba(20, 23, 31, 0.08), 0 2px 6px rgba(20, 23, 31, 0.04)
shadow-lg:    0 24px 48px rgba(20, 23, 31, 0.12), 0 8px 16px rgba(20, 23, 31, 0.06)
shadow-focus: 0 0 0 3px rgba(43, 78, 255, 0.16)
~~~

Each level stacks two shadows — a tight one for contact, a soft one for ambient depth. That's what makes elevation read as physical rather than flat. No hard, blur-free shadows anywhere in this system.

### Motion Tokens

Motion is a first-class token category here, not an afterthought bolted onto components.

~~~
ease-standard:   cubic-bezier(0.4, 0, 0.2, 1)     // default, most transitions
ease-emphasized: cubic-bezier(0.16, 1, 0.3, 1)    // decisive entrances — the system's signature curve
ease-out:        cubic-bezier(0, 0, 0.2, 1)       // things arriving
ease-in:         cubic-bezier(0.4, 0, 1, 1)       // things leaving

duration-instant:    100ms   // press/tap feedback
duration-fast:       150ms   // hover states
duration-base:       250ms   // default UI transitions, dropdowns, small modals
duration-slow:       400ms   // page-level transitions, large modals
duration-deliberate: 600ms   // hero reveals, first-load moments — used rarely, on purpose
~~~

### Textures & Surface Detail

- **Grain**: A near-invisible noise texture (2–3% opacity) over large flat surface areas — adds tactility without adding visual noise. Skip it on anything text-heavy.
- **Hairline Grid**: A 1px structural grid used only where it's functional (under data tables, calendar grids) — never as sitewide decoration.
- **Cursor-Aware Highlight**: On large interactive surfaces (feature cards, hero panels), a very soft radial gradient can follow the pointer at low opacity (4–6%). A detail most people won't consciously notice — which is the point.

---

## Component Stylings

### Buttons

**Primary Button**:

~~~
- Bg: accent (#2B4EFF)
- Text: white, font-weight: 500 (Inter)
- Radius: radius-sm
- Border: none
- Shadow: shadow-xs at rest
- Hover: shadow-sm, background darkens ~6%, no scale change
- Active: shadow-xs, translateY(1px) — a real, physical press
- Transition: duration-fast, ease-standard
~~~

**Secondary Button**:

~~~
- Bg: transparent
- Text: foreground
- Border: 1px solid borderStrong
- Radius: radius-sm
- Shadow: none
- Hover: bg shifts to background (subtle), border shifts to foreground
~~~

**Ghost / Tertiary**:

~~~
- Bg: none, border: none
- Text: foregroundMuted, underline appears on hover only (absent at rest)
- Reserved for low-emphasis actions — "Cancel," "Learn more"
~~~

### Cards

~~~
- Bg: surface
- Border: 1px solid border
- Radius: radius-md
- Shadow: shadow-xs at rest
- Hover (only if interactive): shadow-md, translateY(-2px), duration-base, ease-emphasized
- Padding: generous — 24px minimum, 32px for primary content cards
- Icons inside cards: small radius-xs square badge in accentMuted — never floating loose, never overlapping the card border
~~~

### Inputs

~~~
- Bg: surface
- Border: 1px solid borderStrong
- Radius: radius-sm
- Text: foreground
- Focus: border → accent, shadow → shadow-focus, transition duration-fast ease-standard
- Label: medium weight, foregroundMuted, sits above the field. If floating, it animates from placeholder position to label position over duration-fast on focus — not an instant jump.
~~~

---

## Layout Strategy

### General

- **Container**: `max-w-6xl`, but content rarely needs the full width — let it breathe.
- **Spacing**: Strict 8pt grid. Every margin, padding, and gap is a multiple of 8px (4px for fine adjustments within a component).
- **Grid**: Asymmetric, intentional splits (60/40, 65/35) over reflexive 50/50 or centered-everything layouts.

### Unique Section Layouts

1. **Hero**:
~~~
- Text and a single, restrained visual — never a wall of floating cards.
- On load: headline and supporting text stagger in with a 60ms delay between them, translateY 12px → 0, ease-emphasized, duration-deliberate.
- No confetti, no busy background pattern — grain texture only.
~~~

2. **Feature / Content Grid**:
~~~
- 3-column grid, generous gutters.
- Cards reveal on scroll (IntersectionObserver, ~20% visible), staggered 60ms apart, one-time only — never replay on scroll-back.
- No connecting lines or decorative dividers between cards; whitespace does that job.
~~~

3. **Dashboard / Data Views**:
~~~
- Stat tiles use shadow-xs; no icon-in-circle gimmick — a small accentMuted badge square is enough.
- Numbers that update or first appear count up over duration-base using ease-out, rather than snapping to the final value.
- Lists/tables that reorder (drag-and-drop, sorting) use layout animation (spring, low stiffness ~300 / damping ~30) so surrounding items reflow smoothly instead of jumping.
~~~

---

## Effects & Animation

This is where the system does most of its work — treat it with the same rigor as color and type.

**Governing principle**: if you can't say what an animation is communicating — state change, hierarchy, spatial relationship, or cause → effect — don't add it.

- **Hover**: `ease-standard`, `duration-fast`. Shadow and color shift; scale changes are avoided or kept under 1.02 — nothing should visibly "grow."
- **Press / Active**: A 1px physical translate down + shadow flattening, `duration-instant`. This is the single most important detail in the system — it's what makes buttons feel real instead of flat.
- **Entrances**: Content arrives with `ease-emphasized` — opacity 0→1 and translateY 8–12px→0. Never scale-bounce, never overshoot.
- **Exits**: Faster than entrances (`duration-fast` vs `duration-base`) using `ease-in` — things should leave more abruptly than they arrive.
- **Stagger**: Lists and grids reveal children 40–60ms apart, in reading order. This single detail is most of what makes a page feel "considered" rather than "loaded."
- **Layout changes** (drag-and-drop, filtering, reordering): always animate the transition — items reflow into new positions, they never jump.
- **Success states**: A small, precise moment — an SVG checkmark that draws itself via stroke animation over ~300ms — rather than a burst or celebration animation. Sophistication celebrates quietly.
- **Loading**: Skeleton screens with a slow shimmer sweep (not a flat pulse) wherever the final content shape is predictable. Reserve spinners for genuinely unknown-duration waits.
- **Scroll**: Used sparingly, only to reveal, never to distract — one-shot reveals, at most one low-opacity parallax element per page. No scroll-jacking.
- **Reduced motion**: Every transform-based animation has a `prefers-reduced-motion` fallback that keeps the opacity fade but drops the translate/scale/spring. Respected everywhere, no exceptions — this system leans on motion enough that skipping this is a real accessibility gap, not a nice-to-have.

---

## Iconography

**Icon settings**:

- **Stroke Width**: `1.5px` — restrained, not chunky.
- **Style**: Regular weight, monochrome, inherits `currentColor`.
- **Color**: `foregroundMuted` at rest, `foreground` or `accent` on hover/active. Icons are almost never inside a colored circle — the one exception is small semantic status dots (success/warning/danger).
- **Motion**: Functional only — a refresh icon rotates while loading, a chevron rotates 180° on expand, a checkmark draws itself in on success. No decorative wiggle.

---

## Responsive Strategy

- **Mobile**:
- Reduce shadow levels by one step (e.g. `shadow-md` → `shadow-sm`) to keep the interface feeling light on smaller screens.
- Shorten durations by roughly 20% (e.g. `duration-base` 250ms → ~200ms) — motion should feel slightly snappier on mobile, not slower.
- Drop cursor-aware highlights and parallax entirely — they're pointer-only details.
- Maintain minimum 44×44px tap targets regardless of visual size.

---

## Accessibility & Best Practices

- **Contrast**: `foreground` on `background`/`surface` meets AAA; `foregroundMuted` is checked against AA minimum wherever it's used for body text, not just decorative captions.
- **Color**: Status and priority are never color-only — always paired with a label, icon, or text.
- **Motion**: `prefers-reduced-motion` is a hard requirement here, not a nice-to-have, given how central motion is to this system. Test the reduced-motion state as thoroughly as the full-motion state.
- **Focus**: `shadow-focus` plus a border shift to `accent` — visible against every surface color in the palette, never relying on outline-color alone.

</design-system>
