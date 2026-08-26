<design-system>

# TaskFlow Playful Geometric Design System

## Product direction

TaskFlow uses a **Playful Geometric** visual language: friendly, tactile, energetic, and clear. The governing idea is **Stable Grid, Wild Decoration**. Workflows, forms, tables, and task data stay structured and readable while circles, stars, dots, stripes, and asymmetric shapes give the product warmth and momentum.

The system borrows the optimism of Memphis design without its visual chaos. Decoration must frame content, never compete with it.

## Core principles

- **Readable first:** content lives on stable grids and high-contrast surfaces.
- **Tactile interaction:** buttons and cards use thick borders and hard offset shadows.
- **Color with rhythm:** violet leads; pink, amber, and mint rotate through supporting moments.
- **Shape reinforces meaning:** status always includes text or an icon, never color alone.
- **Joy in moderation:** each viewport gets a few intentional decorative gestures, not a confetti storm.

## Tokens

### Color

~~~
background:       #FFFDF5
surface/card:     #FFFFFF
foreground:       #1E293B
foregroundMuted:  #64748B
muted:            #F1F5F9
border:           #E2E8F0
borderStrong:     #CBD5E1
accent:           #8B5CF6
accentMuted:      #F3E8FF
secondary:        #F472B6
tertiary:         #FBBF24
quaternary:       #34D399
success:          #10B981
warning:          #F59E0B
danger:           #F43F5E
~~~

Violet owns primary actions and selected states. Pink, amber, and mint are supporting colors for decoration, feature identities, and status accents. Avoid placing more than two saturated fills next to each other unless one is a small decorative shape.

### Typography

- **Headings:** `Outfit`, system-ui, sans-serif; 700–800 weight.
- **Body/UI:** `Plus Jakarta Sans`, system-ui, sans-serif; 400–600 weight.
- Headings are compact, geometric, and slightly tight. Body copy gets generous line-height.

### Radius and borders

~~~
radius-sm:   8px
radius-md:   16px
radius-lg:   24px
radius-full: 9999px
border:      2px solid #1E293B for interactive stickers
~~~

Large decorative surfaces may use asymmetric blob radii. Functional controls stay predictable.

### Shadows

~~~
pop:        4px 4px 0 #1E293B
pop-hover:  6px 6px 0 #1E293B
pop-active: 2px 2px 0 #1E293B
soft-pop:   6px 6px 0 #E2E8F0
pink-pop:   8px 8px 0 #F472B6
~~~

Shadows are hard and unblurred. They communicate lift and press state.

## Components

### Buttons

Primary buttons are violet pills with a 2px dark border and hard shadow. Hover moves them up-left and expands the shadow; active moves them down-right and shrinks it. Secondary buttons are white/transparent pills with the same dark border and fill amber on hover. All primary controls are at least 48px tall.

### Cards

Cards are white sticker surfaces with a 2px slate border, 16–24px radius, and a hard offset shadow. Interactive cards may rotate up to one degree and scale to 1.01–1.02 on hover. Important icons sit in colored circles that overlap or visually anchor the card edge.

### Inputs

Inputs use white fill, 2px slate-300 borders, 16px radius, and uppercase bold labels. Focus changes the border to violet and adds a 4px violet hard shadow. Errors use both danger color and a text/icon explanation.

### Navigation

The authenticated shell is a clean cream canvas with a white sticker sidebar. Active links are dark or violet pills with visible icon containers. Mobile navigation uses a full-height drawer and preserves 48px tap targets.

### Status

Status chips combine a written label with a distinct shape/icon. Pending uses amber, in-progress uses violet/pink, completed uses mint. Priority remains visibly named.

## Layout patterns

### Marketing hero

Use a 6/6 split: message and actions on the left, a tactile product preview on the right. A large amber circle supports the headline; dots and geometric shapes frame the preview. Content stays within `max-w-6xl` and stacks cleanly on mobile.

### Features

Use a three-column sticker-card grid. Alternate violet, pink, and amber/mint identities. A dashed path may connect cards on desktop but disappears on mobile.

### Dashboard

Use a structured board with colorful stat stickers and strong visual hierarchy. Task columns remain stable and scannable. Decoration belongs around headers and empty states, not behind task content.

## Motion

- Default transition: `300ms cubic-bezier(0.34, 1.56, 0.64, 1)`.
- Entrances pop from `scale(.94)` and a short vertical offset.
- Icons may wiggle on hover.
- Buttons use physical lift/press movement.
- Never animate core layout so aggressively that reading or dragging becomes difficult.
- Under `prefers-reduced-motion`, remove transforms, looping motion, and bounce.

## Responsive and accessibility rules

- Stack major grids below the large breakpoint.
- Reduce hard shadows to 2px on narrow screens.
- Hide nonessential floating decoration when it could overlap content.
- Keep touch targets at least 44×44px, preferably 48px.
- Preserve visible keyboard focus with a dark outline and violet hard shadow.
- Maintain strong text contrast and pair every color-coded state with a label or icon.

</design-system>
