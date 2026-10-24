# Codex prompt sequence

Run one prompt per branch/task, merge after each passes. Always start by telling Codex: "Read AGENTS.md first."

## 0. Scaffold (Hour 0-1)
Read AGENTS.md. Scaffold a Next.js App Router TypeScript project with Tailwind, shadcn/ui, Framer Motion, Zustand, Howler, GSAP, Lenis, Phaser, Vitest and Playwright. Create the folder structure from AGENTS.md with placeholder pages, add design tokens, an ESLint and Prettier config, and a GitHub Actions workflow running lint, typecheck and tests. Make sure `npm run dev` and `npm run build` pass.

## 1. Data and store (Hour 1-2)
Read AGENTS.md. Create typed schemas and JSON data for 8 neighbors, 8 spirits and codex entries (each with encounter text and a separate folklore note with tradition label). Create Zustand slices with persistence: neighborsHelped, codexUnlocked, lanternsLit, audioMuted. Add Vitest tests for the store.

## 2. Dialogue system (Hour 2-3)
Build a dialogue box component with typewriter text, speaker portrait slot, choice buttons and keyboard advance, driven by JSON in src/data/dialogue. Respect reduced motion. Add a Storybook-free demo route at /dev/dialogue.

## 3. Opening cinematic (Hour 3-5)
Build the scroll-driven opening on `/` with GSAP ScrollTrigger and Lenis: storm, scattered lanterns drifting, the village in the rain, then the line about Ari and the eight neighbors, ending with a glowing "Begin your story" button that routes to /village. Use layered parallax placeholders for now, a Skip button, reduced-motion fallback, and mobile layout at 390px.

## 4. Village hub (Hour 5-6)
Build /village: a dark illustrated map with eight neighbor markers, lanterns that light when helped, a progress counter, and tap/click to open a neighbor intro dialogue then start an expedition. Animate a lantern relighting with Framer Motion and a soft glow.

## 5. Phaser engine base (Hour 6-7)
Create the shared Phaser scene base in src/game/engine: mount in a client component, handle resize, keyboard plus virtual joystick for touch, a light-mask helper, particle and screen-shake juice helpers, Howler audio hooks, and an expedition result callback that updates the store. Keep logic in pure modules with tests.

## 6. Expedition 1: Chase (Hour 7-9)
Implement the chase mechanic in src/game/mechanics/chase.ts and expedition 1 (Toyol steals Pak Hassan's lantern frame). Spirit flees with a pathing pattern that gets smarter over three phases, player can corner it using obstacles, success returns the item with a funny spirit reaction. Add tuning from config.ts and unit tests for the AI state logic.

## 7. Expedition 2: Lantern-light (Hour 9-10.5)
Implement lanternLight.ts and expedition 2 (shy Pontianak near kemboja trees). Limited light radius reveals clues; shining light directly at the spirit makes it hide, so the player must guide it with indirect light. Provide a clear on-screen hint system.

## 8. Expedition 3: Pattern (Hour 10.5-12)
Implement pattern.ts and expedition 3 (Orang Bunian rhythm trail). Show a beat pattern, player taps in time, forgiving window from config, visual and audio feedback, score maps to codex reward quality.

## 9. Codex UI (Hour 12-13)
Build /codex: card grid, flip reveal after each expedition, tabs for "Field Notes" (the story encounter) and "Folklore Notes" (regional tradition, sources), locked silhouette for undiscovered entries, search filter. Accessible with focus states and ARIA.

## 10. Finale (Hour 13-13.5)
Build /finale: all eight neighbors gather at the restored celebration, each neighbor's preparation shown lit, a short cinematic dialogue, and a credits card with asset attributions plus a "Play again" and share image button.

## 11. Reskin expeditions 4-8 via data (Hour 13.5-14.5)
Using the existing three mechanics, add expeditions 4-8 purely through config and data (spirit sprite, map layout, dialogue, codex text). Do not write new mechanics. Verify each is completable.

## 12. Polish and QA (Hour 14.5-15)
Add the ?debug panel, audio mix pass and mute toggle, loading screen, favicon and OG image, Lighthouse check, and a Playwright test that covers cinematic -> village -> expedition 1 -> codex -> finale via debug skip. Fix any TypeScript, lint or layout issues at 390px and 1440px.

## Emergency cut list (if behind)
1. Drop expeditions 6-8 and show the finale with five neighbors.
2. Skip the virtual joystick; use tap-to-move.
3. Use static art for the cinematic with only two parallax layers.
