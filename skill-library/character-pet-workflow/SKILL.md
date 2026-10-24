---
name: character-pet-workflow
description: Build expressive game characters with repeatable movement loops, compact behavior contracts, and deterministic validation; supports animated GLB puppets or sprite-sheet pets.
---

# Character Pet Workflow

Use this skill for original game characters or pet-like animated companions. Preserve the user's approved character identity, art direction, delivery format, and runtime. A request to use this skill does not authorize changing model providers, creating accounts, deploying a server, or spending API funds.

Adapted from [The Commons character pipeline case study](https://github.com/Collaboration95/common-grounds-makeathon/blob/main/docs/gist-claude-switch.md). Read [the source note](references/source.md) for provenance and the limits of that reference. This is an independent skill, not an official package from that repository.

## Define a small contract first

Write a character specification before generating assets:

- Identity: name, silhouette, palette, clothing, props, and personality.
- Movement: locomotion mode, idle behavior, interactions, animation names, and loop durations.
- Integration: world scale, coordinate axes, origin/pivot, collision shape, rendering format, and supported inputs.
- Personality: a few short original reactions related to the character's own story. Keep them legible and avoid repeating one line on every frame.
- Constraints: approved tone and cultural context. Distinguish fictional spirit reinterpretations from sourced folklore.

Separate behavior logic from asset production. They may progress independently once the contract is stable. Validate both before connecting them to the live game.

## Choose the asset path

**Animated 3D:** use GLB with named animation clips and documented units. For Hantu Codex, the approved baseline is `Idle`, `Walk`, `Wave`, `Celebrate` with in-place locomotion. Rigid-part puppet animation is acceptable when documented; do not describe it as a skinned humanoid rig. Frame raised arms and props, not just the rest pose. If CAD delivery is requested, export an assembled static DXF mesh separately and state that it has no animation or parametric solid history.

**Sprites:** define the sheet layout and exact frame map before generation. Keep a stable baseline, scale and facing direction. Verify real transparency, consistent identity, unclipped limbs/props, and distinct motion frames. Use the existing game's clip contract; the reference's twelve-frame layout is an example, not a requirement.

Use approved image or modelling tools. Do not substitute a pixel-art style for an approved paper-cut or 3D direction. Do not add unrequested props or change character identity merely to make a generator's output easier to use.

## Give the character behavior

Use a bounded state machine with explicit transitions, cooldowns, and a deterministic clock. Useful states include idle, wander, visit, rest, greet, and react. Implement only the states the requested game needs. A scripted quest character does not need autonomous roaming unless it improves the experience.

Make player reactions readable: a brief wave, a small hop, a look toward a neighbor, or an original short line. Reserve celebration for meaningful success. Pause offscreen rendering and respect reduced motion and mute preferences. Movement necessary for gameplay remains functional when decorative loops are disabled.

## Validate before integration

- Simulate behavior with seeded inputs. Check bounds, transitions, cooldowns, idle recovery, and completion conditions.
- Load each asset in the actual runtime. For GLB, verify buffers, finite geometry, normals, animation targets, and matching loop endpoints. For DXF, verify units, axes, layer names, and face counts.
- Inspect motion visually as well as structurally. Confirm that limbs move, props remain attached, feet align, and the model is framed throughout each loop.
- Test touch and keyboard input and preserve the user's save data.
- If generated behavior fails a check, use the specific errors for one focused repair, then revalidate. Stop and diagnose repeated failures rather than starting an unbounded generation cycle.

Deliver the assets, a manifest, editable source or generator when available, and concise usage notes. State exact limitations instead of claiming production rigging, CAD solids, model quality, cost, or latency that has not been verified.
