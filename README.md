# FearlessU, a cinematic journey

A scroll-driven, five-scene English/Ukrainian marketing website for an **early-stage mental wellness concept**. Built with Next.js App Router, TypeScript, Tailwind, React Three Fiber, drei, postprocessing, GSAP ScrollTrigger, Lenis, and Zustand.

**The current hero shows a standing civilian with a flowing cape.** `public/fearlessu-civilian-cape.webp` is the local 1448×1086, 241,650-byte artwork. Restrained, source-aligned depth separates the figure and foreground from the distance; the cape has gentle cloth motion with an anchored shoulder. This is 2.5D animation, not a complete 3D reconstruction. Scrolling blends into the procedural valley, staircase, and sunrise. The earlier `public/fearlessu-reference-hero.png`, `public/fearlessu-sunrise-reference.jpg`, and `public/fearlessu-sunrise.webp` remain reference assets, not the selected hero.

## Run locally

Use Node.js **22.19+**, preferably Node 24, and npm.

```sh
npm ci
npm run dev
```

Open `http://127.0.0.1:3000`. For the production export, stop the dev server first:

```sh
npm run build
npm test
npm run check:budget
npm run preview
```

`build` runs ESLint, strict TypeScript checking, and Next.js static export. Static generation uses one worker to limit peak memory on development machines. Deploy `out/`, not the old `dist/`. No application server or API key is needed. Do not open the legacy root `index.html` directly.

With the production preview running, use a second terminal:

```sh
npm run audit:desktop
```

This launches an isolated Lighthouse browser, writes `artifacts/lighthouse-desktop.json`, and checks desktop performance ≥85 and CLS 0. Audit artifacts and screenshots are intentionally ignored by Git.

## Scenes

1. **The beginning:** the cape artwork, “Beyond fear. Beyond limits.”, clear prototype limits, and four trust principles.
2. **The possibilities:** six keyboard-accessible feature tabs, mirrored by a floating 3D card ring.
3. **Your own pace:** four scroll stops, using the existing process-step copy and illuminated stair landings.
4. **Care comes first:** cooler lighting, slower ambient movement, clear AI/data boundaries, and crisis signposting.
5. **A new perspective:** mountain sunrise and an optional local educational preview.

The 3.5-second intro runs once per browser-tab session, after the base scene is ready. It never blocks reading or navigation. Scrolling, pausing, hiding the scene, or enabling reduced motion ends it immediately.

## Structure and configuration

```text
src/app/                    App Router, local fonts, metadata, responsive CSS
src/components/journey/     Semantic HTML, navigation, sections, local preview
src/components/world/       Canvas, camera, terrain, stairs, artwork, cards,
                            particles, effects, optional model loader
src/config/scene.ts          Palette, camera keyframes, motion, lighting,
                            effects, image depth, quality, and model budgets
src/lib/                    Scene/artwork math, material fades, model validation
src/i18n/                   English/Ukrainian language selection and translations
src/store/                  Small transient scene store
src/data/                   Preserved copy and local demonstration rules
tests/                      Scene, artwork, opacity, safety, model, contrast tests
scripts/                    Bundle and Lighthouse gates
public/models/              Optional model contract, no model required
public/draco/               Instructions for a local decoder
```

Start visual tuning in **`src/config/scene.ts`**. The layout receives its CSS palette from that file. Responsive typography and panel layout live in `src/app/globals.css`. Camera stops are paired with semantic section positions, rather than a fixed assumed page height.

Legacy presentation components, data, `src/App.tsx`, `src/main.tsx`, `vite.config.ts`, and `FearlessU_Presentation_Website/` remain as reference material. They are not entry points for the current Next.js site. Vite is no longer installed.

## Language and typography

The language control switches between English and Ukrainian, including page metadata, and remembers the choice locally. Without a saved choice, a Ukrainian browser preference selects Ukrainian after hydration. The static HTML starts in English.

Editorial headings use locally bundled Cormorant Garamond, including regular and italic Cyrillic fonts. Both Cyrillic files are preloaded to reduce late font swapping; no remote font service is needed. Responsive heading sizes accommodate the longer Ukrainian copy.

## Rendering and performance

- HTML and the original-image/CSS poster render independently of WebGL.
- The initial depth-aware artwork and particles are lazy-loaded and use asynchronous shader preparation. Hidden terrain, stairs, the figure, and glass load only when scrolling toward the landscape.
- The original artwork stays visible until landscape shaders are ready, including after a fast jump to a later chapter. The landscape stays mounted for smooth backward navigation.
- Expensive transmission and postprocessing activate when the visitor reaches the procedural journey, not over the fully opaque hero image.
- Six desktop glass cards share one small refraction buffer. Stairs use instancing; particles use one point-cloud draw call.
- Desktop hero text sits directly over the artwork, without a panel background or blur. A feathered scrim preserves contrast, including a wider tablet treatment. On mobile, a shorter artwork frame sits above the copy and fades into its dark reading background.
- The static poster and WebGL image share configurable focal points and responsive frame dimensions. Framing keeps the figure and sunlit valley visible; depth is calculated in source-image coordinates so it does not shift onto unrelated objects when the viewport changes.
- The artwork-only canvas starts at DPR ≤1 to limit render-buffer cost. The landscape restores the selected quality tier's DPR once it is ready. HTML text is unaffected.
- Ridged terrain uses smooth normals and elevation/slope-based rock and snow colors. Beveled stone treads and glass reflect a small, locally generated environment map, captured once rather than every frame. No HDR download is needed.
- Landscape fades multiply each material's authored opacity instead of making translucent beams and ground overlays fully opaque. Material lookup is captured once, not traversed on every frame.
- Desktop: DPR capped at 1.5, 1,200 particles, transmission, subtle bloom/DOF/vignette/grain.
- Mobile: DPR capped at 1.15, 320 particles, simpler glass, no depth of field.
- Low tier: DPR capped at 0.85, 160 particles, no postprocessing or transmission. The absolute configurable DPR ceiling is 2.
- Sustained slow frames lower quality. Resizing applies the mobile tier without upgrading an already degraded low tier.
- Scroll refreshes update Lenis's cached dimensions without resetting an active anchor animation, keeping navigation aligned after desktop/mobile resizing.
- Reduced motion, save-data, ≤2 reported GB of memory, ≤2 reported CPU threads, or unavailable WebGL2 select the static presentation.
- Hidden/offscreen canvases stop rendering. **Pause ambient motion** uses on-demand rendering so navigation and feature changes still work.
- Failed assets, lost contexts, and a loading watchdog preserve the HTML/poster. R3F releases the renderer; handmade geometries, card textures, render targets, effect resources, and optional-model resources have cleanup paths.

The bundle gate counts **HTML-linked/preloaded scripts, legacy nomodule polyfills, and inline bootstrap JavaScript**. Emitted lazy graphics, scroll-controller, model, and preview chunks are reported separately. It does not pretend those deferred downloads are free. See `artifacts/bundle-budget.json` for exact files and compressed sizes.

## Optional Draco/glTF model

No external model or decoder is requested by the default site. To replace the procedural silhouette, follow `public/models/README.md` and `public/draco/README.md`.

Use a licensed, self-contained `.glb` below 1.5 MB, set `sceneConfig.models.figure`, and provide a local Draco decoder only if the GLB uses Draco. The lazy loader enforces the byte limit and local path, rejects external texture/buffer references, disposes decoder workers, and falls back to the silhouette on failure. No optional model is supplied.

## Educational preview, privacy, and limits

The preview contains three predefined goals, a difficulty slider, an explained optional step, an illustrative reflection, and a repeat/preparation/pause choice. High difficulty keeps suggestions with private preparation. Closing the dialog clears the entries and restores focus.

- No live AI model, diagnosis, clinical suitability decision, or outcome prediction.
- No free-text risk screening. Crisis guidance is always visible before the controls.
- No form transmission, analytics, account, database, or health-data storage.
- Demo choices remain in component memory. Browser storage contains only the non-personal `sessionStorage` intro-played flag and `localStorage` language preference.
- The proposed AI and four-step workflow remain concepts, not validated clinical capabilities.

**Experimental prototype. Not clinically validated. Not medical advice.** The site is not a healthcare provider, medical device, or emergency service, and does not replace qualified care. It makes no clinical efficacy, regulatory, certification, institutional partnership, or accelerator-acceptance claim.

If someone may be in immediate danger or at risk of harming themselves or another person, they should contact local emergency services or an appropriate crisis service. The page links to the global Find A Helpline directory without guessing the visitor's country.

Any future backend, model integration, or research involving therapeutic interventions requires separate intended-use, privacy, security, professional-review, and clinical/ethical validation work. Never place provider credentials in `NEXT_PUBLIC_` variables.

## Accessibility

All essential copy and controls are semantic HTML, outside the decorative canvas. The site includes a skip link, visible focus, roving Arrow/Home/End feature tabs, native range/select controls, a native modal dialog, focus restoration, and live result announcements. Trust labels are at least 14 px and disclaimer chips at least 13 px.

Reduced-motion preferences apply both on load and when changed. Reading panels remain conservatively opaque; the transparent hero uses a feathered scrim instead. Palette tests check AA text contrast even over a white backdrop. Automated scores are not a substitute for a complete screen-reader or accessibility-conformance review.

## GitHub Pages

The existing workflow builds `out/` with:

```text
NEXT_PUBLIC_BASE_PATH=/FearlessU-accelerator-presentation
```

The workflow derives the name from the destination repository, runs tests and the bundle gate, and publishes its Pages artifact. Repository Pages must already be configured to use GitHub Actions. Do not change the existing `origin` remote just to publish this project to another authorized repository.

## Verification and remaining limits

See **`PLAN.md`** for the phase record. Local checks cover build/lint/types, scene-math tests, desktop/mobile screenshots, keyboard controls, the local reflection flow, forward/backward scrolling, reduced motion, simulated no-WebGL/low-memory conditions, context loss, and pause/offscreen behavior.

The current English desktop lab run reached **97 performance / 100 accessibility / 100 best practices / 100 SEO**, with **CLS 0**. Initial JavaScript is **209.1 kB gzip** (209.2 kB with the Pages prefix), below 250 kB; emitted deferred chunks total approximately **383.3 kB gzip**. Both exports passed lint, TypeScript, all **20 tests**, the bundle gate, and the full release browser checks.

The prefixed export also passed **76 detailed checks** covering both languages, widths from 320 to 1440 px, keyboard controls, Cyrillic font rendering, and sampled hero contrast. Axe reported no violations in the tested English desktop, Ukrainian mobile, and Ukrainian dialog states. Page gradient contrast remained incomplete in axe; supplemental pixel-based hero samples met their contrast thresholds. These checks do not establish whole-site accessibility conformance.

Current local reports include `artifacts/lighthouse-design-complete.json`, `artifacts/design-bounds-final-release-qa.json`, `artifacts/design-pages-final-release-qa.json`, and `artifacts/design-pages-final-report.json`. See `PLAN.md` for historical results and test scope.

Remaining limits:

- Real iOS/Android hardware, Safari/Firefox, assistive-technology sessions, and long-duration GPU/battery behavior have not been validated.
- Cold Ukrainian visits still show small layout movement while the saved/browser language is applied after English static HTML. With preloaded Cyrillic fonts, observed layout-shift totals were approximately 0.0112 on mobile and 0.0228 on desktop. These are local observations, not field CLS measurements or a zero-shift guarantee.
- Short desktop Chromium samples measured 56 FPS for the root export and 60 FPS for the prefixed export. They do not establish sustained or real-phone FPS.
- Optional GLB/Draco assets and a live GitHub Pages deployment need their own verification when enabled.
- Dependency-audit results in `PLAN.md` are historical. No fresh dependency audit was run for this design refinement.
- TypeScript 6 is pinned for the installed TypeScript-ESLint compatibility range. The preview server's `compression` patch override addresses its known advisory.
