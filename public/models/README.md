# Optional figure model

The site uses a procedural silhouette by default. No model download is required.

To replace it:

1. Add a licensed, self-contained `figure.glb` here, below 1.5 MB. Embed textures and buffers. Use a low-poly mesh, a feet-centered origin, +Y up, and about 1.95 units in height.
2. Set `sceneConfig.models.figure` to `/models/figure.glb`. Adjust `figureScale` and `figureStep` in `src/config/scene.ts`.
3. For Draco compression, also install the local decoder described in `public/draco/README.md`.
4. Run build, budget, desktop/mobile visual, and context-loss checks.

The model loader is lazy, byte-limited, same-origin, and wrapped in Suspense and an error boundary. Missing, oversized, malformed, or externally referenced assets leave the procedural figure visible. Decoder workers and loaded GPU resources are disposed. No optional model is supplied or claimed to have been validated.
