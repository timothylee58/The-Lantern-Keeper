---
name: storybook-motion
description: Build cinematic scrollytelling and gentle ambient loops using eight reusable motion principles, with original React animation recipes and accessible fallbacks.
---

# Storybook Motion

Use this skill when building a story-driven opening, interactive field guide, or gently animated game interface. Preserve the project's chosen visual style and animation library.

The eight principles are easing, offset and delay, fade, transform and morph, masking, dimension, parallax, and zoom. The reference site is [Zajno Motion](https://motion.zajno.com/). This is an independent implementation library, not an official Zajno plugin or a copy of its assets or source.

## Compose the sequence

Give motion a narrative purpose: reveal the setting, introduce a person and their problem, then offer one clear action. Use scroll to advance scenes; use slow ambient loops inside the current scene. Keep gameplay movement on a simulation clock, separate from presentation animation.

Use `assets/motion-presets.js` for original Framer Motion recipes. Adapt the values when the project uses GSAP or CSS rather than installing another runtime merely for the examples. Read [the principle map](references/principles.md) to select a recipe and verify it.

## Interaction and restraint

- Always offer a visible skip and a way to pause ambient motion. Honor reduced motion from the first render.
- A reduced-motion version must retain every story beat and the final action, through manual chapter controls or a linear layout.
- Stop offscreen effects and dispose animation listeners, timelines, and renderers when their host unmounts.
- Keep moving text readable. Animate containers or transitions rather than looping whole paragraphs.
- Never make essential instructions depend on animation, audio, hover, or precise timing alone.
- Verify small-screen layout, keyboard focus, scene transitions in both scroll directions, and the final action. Limit compositor effects to transforms and opacity where practical.

Do not import artwork, code, branding, or paid assets from the reference website without a separate appropriate license. Apply these principles only within the requested project scope.
