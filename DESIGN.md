# TrendHustler — DESIGN.md

Register: **brand** (this is a characterful showpiece — the design IS part of the product).

## Concept
The back-alley exchange for AI trends. GTA loading-screen poster art meets a stock-exchange terminal meets a street dealer. Looks hand-crafted and premium, never AI-generated. Glossy 3D/illustrated mascot on flat brutalist UI = the GTA loading-screen composition.

## Pattern picks (LUXE-DESIGN-PLAYBOOK)
- Style: `style.tactile_brutalism_enterprise` + `style.dark_first_oled`
- Layout: `layout.asymmetric_hero` → `layout.bento_dashboard_v1` → dense ticker board
- Motion: `motion.micro_interactions_pack` + `motion.kinetic_typography` (ticker tape)

## Color (strategy: committed; green is the ONE acid, gold is precious metal)
```
--bg-0   #07080A   /* OLED black, green-tinted; never pure #000 */
--bg-1   #0E1012   /* panels */
--bg-2   #15181A   /* hover / elevation via overlap, not shadow */
--green  #00E676   /* THE acid: BUY, prices, signal, accents */
--green-dim #0A3D24
--gold   #D4AF37   /* precious metal: logo, $ pendant, frames, luxe edges */
--gold-hi #FFF0B0
--red    #FF3B3B   /* semantic: DUMP / down */
--magenta #FF2E97  /* GTA neon micro-accent, <=3 uses */
--ink-0  #F4F6F4  --ink-1 rgba(244,246,244,.70)  --ink-2 rgba(244,246,244,.45)  --ink-3 rgba(244,246,244,.22)
--border rgba(212,175,55,.22)  /* gold hairline */
```
Anti-slop guards enforced: one acid color (green); gold is material not a 2nd gradient; NO gradient-clip text (gold chrome only on logo/hero via layered bevel); tinted neutrals, never pure #000/#fff; NO glassmorphism; NO drop-shadow depth.

## Type (Display x Mono — never two sans)
- Logo wordmark: **Pricedown** (GTA) -> fallback **Anton**
- Display / headings / tickers: **Anton** (heavy condensed), hero `clamp(72px,11vw,160px)`
- Data / body / UI: **JetBrains Mono** (exchange-terminal vibe)
- Dealer voice quotes only: **Permanent Marker**
- Type scale ratio: 1.333

## Shape / texture / motion
- Border-radius: `0` everywhere; `999px` only on status pills
- Shadows: none. Depth = overlap + 1px gold/green hairlines
- Texture: SVG grain ~5%, faint halftone/ben-day dots, scanline on ticker tape
- Easing: entrance `cubic-bezier(.22,1,.36,1)` 280-520ms; NO bounce/elastic
- `prefers-reduced-motion` disables all kinetic
- Sound: WebAudio synth (ka-ching BUY / siren DUMP / bell open), mute default OFF

## Voice (street dealer, English only)
STRONG_BUY "Cop it NOW, streets don't know yet." · BUY "Get in before the normies." · HOLD "Peakin'. Ride it, watch ya back." · SELL "Washed. Everybody postin' this." · RUG "Dead on arrival. Don't get caught holdin'."
