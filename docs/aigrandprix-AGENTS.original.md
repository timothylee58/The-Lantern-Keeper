# The Lantern Keeper: Hantu Codex

Hackathon build for AI Grand Prix Singapore. Judged on creativity, fun, polish. Hard deadline: Sunday 09:00 SGT. Prefer a finished short game over a broken long one.

## Story bible
A storm scatters the village's lanterns and story recordings. Ari helps eight neighbors prepare a gathering. Playful spirits carried some lost items into the forest. Ari becomes a field researcher: each Hantu Hunter expedition recovers clues, adds a folklore entry to the codex, and helps one neighbor finish preparing. The finale gathers everyone at the restored celebration.

Tone: warm, funny, gently spooky. Spirits are mischievous, never gory. Never fight; return, trade, or soothe.
Rule: regional folklore notes live in the Codex "Folklore Notes" tab and stay separate from the fictional encounters. Cite the tradition, avoid mocking religious practice, no religious items used as weapons.

## Art direction
- Paper-cut wayang kulit silhouettes, warm lantern glow, deep indigo background.
- Palette tokens in `src/styles/tokens.css`: indigo-950 #0b1026, ember #ff9a3c, gold #ffd36e, jade #3fb68b, paper #f4e9d2.
- All generated art uses the locked prompt in `docs/art-prompt.md`. Never mix styles.
- Fonts: display serif for story, rounded sans for UI.

## Stack
- Next.js App Router, TypeScript strict, Tailwind, shadcn/ui, Framer Motion (UI only)
- GSAP ScrollTrigger + Lenis for the opening cinematic
- Phaser 3 mounted in a client component for expeditions
- Zustand with persist (localStorage) for save data
- Howler for audio, mute toggle always visible
- Vitest for game logic, Playwright for the demo-path smoke test
- Deploy to Vercel on every push. No backend.

## Folder structure
```
src/
  app/
    page.tsx                  opening cinematic
    village/page.tsx          hub map
    expedition/[id]/page.tsx  Phaser host
    codex/page.tsx
    finale/page.tsx
  components/
    cinematic/  village/  codex/  dialogue/  ui/
  game/
    engine/                   shared Phaser scene base, input, light mask, juice helpers
    mechanics/                lanternLight.ts, chase.ts, pattern.ts
    expeditions/              one config per neighbor
    config.ts                 tuning constants
  data/
    neighbors.json  spirits.json  codex.json  dialogue/*.json
  store/                      zustand slices
  lib/                        audio.ts, analytics-free helpers
public/art/  public/audio/  public/atlases/
docs/art-prompt.md
tests/
```

## Mechanics (reused across expeditions, varied by config)
1. Lantern-light: limited light radius reveals clues, shy spirits hide in the dark.
2. Chase: a mischievous spirit runs off with the item; corner or outpace it.
3. Pattern: rhythm or sequence puzzle (kolam strokes, dance beats, weaving rows).

## Expedition map (names and spirits are editable)
| # | Neighbor | Problem | Spirit | Mechanic |
|---|----------|---------|--------|----------|
| 1 | Pak Hassan | damaged lantern frame | Toyol | chase |
| 2 | Auntie Meena | rain-washed kolam | Pontianak (shy) | lantern-light |
| 3 | Uncle Raju | missing dance recording | Orang Bunian | pattern (rhythm) |
| 4 | Kak Siti | weaving display needs shelter | Pocong | chase |
| 5 | Ah Ma Lim | lantern oil lost | Langsuir | lantern-light |
| 6 | Mei Ling | drum recording missing | Hantu Raya | pattern |
| 7 | Tok Wan | storytelling stage collapsed | Penanggal | lantern-light |
| 8 | Little Dewi | paper lanterns soaked | Hantu Kopek | chase |

Build order: 1, 2, 3 fully juiced first (one per mechanic), then reskin 4-8 via data.

## Game feel rules
- Expedition length 2-3 minutes, instant retry, no fail state longer than 5 seconds.
- Every success: screen shake, particles, chime, lantern relights on the village map.
- Codex card reveal after each expedition with Framer Motion flip.
- Village starts dark; relit lanterns are the progress bar.

## Tuning constants (src/game/config.ts)
PLAYER_SPEED 220, LIGHT_RADIUS 140, LIGHT_PULSE 0.08, CHASE_SPIN_UP 1.2s, SPIRIT_SPEED 190, EXPEDITION_TIME 150s, PATTERN_WINDOW_MS 220.

## Code rules
- Functional React only, TypeScript strict, no `any`.
- Game logic pure and in `src/game/`, never inside React components.
- Comments only to explain why, not what.
- Respect `prefers-reduced-motion`; provide skip for the cinematic.
- Keyboard and touch both work; targets at least 44px.
- Add a `?debug` panel: jump to any expedition, grant all lanterns, skip to finale.

## Definition of done per task
Runs with `npm run dev`, no TypeScript or ESLint errors, `npm test` passes, tested at 390px and 1440px widths, committed with a clear message.

## Demo path (rehearse for 2 minutes)
Cinematic (skippable) -> village -> expedition 1 -> codex reveal -> lantern relights -> `?debug` jump to finale.
