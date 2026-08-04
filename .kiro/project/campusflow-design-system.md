# CampusFlow Design System

## Brand

- Product: **CampusFlow**
- Tone: Academic, calm, precise — teal primary on cool slate surfaces
- Avoid: purple gradients, cream/terracotta serif tropes, glow-heavy dark UI

## Colour palette

| Token | Value | Use |
|-------|-------|-----|
| brand.50–900 | Teal scale | Primary actions, active nav |
| brand.500 | `#0D9488` | Primary button |
| canvas | `#F4F7F6` | App background |
| ink | `#0F172A` | Primary text |
| muted | `#64748B` | Secondary text |
| surface | `#FFFFFF` | Panels |
| success / warning / danger / info | green / amber / red / sky | Status |

## Typography

- **System typeface: Poppins** (Google Fonts) for headings and body
- Hierarchy via weight/size/tracking — not a second family
- Weights loaded: 400, 500, 600, 700
- Headings: 600–700, letter-spacing ≈ `-0.02em` to `-0.03em`
- Body: 400–500, 16px, line-height ≈ 1.55
- Fallbacks: `system-ui, sans-serif`

## Elevation & radius

- Panel: `1px` border `blackAlpha.100`, soft shadow `0 1px 2px rgba(15,23,42,.04), 0 8px 24px rgba(15,23,42,.06)`
- Radius: md 10px, lg 14px, xl 20px

## Spacing & layout

- App main: max content ≈ `1600px`, page padding 5–10 (md+), section gap 6–8
- Sidebar ≈ `288px`; denser tables inside panels
- Thin pages (profile, settings, notifications, reports) use full-width grids / multi-section surfaces — not narrow single cards

## Motion

| Pattern | Duration | Use |
|---------|----------|-----|
| Page enter | 220ms ease-out | Route content (AppLayout AnimatePresence) |
| Stagger children | 40–60ms delay | Stats / course cards |
| Hover lift | 150ms | Interactive panels |
| Auth panel | 280–320ms | Login/register entrance |

Respect `prefers-reduced-motion: reduce` (instant opacity only).

## Landing page

- Full-bleed hero (edge-to-edge visual plane); brand name is the dominant text signal
- First viewport budget: brand, one headline, one supporting sentence, **exactly two auth buttons** (Sign in / Create account), dominant visual — no stat strips or promo chips on the hero
- **Do not** repeat Sign in / Create account as buttons elsewhere on the landing (nav/footer/closing use text links for explore only)
- Below fold: one-purpose sections (how it works, roles, capabilities, explore); surfaces only when interaction needs a container
- Motion: hero fade/rise + light stagger on secondary sections; respect reduced-motion

## Marketing / explore chrome

- Shared header: logo → `/`, text links to Features / Roles / About
- Shared footer: explore text links; no auth button cluster
- Auth buttons live only on the landing hero (and on `/login` / `/register` form pages)

## Components

`AnimatedPage`, `Surface`, `StatTile`, `PageHeader`, `EmptyState`, `ErrorState`, `LoadingState`, `DataTableShell`, Status badges, App shell nav, MarketingLayout, Landing hero.

## Accessibility

Visible focus rings, labelled controls, status text + colour, skip link, `aria-busy` on loaders.
