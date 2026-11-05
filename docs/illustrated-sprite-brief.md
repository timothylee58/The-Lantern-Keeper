# Illustrated walking-sprite production brief

Status: user approved hand-painted anime-inspired sprites. Ari artwork generated; transparency failed two cleanup attempts. Current game assets remain unchanged pending clean, validated sprites.

Use original anime-inspired design with expressive faces, natural clothing folds, restrained proportions and warm color harmony. Do not claim exact studio replication. Preserve the named character and existing cultural/story context.

## Roster invariants

| Character | Clothing palette | Hair / headwear | Story prop |
|---|---|---|---|
| Ari | jade | hat | lantern |
| Farah | violet | scarf | book |
| Mei Lin | coral | bun | paper-lantern |
| Kavitha | violet | long | bowl |
| Daniel | cream | short | invitation |
| Suri | indigo | long | spool |
| Lina | jade | long | recorder |
| Dina | terra | long | plate |
| Amina | jade | scarf | textile |
| Pontianak | cream | long | lantern |
| Toyol | terra | tuft | marble |
| Hantu Raya | leaf | crown | leaf |
| Langsuir | jade | long | notes |
| Pocong | cream | wrap | recipe |
| Orang Bunian | jade | long | lantern |

## Animation delivery

Generate one character sheet per image-generation call, with the same character size, lighting and costume across frames. Current sheet specification: 8 columns × 6 rows. Four rows contain front/right/back/left walking cycles, followed by front-facing Wave and Celebrate rows. Idle uses a neutral stance. True transparency is required. Contact, down, passing and up poses alternate left/right support. Align feet and pivots after inspection; do not call the output game-ready until the loop plays without identity drift, sliding, prop detachment or clipping.

Pontianak, Langsuir and Orang Bunian glide. Pocong hops with legs together. Toyol remains a fully clothed mischievous imp. All spirits are friendly fictional encounters.

Keep the existing game’s four-direction navigation and Idle/Walk/Wave/Celebrate state contract; a single side-view concept sheet does not satisfy the complete runtime replacement. Generate missing views/loops before replacing current assets.

Preview and inspect actual playback. Preserve browser saves, reduced motion and mute settings. Publish only the completed, validated replacement.


## Ari draft review

The source draft is 1254 × 1254 RGBA, with 48 visible poses. Alpha ranges from 160 to 250 rather than reaching zero in the background. The first transparency edit produced zero-alpha background but introduced red fringe pixels; the focused fringe repair worsened them. Neither repaired image is accepted for runtime. The source artwork and rejected edits are preserved in assets/painted-character-drafts/. A local cleanup and alignment workflow has been proposed to the user and awaits their answer.

## Full roster draft status

All 15 source sheets are now saved in assets/painted-character-drafts/ as <id>-painted-source.png. These are artwork drafts on white backgrounds, not validated runtime atlases. No game replacement or deployment has occurred. Cleanup, frame alignment, animation playback review, integration and regression checks remain outstanding.

Visual review flags: Hantu Raya and Pocong gained lantern props from the style reference; Orang Bunian shows stepping poses rather than the requested glide. Review these before accepting the final animation set. Wave and Celebrate rows face front only; directional controls should reflect that limitation. The existing game remains unchanged while asset preparation is pending.

## Integrated painted release

User approved local cleanup and packing. All 15 sources were processed with border-connected background removal, edge decontamination, and a shared 192 × 256 frame size preserving vertical movement. Atlases are 1536 × 1536 with 48 poses; walk downloads contain 32 poses. The runtime uses painted atlases with smooth scaling, static Idle, four walking directions and front-facing Wave/Celebrate. Source artwork includes lanterns on Hantu Raya and Pocong; Orang Bunian uses a light stepping cycle. These are fictional game designs, not folklore claims.

Validation: lint, TypeScript, 19 unit tests and all 20 desktop/mobile Playwright checks passed. Dark-background contact sheets and workshop screenshots reviewed. Generated artwork retains small pose/outline variations; it is not a hand-keyed animation master. Public deployment remains pending until Sites confirms success.
