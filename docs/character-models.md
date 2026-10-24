# Original 3D character pack

All fifteen characters are original procedural models, built with rounded low-poly forms, layered paper-like clothing, friendly facial details and separate moving parts. Indigo, jade and warm gold connect them to the game's visual direction. Clothing and props describe these fictional individuals; they are not claims about how a whole community dresses.

## Files and use

`public/models/manifest.json` is an array with `id`, `name`, `glb`, `dxf`, `clips`, measured rest-pose `bounds`, `height` and triangle count for every character. URL paths begin with `/hantu-codex/models/`. `public/models/characters.zip` contains all 15 GLBs, 15 DXFs, the manifest and a README.

| ID           | Character detail                                                   |
| ------------ | ------------------------------------------------------------------ |
| ari          | Green practical tunic, sun hat, notebook, satchel and lantern      |
| farah        | Covered violet dress and headscarf, recovered pantun notebook      |
| mei-lin      | Coral everyday tunic, paper for craftwork and lantern              |
| kavitha      | Violet long kurta, chalk bowl                                      |
| daniel       | Cream buttoned shirt, gathering invitation                         |
| suri         | Indigo clothing, everyday shawl with generic stripes, repair spool |
| lina         | Green clothing and field recorder                                  |
| dina         | Terracotta dress and plate of fictional sago bites                 |
| amina        | Covered jade dress and headscarf, folded woven cloth               |
| pontianak    | Friendly cream-robed figure, flower and lantern                    |
| toyol        | Friendly mint-green imp, leaf-shaped ears and borrowed marble      |
| hantu-raya   | Gentle leafy guardian, broad shoulders and leaf crown              |
| langsuir     | Friendly jade-robed figure with leaf clips and borrowed notes      |
| pocong       | Friendly bundled-paper reinterpretation with soft ties             |
| orang-bunian | Friendly forest visitor with leaf cape, circlet and lantern        |

The spirit models are game fiction. They do not standardize regional folklore or represent historical or religious practice. Langsuir is the model ID; the codex's spelling distinctions remain independent of the asset name.

## Animation and framing

Each GLB is glTF 2.0 with standard PBR materials and four exact animation names: **Idle**, **Walk**, **Wave**, **Celebrate**. They animate a hierarchy of rigid parts. They are not skinned humanoid rigs and should not be passed to a humanoid retargeter. Walk is an in-place cycle; gameplay controls movement. Loop the selected clip with the renderer's animation mixer. Every animated channel has identical first and last samples.

GLBs use metres, **+Y up, +Z forward**. Rest-pose bounds range from 2.32 to 2.61 metres tall, with feet around Y=0.04. Most models are 1.16–1.30 metres wide. A useful portrait target is `(0, 1.3, 0)`, with a perspective camera around `(3, 2.5, 5)`. Allow approximately 2.2 metres of width and 3.1 metres of height when showing raised arms and moving props. Use the manifest bounds for automatic framing. For map placement, scale uniformly to the game's coordinate system.

DXF files contain the assembled, static rest pose as triangular `3DFACE` entities, in **millimetres, +Z up**. The conversion is `(X, Y, Z)` in glTF to `(1000X, -1000Z, 1000Y)` in CAD. Layers identify the part and material. These files are CAD-compatible polygon drawings, not parametric solids, editable character rigs, or animated CAD files.

## Rebuilding and checks

Run `python3 scripts/build-character-models.py`. The generator uses the Python standard library and requires no downloaded meshes or external modelling software.

Validation checks GLB magic/version/length, binary view bounds, unit normals, nondegenerate triangles and matching animation endpoints. All 15 files were also loaded by Three.js `GLTFLoader`, and all 60 clips were advanced through `AnimationMixer`. A rendered contact sheet was visually inspected. No external source artwork, textures or mesh assets are included.

Refinement: each loop now has 65 sampled keys, eyelid blinks, gentle head turns and attached moving props. Woodland spirits float; Pocong hops with its legs together. The viewer pauses offscreen and supports keyboard rotation.
