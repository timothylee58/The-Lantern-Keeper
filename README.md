# The Lantern Keeper: Hantu Codex

A short, gently spooky game about eight neighbors preparing a gathering after a storm. Ari recovers keepsakes from playful spirits. Each quest relights a village lantern, unlocks an encounter, and adds a detail to the final gathering.

## Approved direction

The user selected consistent indigo-and-gold paper-cut visuals, the supplied 2D stack, the existing Sites URL, browser saves, and the existing eight culturally specific neighbors. The sample roster and Vercel hosting instructions were superseded. Six spirit types support eight distinct quests; the game does not invent eight folklore traditions merely to match the number of neighbors.

## Run and verify

`npm install`, `npm run dev` (port 4173, path `/hantu-codex/`). Validation: `npm run typecheck`, `npm run lint`, `npm test`, `npm run smoke`, `npm run build`. Playwright requires `npx playwright install chromium --only-shell`. Tests use 1440px and 390px widths. The build exports to `out/`, configured in `.openai/hosting.json`.

## Two-minute demo

Open `/hantu-codex/?debug`. Skip the cinematic, choose Mei Lin, and demonstrate chase movement. Complete an expedition to reveal its codex card and relight the village. For a fast live demo, Daniel's pattern quest has three sequences and no combat. Demo controls can jump to any expedition, grant all lanterns, and open the finale. These controls only affect the current browser save and are hidden without `?debug`.

The full game uses WASD/arrows or touch controls. Hold Shift / Soften light beside a shy clue. Pattern quests use visible shapes and keys 1–4; exact rhythm is optional. Sound starts muted and every cue is visual. Reduced motion keeps manual story chapters and all gameplay.

## Hidden snack-table nod

Tap the small wooden spoon on the village map three times. The optional “A spoonful of rhythm” scene is an unofficial reference to Metronomik's _Ondeh Ondeh: Kaya's Tasty Tale_. It uses original dialogue, shapes, and synthesized sounds; no assets or music from that game are included. It does not change quest progress.

## Saves and scope

Zustand persists under `hantu-codex-v2`. Previous `hantu-codex-v1` records migrate without falsely completing new quests. The original `lantern-keeper-v1` game remains at `/` and retains its save. Export/import is available in the journal. Browser storage is device- and browser-specific. Supabase is deferred; see `future/supabase/README.md`.

Folklore Notes and fictional Field Notes are distinct. Sources are linked in the codex and journal. Langsuan is explicitly an unverified search alias; Langsuir/Langsuyar are the documented forms used here. Pattern mechanics use abstract lights, not authentic kolam, sacred weaving motifs, or traditional musical notation.

## Creative through-line

The village brightens as neighbors are helped. Each quest has its own problem, humorous spirit explanation, and visible preparation. The finale brings the eight contributions together. Future expansion should deepen these relationships—such as paired-neighbor side stories or alternate kind solutions—before introducing more mechanics.

`skill-library/storybook-motion` contains original reusable recipes for all eight principles from Zajno Motion. A copy is installed in the user's personal Codex skills directory. This is not an official Zajno package.

## Separate adventures

Lantern Keeper remains at `/`. Its original artwork, styles, story, gameplay and save format are preserved; the assembler adds two Hantu Codex links to the homepage. Later explicit requests add an original looping fantasy soundtrack to the existing sound button and a brass lantern logo inspired by the supplied reference. Hantu Codex, its styles, assets and Next runtime are isolated under `/hantu-codex/`. The mobile village uses a bottom sheet and the codex has two columns. Fraunces, Nunito and Caveat are bundled with next/font/local under their included OFL licenses.

All 15 characters are original articulated 3D puppets with four looping clips, blinking, and distinct spirit locomotion. GLB and static 3DFACE DXF downloads are in the character workshop. The independent Character Pet Workflow skill is in `skill-library/character-pet-workflow`.

## Original music

“Lanterns After Rain” is an original 48-second looping score with soft plucked strings, airy flute-like synthesis, bell accents and warm pads. It is fantasy storytelling music, not a recording or recreation of a particular living tradition. Source: `scripts/compose-bgm.py`. It starts automatically where browser policy allows, or on the first tap/click/key interaction, fades in/out, suspends in background tabs, and remembers an explicit mute independently of game progress.

Hantu Codex uses its own original 60-second, 96 BPM score, “Rain & Lanterns”: gentle stereo rain, bamboo-like percussion, plucked strings, airy flute, small gong colours and a lively frame-drum pulse. Quiet mist-like tones add a little mystery without thunder, screams or sudden stings. Source: `scripts/compose-hantu-bgm.py` (Python + numpy). Sound defaults on for new visitors, respects saved mute settings, pauses in hidden tabs and continues through Hantu route changes. The gold “← The Lantern Keeper” link returns to the original game at `/`.

## GitHub Actions setup

The CI workflow is preserved at `docs/github-actions/quality.yml` as an inactive template. The GitHub sign-in used for the initial import did not have the `workflow` permission. To enable CI later, move it to `.github/workflows/quality.yml` using a GitHub sign-in with workflow access.
