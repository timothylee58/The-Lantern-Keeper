# 8-bit character contract — 5 November 2026

User-approved replacement of all 15 displayed 3D characters with original 8-bit-inspired pixel characters. Preserve roster, colors, everyday clothing and story props; preserve friendly fictional spirits. Environments and original Lantern Keeper adventure remain unchanged.

Each transparent atlas uses 48 × 64 source pixels per frame, 12 columns, 16 rows. Rows are grouped by Idle, Walk, Wave, Celebrate, with front/right/back/left within each group. Sample 12 evenly spaced phases without duplicating the endpoint. Palette uses hard edges, no antialiasing, no gradients. Display with nearest-neighbor scaling. Shared foot anchor: (24, 59). Walk is in place; spirits glide and Pocong hops. Frame rate = 12 / clip duration. Sprite atlas and per-clip walking sheet are downloadable.

All live character surfaces (prologue, village, conversations, codex, workshop, expeditions) use these assets. No runtime GLB loading or 3D fallback. Existing 3D source assets remain archived in repository history/files; they are no longer displayed or offered in the workshop.

Source generator: scripts/build-pixel-characters.py. Validation covers all 15 atlases, dimensions, transparent borders, binary alpha, palette size, nonempty frames, movement, and runtime checks at desktop/mobile sizes. Respect pause, background tabs, offscreen visibility and reduced motion.

## Import into Unity 2D
Set Texture Type to Sprite (2D and UI), Sprite Mode to Multiple, Filter Mode to Point, Compression to None. Slice by 48 × 64 cells; use pivot (0.5, 5/64) for the shared foot anchor. Each clip has four direction rows, ordered top-to-bottom as documented above. Create one looping animation per row using its 12 frames and duration from manifest.json. No 3D importer or humanoid rig is needed. Unity Editor import has not been tested on this machine.
