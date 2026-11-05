# FearlessU cinematic website

## Starting point and assumptions

- Migrate the existing npm/Vite React app to the requested Next.js App Router, TypeScript, and Tailwind stack.
- Keep the existing approved copy, local educational demo data, and legacy presentation source. Do not change the pre-existing untracked `index.html.backup` or `src/hooks/useSectionReveals.ts`.
- **User refinement:** preserve `public/fearlessu-reference-hero.png` as the recognizable hero artwork. Use a locally optimized WebP and depth-aware parallax, with real 3D glass and particles. Blend into the procedural landscape as the camera rises. Do not use the supplied UI screenshot as a flattened website.
- No external images, model downloads, AI services, analytics, or demo-input collection are required.
- Preserve static hosting through Next.js static export. Update the existing Pages workflow for `out/` and its repository base path.
- The requested publication target is `https://github.com/vkonrad23/FearlessU-accelerator-presentation`. The existing `origin` points elsewhere; inspect the destination before publishing, never force-push.

## File structure

```text
src/app/                  App Router layout, page, global styles
src/config/scene.ts        All visual, motion, camera, and quality settings
src/components/journey/   Semantic sections, navigation, trust bar, local preview
src/components/world/     Canvas, Scene, CameraRig, Sky, Mountains, Stairs,
                          Cards, Figure, Particles, Effects, OptionalModel
src/components/journey/
  hooks/                  Intro and scroll controller
src/lib/                  Deterministic geometry and scene interpolation
src/store/                Small Zustand scene store, no personal data
public/models/            Optional locally supplied Draco glTF assets
scripts/                  Repeatable validation and bundle-budget checks
artifacts/                Ignored desktop/mobile screenshots and audit reports
```

## Continuous scenes

1. **Hero:** the preserved illustration with depth-aware parallax and real particles, “Beyond fear. Beyond limits.”, and readable HTML controls. Load the hidden procedural world only when scrolling toward it.
2. **Product:** rise along the stairs; six feature cards settle into a ring.
3. **How it works:** four scroll stops illuminate four corresponding stair landings. Use the existing four process steps verbatim.
4. **AI and safety:** cool the light and slow ambient movement; show the existing prototype limitations and crisis-support routes.
5. **Final CTA:** reach a warm sunrise and “Explore the fear journey”, opening a clearly bounded local educational preview.

## Phases and verification gates

- **Phase 1:** Next.js scaffold, fonts/layout, CSS poster, scroll plumbing, procedural hero. Run build, lint, type-check, then the dev server; inspect 1440px and 390px screenshots and browser console.
- **Phase 2:** complete continuous camera path, product ring, four steps, safety content, final CTA, and local-only preview. Repeat checks and screenshots; check forward/backward scrolling.
- **Phase 3:** subtle bloom/depth of field/vignette/grain, once-per-session 3.5s intro, cursor response, floating cards, and traveling step illumination. Repeat checks and screenshots.
- **Phase 4:** adaptive DPR/particles/effects, visibility pause, disposal, keyboard/contrast audit, reduced motion, no-WebGL, 1280/1440/1920/390 layouts, production bundle and Lighthouse checks. Document setup, model contract, and any unverifiable device performance.
- Review staged changes, commit with the configured identity, and push only the requested repository after checking its history.

## Risks and safeguards

- **WebGL/GPU variability:** keep HTML visible independently of the canvas; provide an atmospheric CSS landscape; catch failed contexts and model errors.
- **Mobile cost:** lazy-load 3D, cap DPR at 2, use instancing and deterministic geometry, adapt quality, omit expensive transmission/effects on lower tiers.
- **Motion sensitivity:** no lightning, shake, strobing, or forced scroll; reduced motion uses the static landscape with all content available.
- **Readability:** opaque-to-transparent left scrim, cream text, readable disclosure chips, minimum 14px trust labels and 13px disclaimer.
- **Safety:** preserve early-stage language, never imply clinical validation, show crisis signposting before any demo, keep inputs in page memory only.
- **Performance claims:** report measured lab results separately from real-device FPS. Do not claim real-device validation when hardware is unavailable.
- **Browser verification:** the embedded browser's image APIs do not return frames. The user authorized a separate isolated test browser for screenshots.
- **Publishing:** do not replace the existing remote or overwrite unrelated remote history. No deployment outside the user's requested GitHub push.

## Verification record

- **Phase 1 passed:** Next.js build, lint, and types; original artwork retained; desktop/mobile screenshots; no horizontal overflow; readable trust/disclaimer text.
- **Phase 2 passed:** all five chapters and four steps, reversible scroll/camera interpolation, keyboard feature tabs, and the native local-preview dialog. Fixed and verified focus restoration. Six initial tests passed.
- **Phase 3 passed:** depth/parallax artwork, floating cards, shared glass buffer, particles, stair pulse, safety slowdown, and gentle effects. Intro measured at 3.484 seconds, with no repeat on the next navigation in the same session. Desktop/mobile scenes and console checked; eight tests passed at this gate.
- **Initial Phase 4 checks:** ten tests covered interpolation, deterministic geometry, high-difficulty preparation, paused/hidden time, safe model paths, and conservative AA palette contrast. Build, lint, types, and the 250 kB initial-JS gate passed.
- **Performance correction:** the first Lighthouse run scored 66 with 1,494 ms total blocking time. Asynchronous base-scene shader preparation and deferring costly glass/postprocessing until the procedural scenes reduced the measured blocking time to 219 ms and raised desktop performance to 92. Accessibility, best practices, and SEO scored 100; CLS was 0. This is a local production lab measurement.
- **Fallbacks and controls:** paused and offscreen rendering each produced zero additional canvas frames over the sampled interval. Reduced motion, simulated unavailable WebGL2, and simulated 1 GB memory removed the canvas while retaining content and controls. Actual `WEBGL_lose_context` injection returned to the static presentation. Only expected context-loss messages appeared.
- **Responsive and keyboard checks:** verified CSS widths 1280, 1440, 1920, and 390 with no horizontal overflow and matching desktop/mobile quality. Mobile-menu Escape restores focus. Feature Home/End and dialog Escape work. Reflection/pause choices render a temporary summary; closing clears it. Automated axe checks reported zero violations; gradient contrast required manual/conservative palette checks.
- **Browser notes:** viewport testing resets zoom before asserting CSS width. Screenshots use the user-authorized isolated browser, not the embedded pane. Some early capture/resize calls timed out; successful final captures and explicit DOM width assertions replaced those attempts.
- **Dependency audit:** no production advisories; 12 moderate development-tool findings remain. The obsolete Vite dependency was removed, the preview server was patched, and no unsupported forced upgrade was applied.
- **Documentation:** README explains the 2.5D artwork treatment, configuration, startup/quality trade-offs, model/Draco placeholders, privacy, and validation limits. Original legacy presentation sources remain available.
- **Anchor correction:** removed the extra Lenis offset because Lenis already applies CSS scroll padding. Camera stops now use that same responsive padding. Actual WebGL browser checks reached the final camera stop at 132 px on desktop and 112 px on mobile, with the product stop at 0.22 in both directions.
- **Release browser pass:** an isolated headless Chromium process completed 1280×720, 1440×900, 1920×1080, and 390×844 checks without overflow, page errors, or failed resource requests. Desktop hero and trust bar fit within the viewport. The local reflection/pause flow clears on close and restores focus. Headed browser resize crashes were bypassed without modifying the user's browser.
- **Further performance work:** subsequent audits scored 60 and 61 with CPU benchmark indices of 259.5 and 639, versus 1,948 in the earlier 92-point run. Free host memory later fell to 0.49 GB and a build timed out. Hidden landscape assets now load on scroll and retain the original artwork until shader preparation completes; static generation uses one worker to bound build memory.
- **Final root-export validation:** the one-worker build, lint, types, all 11 tests, and the 198.3 kB initial-JS budget passed. Actual WebGL checks confirmed that the landscape is deferred at the hero and prepared after navigation, with all four viewport sizes, forward/backward anchors, and the local preview passing without application errors or failed resources. The final Lighthouse run scored **97 performance / 100 accessibility / 100 best practices / 100 SEO**, with FCP 262 ms, LCP 871 ms, TBT 136 ms, and **CLS 0**. Its CPU benchmark index was 2,483, so improvement cannot be attributed solely to the code change.
- **Final Pages export:** the repository-prefixed production build, lint, types, 11 tests, and 198.4 kB initial-JS budget passed. Isolated WebGL checks loaded prefixed artwork, fonts, scripts, landscape, and preview without failed requests. All four viewport sizes and desktop/mobile anchors passed. The intro measured **3.488 seconds** and did not repeat after navigation in the same session. The root export was restored after this check.
- **Phase 4 passed:** the available functional, accessibility, fallback, responsive, bundle, and desktop performance gates are complete. Real-device and deployment limits remain explicit below.

### Publication and remaining limits

- Publication follows staged-diff review, excludes the two pre-existing untracked files, uses the configured Git identity, and preserves `origin`.
- The requested destination's default `main` was checked against the original `616c4e9` baseline. The final commit/push result is reported separately; no force-push or repository-settings change is part of this plan.
- Real mobile hardware, other browser engines, optional GLB/Draco files, and live Pages deployment remain outside the available validation.

## Transparent hero and 3D refinement

- **Requested follow-up:** remove the dark hero box shown in the user's screenshot, preserve the original artwork, refine the 3D visuals, and push the result to the same authorized repository.
- **Implemented:** transparent hero background without blur/border/shadow, cream text with gentle shadow, feathered desktop/tablet/mobile readability scrims, coherent ridged terrain with smooth normals and elevation/slope colors, beveled instanced stone stairs, once-captured procedural reflection lighting, clearer glass, camera-relative sunrise shading, and gentler grain/DOF. No dependencies or remote assets were added.
- **Build verification:** final root and repository-prefixed exports passed lint, TypeScript, all 12 tests, and the bundle gate. Initial JavaScript is 198.3/198.5 kB gzip respectively; deferred chunks are approximately 377.6 kB. The original PNG has no changes.
- **Browser verification:** actual WebGL passed at 1280×720, 1440×900, 1920×1080, 900×900, and 390×844 without overflow, console/page errors, or HTTP error responses. Computed styles confirm a transparent, unblurred hero. Screenshots cover the hero/product, four steps, safety, and final CTA. Desktop/mobile anchors and the local reflection/pause/clear/focus flow passed.
- **Motion and fallbacks:** the final prefixed intro measured 3.497 seconds and did not repeat. Landscape loading remains deferred at the hero. Paused rendering produced zero frames over 600 ms. Reduced motion, simulated no-WebGL2, and simulated low memory retained HTML without a canvas. Short desktop scene samples varied between 48 and 61 FPS, not a sustained-device guarantee.
- **Performance:** the refinement audit passed at **89 performance / 100 accessibility / 100 best practices / 100 SEO**, FCP 280 ms, LCP 887 ms, TBT 249.5 ms, **CLS 0**, host CPU benchmark 1,257.5. Report: `artifacts/lighthouse-transparent.json`. The later tablet-only scrim correction does not affect that desktop layout; final builds and responsive browser checks were repeated afterward. The prior 97-point run had benchmark 2,483; do not treat the score difference as an isolated code regression.
- **Test-harness correction:** the first expanded scene check used `safety` instead of the existing `ai-safety` section ID. The selector was corrected and the full run passed. This was not an application error.
- **Publication:** incremental changes follow the already published `d340d13`, with staged review, configured Git identity, non-force push, preserved `origin`, and the two pre-existing untracked files excluded. Live Pages status and real-device validation remain unverified.
