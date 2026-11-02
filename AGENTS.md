# The Lantern Keeper: Hantu Codex

Use the supplied story bible in docs/aigrandprix-AGENTS.original.md and locked visual prompt in docs/art-prompt.md. User-approved decisions on 24 October 2026 override the sample roster and hosting instructions:

- Consistent indigo, gold and jade paper-cut worlds with adult-proportion RPG characters (approved 26 October 2026), with restrained facial features and articulated movement; the painted prototype is archived. Deliver GLB loops and static CAD-compatible DXF meshes.
- Fraunces for story/display/dialogue, Nunito for UI/body (14px minimum mobile body), Caveat only for Ari’s handwritten notes at 22px or larger. Bundle with next/font; await font readiness before Phaser. Mobile village conversations are bottom sheets, codex remains two columns, and controls are at least 44px.
- Next.js App Router, strict TypeScript, Phaser 3, GSAP ScrollTrigger and Lenis cinematic, Framer Motion UI, Zustand browser persistence, Howler audio.
- Keep the existing Sites project and public URL. Preserve Lantern Keeper at `/` unchanged except for the two additive links, the user-requested brass lantern logo, and fantasy BGM enabled by default (start on first interaction if autoplay is blocked; remember an explicit mute). Mount Hantu Codex independently at `/hantu-codex/`. Do not create a Vercel deployment or a paid backend. Supabase remains a future option only.
- Preserve Farah, Mei Lin, Kavitha, Daniel, Suri, Lina, Dina and Amina and their eight distinct cultural stories. Eight expeditions may revisit six spirit types rather than inventing unsupported lore.
- Emphasize a living village and humorous spirit dialogue. Relight one lantern per neighbor; unlock the restored gathering when all eight are helped.
- Three reusable mechanics only: chase, lantern-light and pattern. No combat, gore, jumpscares or sacred objects as weapons. Pattern puzzles are fictional abstract sequences, not representations of sacred motifs or authentic musical performance.
- Folklore Notes and Field Notes remain distinct. Langsuan is an unverified search alias, not an asserted documented spelling.
- Respect reduced motion, provide cinematic skip and persistent mute. Keyboard and touch controls must work with targets at least 44px.
- Run lint, typecheck, Vitest and demo-path Playwright checks, including 390px and 1440px. Commit/publish using the Sites source workflow.

Keep original game saves and the legacy adventure available. Changes to primary direction require a question through the available user-question tool.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
