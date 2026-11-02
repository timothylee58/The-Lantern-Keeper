# Lantern Keeper character assets for Unity

This package is prepared but has not been tested in Unity Editor. Install Unity's `com.unity.cloud.gltfast` package, then import the .unitypackage. The 15 GLBs include Idle, Walk, Wave and Celebrate. Use Generic transform animation, not Humanoid retargeting: these are rigid meshes, not skinned rigs. Create an Animator Controller with four states named exactly as the clips, set Idle as default and enable looping on each clip. Attach LanternCharacterMotion to the animation root and assign the controller. Play(Movement.Walk) crossfades to walking; SetPaused(true) pauses.

For 2D use, set each walking PNG to Sprite (2D and UI), Multiple; slice by 192 × 256 grid, with bottom-center pivot. Rows top-to-bottom: front, right, back, left. Each row has 12 frames. Use the corresponding duration/frameRate in the sprite manifest. Do not include frames from another row in the same animation. PNGs use transparency. Walk is in place. Keep source size and disable compression if it damages thin props.

GLBs use metres, +Y up, +Z forward. Let glTFast convert handedness. No collision/navigation setup or humanoid avatar is included. These are stylized procedural characters with adult proportions, not photorealistic assets.
