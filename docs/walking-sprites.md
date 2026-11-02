# Walking sprite contract

All 15 existing characters retain their model palette, clothing, props and identity. Bake the revised GLB Walk animation into transparent PNG sheets: 12 columns × 4 rows, 192 × 256 pixels per frame. Rows: front, right, back, left. Frame indices are row × 12 + column. Sample t = frame × duration / 12; do not duplicate the last frame. Playback rate is 12 / clip duration. Origin is bottom center; consistent orthographic framing for every direction of a character. The cycle stays in place.

Ari and neighbors walk with alternating legs and arm swing. Floating spirits glide; Pocong hops with legs together. These are fictional game encounters. The sheets preserve the stylized procedural RPG meshes; they are not hand-painted or photorealistic sprites.

Preview in the character workshop with directional controls and pause/reduced-motion support. Export a JSON frame manifest and all-character ZIP. Validate transparent borders, distinct frame pixels, frame dimensions, four directions and all 15 characters. Source: scripts/build-walking-sprites.mjs.
