# FearlessU, a cinematic journey

A scroll-driven English/Ukrainian product and partner presentation for an **early-stage mental wellness concept**. Six cinematic chapters inside one continuous real-time 3D mountain world lead into an investor/research brief, founder pitch, and direct contact section. Built with Next.js App Router, TypeScript, Tailwind, React Three Fiber, drei, postprocessing, GSAP ScrollTrigger, Lenis, and Zustand.

**The whole journey is a single real-time 3D scene, starting at the hero.** A stylized figure with a wind-simulated cape stands on a suspended stone platform above a procedural valley. Five further platforms, an illuminated staircase, floating glass feature cards, layered ridged mountains, drifting particles, and a low sunrise carry the camera upward as the visitor scrolls. The cape is CPU-simulated cloth, anchored at the shoulders, with gusts that respond to cursor travel. The figure is a generic procedural character, not a reconstruction of any person or photograph. When WebGL is unavailable or unsuitable, the site falls back to a static presentation built around the original cape artwork `public/fearlessu-civilian-cape.webp` (1448×1086, 241,650 bytes). The earlier `public/fearlessu-reference-hero.png`, `public/fearlessu-sunrise-reference.jpg`, and `public/fearlessu-sunrise.webp` remain reference assets, not the selected hero.

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

1. **The beginning:** the caped figure on its platform above the valley, “Beyond fear. Beyond limits.”, a working local-rules mini-demo, clear prototype limits, and four trust principles.
2. **The possibilities:** six keyboard-accessible feature tabs, mirrored by a floating 3D card ring.
3. **How the AI fits:** a status-labeled architecture map separating local prototype rules, visible but limited safety boundaries, and future expert-reviewed components.
4. **Your own pace:** four scroll stops, using the existing process-step copy and illuminated stair landings.
5. **Care comes first:** cooler lighting, slower ambient movement, clear AI/data boundaries, and crisis signposting.
6. **A new perspective:** mountain sunrise and an optional local educational preview.

The 3.5-second intro runs once per browser-tab session, after the base scene is ready. It never blocks reading or navigation. Scrolling, pausing, hiding the scene, or enabling reduced motion ends it immediately.

## For investors and research partners

The scenic chapters include a visual, status-labeled architecture map that separates local prototype rules, visible but limited safety boundaries, and future expert-reviewed components. The flow shows goal selection, a bounded example, CBT-informed skills, safety, and user-chosen reflection without implying that a live AI system exists.

The separate **For Investors & Research Partners** section (`#investors`) covers the problem, an initial adult-university-student beachhead and possible wellbeing/student-success buyer, monetization hypotheses, proposed design differences to test, staged validation, project evidence, and a direct request for partners. The competitive framing is explicitly a hypothesis, not a benchmark or moat claim.

- **Built Today:** three fixed goals, local recommendation rules, a selectable illustrative result, reflection, preparation/repeat/pause choices, bilingual controls, and static rendering fallback.
- **Planned Next:** user/buyer interviews, usability testing, qualified review, privacy architecture, constrained-AI evaluation, and a reviewed pilot proposal.
- **Research Ambitions:** original CBT-inspired exercise candidates and trauma-informed/PTSD-related research with qualified collaborators. These are not available treatments or validated therapies.

The first proposed usability study is clearly marked **not recruited** and non-clinical. It names an adult-student sample hypothesis, prototype tasks, consent/ethics gates, and the interaction and accessibility measures to report. No user interviews, usability sessions, or clinical results are claimed as completed.

The site does not invent users, revenue, testimonials, market-size figures, clinical results, or institutional endorsements. The displayed evidence is implementation work. Interviews and usability findings remain future work and should be published with methods and limitations.

The six anchored scenic content chapters move the camera along a six-keyframe 3D path. The partner brief, pitch, and founder sections follow without adding camera stops. The header contact button opens the real contact section, not the local demo.

## Founder and supplied media

The founder section uses the latest supplied JPEG at its original 966×1024 dimensions and aspect ratio, without cropping, retouching, or re-encoding. It also includes the software-engineering background, motivation, and the approved public contacts: **vladkonrad11@gmail.com** and [Vladyslav Konrad on LinkedIn](https://www.linkedin.com/in/vladyslav-konrad).

The self-hosted pitch is **61.233 seconds**, 1280×720 H.264/AAC, approximately **3.66 MB**. Its native player has a poster, keyboard-accessible play control, `preload="none"`, no autoplay, English/Ukrainian subtitle tracks, a transcript, and a download fallback. Caption selection follows the page language until the visitor makes an explicit choice; native track changes also update the selector.

The recording shows an earlier interface and describes intended AI/therapeutic goals. A prominent notice separates that vision from the current local-rules demo and explicitly states that citing established CBT does not validate FearlessU. A separate **12-second silent screen recording** shows the current goal → optional example → simulated result → possible next-choice flow. It has English/Ukrainian subtitles, a poster, no autoplay, and a download link; the captions describe the screen and are not voiceover.

Media optimization and draft transcription were performed locally; the source recording was not uploaded. Captions are lightly edited draft transcriptions, not a certified human-reviewed transcript. The shared 17-cue source lives in `src/data/pitchTranscript.ts`. After editing it, regenerate and verify both WebVTT files:

```sh
npm run captions
npm test
```

Public assets live in `public/media/`. Original intake files and local transcription tooling remain outside the public export.

## Structure and configuration

```text
src/app/                    App Router, local fonts, metadata, responsive CSS
src/components/journey/     Semantic HTML, navigation, sections, local preview
src/components/world/       Canvas, camera, sky, terrain, stairs, platforms,
                            figure and cape cloth, cards, particles, effects,
                            optional model loader
src/config/scene.ts          Palette, camera keyframes, motion, lighting,
                            effects, figure/cloth, quality, and model budgets
src/lib/                    Scene, cloth, and camera math, material fades,
                            model validation, shared WebVTT formatting
src/i18n/                   English/Ukrainian language selection and translations
src/store/                  Small transient scene store
src/data/                   Demo rules, partner brief, bilingual pitch transcript
tests/                      Scene, cloth, spatial, safety, translation, contact/media tests
scripts/                    Bundle/Lighthouse gates and caption generation
public/media/               Pitch, current prototype walkthrough, portrait, posters, and subtitle tracks
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
- The entire 3D world loads as one deferred graphics chunk shortly after first paint, so the HTML page never waits on WebGL. Sky, terrain, stairs, platforms, the figure and cape, cards, and particles mount together. Shader preparation starts with Three's public compile API, then yields while live GPU programs finish. The wait cancels on unmount and handles disposed programs, context loss, and timeouts without Three's stale-material readiness polling.
- Cloth, terrain, and platform density adapt by quality tier. The cape grid is 30×40 / 22×30 / 16×24 segments on desktop/mobile/low and stays below 1,400 vertices; mountains and platforms reduce subdivisions on lower tiers. No external models, textures, or HDR downloads are used.
- The poster stays visible until the scene's shaders are ready, including after a fast jump to a later chapter. The world stays mounted for smooth backward navigation.
- Postprocessing effects mount only after the visitor scrolls past the opening chapter, and never on the low quality tier.
- Six desktop glass cards share one small refraction buffer, updated at a capped 30 Hz and only while the card scene is on stage. Stairs use instancing; particles use one point-cloud draw call.
- The cape integrates wind and pointer-travel gusts only while the scene runs. Pausing, hiding the page, or scrolling past the figure's chapter stops cloth updates entirely.
- Hero copy sits over the live scene behind a feathered gradient scrim, with a wider tablet treatment. Reading panels stay 96–97% opaque with layered depth shadows, so text remains legible in front of the moving world.
- The static poster keeps the original artwork with responsive framing. On narrow screens the camera applies a view offset so the figure and staircase stay in frame instead of being cropped away.
- The camera follows a six-keyframe path with damped scroll progress. Pointer parallax is frozen while rendering is paused.
- Ridged terrain uses smooth normals and elevation/slope-based rock and snow colors. Beveled stone treads and glass reflect a small, locally generated environment map, captured once rather than every frame. No HDR download is needed.
- Landscape fades multiply each material's authored opacity instead of making translucent beams and ground overlays fully opaque. Material lookup is captured once, not traversed on every frame.
- Desktop: DPR capped at 1.5, 1,200 particles, transmission, subtle bloom/DOF/vignette/grain.
- Mobile: DPR capped at 1.15, 320 particles, simpler glass, no depth of field.
- Low tier: DPR capped at 0.85, 160 particles, no postprocessing or transmission. The absolute configurable DPR ceiling is 2.
- Sustained slow frames lower quality. Resizing applies the mobile tier without upgrading an already degraded low tier.
- Scroll refreshes update Lenis's cached dimensions without resetting an active anchor animation, keeping navigation aligned after desktop/mobile resizing.
- Reduced motion, save-data, ≤2 reported GB of memory, ≤2 reported CPU threads, or unavailable WebGL2 select the static presentation.
- Hidden/offscreen canvases stop rendering. Visibility follows the actual scenic content rather than the fixed canvas host, so the canvas also stops behind the opaque partner, pitch, and founder sections. **Pause ambient motion** uses on-demand rendering so navigation and feature changes still work.
- Failed assets, lost contexts, and a loading watchdog preserve the HTML/poster. R3F releases the renderer; handmade geometries, card textures, render targets, effect resources, and optional-model resources have cleanup paths.

The bundle gate counts **HTML-linked/preloaded scripts, legacy nomodule polyfills, and inline bootstrap JavaScript**. Emitted lazy graphics, scroll-controller, model, and preview chunks are reported separately. It does not pretend those deferred downloads are free. See `artifacts/bundle-budget.json` for exact files and compressed sizes.

## Optional Draco/glTF model

No external model or decoder is requested by the default site. To replace the procedural figure, follow `public/models/README.md` and `public/draco/README.md`.

Use a licensed, self-contained `.glb` below 1.5 MB, set `sceneConfig.models.figure`, and provide a local Draco decoder only if the GLB uses Draco. The lazy loader enforces the byte limit and local path, rejects external texture/buffer references, disposes decoder workers, and falls back to the procedural figure on failure. No optional model is supplied.

## Educational preview, privacy, and limits

The first-screen fragment uses the same local rules as the full preview. It immediately updates an optional step when the visitor changes a fixed goal or difficulty. Its launch button carries those choices into the dialog. On a 390×844 viewport, the initial controls and recommendation fit on the first screen; very short screens show the goal control first and continue below the fold.

The full preview adds an explanation, illustrative reflection, and a repeat/preparation/pause choice. High difficulty keeps suggestions with private preparation. Closing the dialog clears its entries and restores focus. The hero's separate in-memory selections remain until the page is reloaded.

- No live AI model, diagnosis, clinical suitability decision, or outcome prediction.
- No free-text risk screening. The full dialog shows crisis guidance before its controls; the first-screen fragment clearly identifies local rules and links to safety/support.
- No form transmission, analytics, account, database, or health-data storage.
- Demo choices remain in component memory. Browser storage contains only the non-personal `sessionStorage` intro-played flag and `localStorage` language preference.
- The proposed AI and four-step workflow remain concepts, not validated clinical capabilities.

**Experimental prototype. Not clinically validated. Not medical advice.** The site is not a healthcare provider, medical device, or emergency service, and does not replace qualified care. It makes no clinical efficacy, regulatory, certification, institutional partnership, or accelerator-acceptance claim.

If someone may be in immediate danger or at risk of harming themselves or another person, they should contact local emergency services or an appropriate crisis service. The page links to the global Find A Helpline directory without guessing the visitor's country.

Any future backend, model integration, or research involving therapeutic interventions requires separate intended-use, privacy, security, professional-review, and clinical/ethical validation work. Never place provider credentials in `NEXT_PUBLIC_` variables.

## Accessibility

All essential copy and controls are semantic HTML, outside the decorative canvas. The site includes a skip link, visible focus, roving Arrow/Home/End feature tabs, native range/select controls, a native modal dialog, focus restoration, and live result announcements. Trust labels are at least 14 px and disclaimer chips at least 13 px.

Reduced-motion preferences apply both on load and when changed. Reading panels remain conservatively opaque; the hero copy uses a feathered scrim over the live scene instead. Palette tests check AA text contrast even over a white backdrop. Automated scores are not a substitute for a complete screen-reader or accessibility-conformance review.

## GitHub Pages

The existing workflow builds `out/` with:

```text
NEXT_PUBLIC_BASE_PATH=/FearlessU-accelerator-presentation
```

The workflow derives the name from the destination repository, runs tests and the bundle gate, and publishes its Pages artifact. Repository Pages must already be configured to use GitHub Actions. Do not change the existing `origin` remote just to publish this project to another authorized repository.

## Verification and remaining limits

See **`PLAN.md`** for the phase record. Local checks cover build/lint/types, scene and cloth math tests, desktop/mobile screenshots, keyboard controls, the local reflection flow, forward/backward scrolling, reduced motion, simulated no-WebGL/low-memory conditions, context loss, and pause/offscreen behavior.

The current build passed ESLint, strict TypeScript, and all **41 tests** (34 existing plus 7 new spatial/cloth tests). Initial JavaScript is **232.7 kB gzip** against the 250 kB budget; emitted deferred chunks total **378.7 kB gzip** (`artifacts/bundle-budget.json`).

The current release suite ran in an isolated Chrome window against the production export and passed **70 checks with 0 failures** (`artifacts/spatial-release-report.json`): actual WebGL rendering, pause and page-hide stopping all draws, exact 2 px anchor landings across 21 anchor checks at desktop and mobile widths, six English layouts (1440/1280/1920/390/320/667) and Ukrainian bounds at 390/320/667 without horizontal overflow, first-screen demo controls, keyboard feature tabs and range input, dialog example carry-over and Escape focus restoration, reflection stop behavior, mobile menu dismissal, media preload and native controls, founder portrait geometry, and the reduced-motion, no-WebGL, low-memory, and context-loss fallbacks. Three axe runs (English desktop, English mobile dialog, Ukrainian mobile) reported **0 violations**; `color-contrast` and `video-caption` remain incomplete in axe, so this is not a full conformance assessment. The intro measured **3.476 seconds** and did not repeat. Short desktop Chromium samples averaged about **60 FPS** at the hero and **58 FPS** in the product scene, with zero draws while paused or hidden; these are lab samples, not sustained or real-phone measurements.

The current real-time 3D build was audited twice against the root export in isolated headless Chrome 157 (`artifacts/lighthouse-spatial.json`, `artifacts/lighthouse-spatial-2.json`). Accessibility, best practices, and SEO scored **100** with **CLS 0** both times, but desktop **performance scored 48 and 56**, below the configured ≥85 gate. FCP was about 0.8 s and LCP 1.4–2.3 s; total blocking time was 4.1–5.5 s, dominated by evaluation of the deferred 3D graphics chunk and scene/shader setup during the load trace. This is the direct cost of building the full 3D world at the hero instead of deferring it until scrolling: the historical scores below come from a design where the audit never paid that cost. Host CPU benchmark indices (1,729.5 and 791) also varied widely between runs, so treat these as noisy local lab measurements, not field data. Live-render samples in the release suite still averaged about 60 FPS, so the blocking time is a startup cost, not sustained runtime jank. **`npm run audit:desktop` currently fails its ≥85 performance gate.** Reducing startup blocking (for example staggered scene construction or idle-time shader preparation) is identified future work that needs its own verification.

The results below are **historical**: they describe the site before the real-time 3D rework and are kept for the record.

The last pre-rework root-export Lighthouse run scored **95 performance / 100 accessibility / 100 best practices / 100 SEO**, with FCP 305 ms, LCP 1,081 ms, TBT 140 ms, and CLS 0. Repeated desktop runs of identical code ranged from 84 to 95 as blocking time varied, so Lighthouse was treated as a noisy local lab measure. Initial JavaScript was **232.5 kB gzip**; emitted deferred chunks totaled **380.5 kB gzip**.

The previous optimized Pages export reached **91 performance / 100 accessibility / 100 best practices / 100 SEO**, with CLS 0, LCP 1.062 s, and TBT 202 ms. An earlier Pages audit failed at 60; both shader preparation and mesh density were subsequently improved. The host CPU benchmark also changed, so the score difference is not attributable solely to code.

Before the final graphics optimization, both root and Pages exports passed **132 partner/media checks**, scenic release checks, and **76 detailed interface checks**. The optimized Pages export then passed the **132 checks and scenic release suite again**, with no application errors or failed resources. Final optimization reports are `artifacts/lighthouse-partner-optimized.json`, `artifacts/partner-optimized-report.json`, and `artifacts/partner-optimized-release-qa.json`. Earlier root, Pages, cold-load, and failed-audit reports are retained locally. See `PLAN.md` for their names and test scope.

Remaining limits:

- Real iOS/Android hardware, Safari/Firefox, assistive-technology sessions, and long-duration GPU/battery behavior have not been validated.
- No user interviews, usability sessions, or clinical studies have been conducted. The proposed sample and protocol are planning details, not research results.
- Cold Ukrainian visits still show layout movement while the saved/browser language is applied after English static HTML. Current isolated samples observed accumulated shifts of approximately 0.0979 on mobile and 0.0501 on desktop, versus 0 in the English samples. These are local observations, not field CLS measurements or a zero-shift guarantee.
- The release suite's frame samples are short desktop Chromium runs (about 60 FPS hero, 58 FPS product scene). They are not sustained or real-phone FPS measurements.
- The desktop Lighthouse performance gate (≥85) currently fails on the 3D build (48/56 across two runs); see the Lighthouse paragraph above. The gate configuration was not weakened.
- A Three.js X4122/X4008 HLSL shader-precision warning appears while shaders compile on the test GPU/driver. Its source is undiagnosed and possibly driver-generated; the site reports it rather than suppressing it, and it had no observed visual effect in the checked scenes.
- No Pages-prefix export or deployment check was run for the 3D rework. The last verified Pages export predates it and must be re-verified before any publication.
- Optional GLB/Draco assets and a live GitHub Pages deployment need their own verification when enabled.
- Dependency-audit results in `PLAN.md` are historical. No fresh dependency audit was run for this phase.
- TypeScript 6 is pinned for the installed TypeScript-ESLint compatibility range. The preview server's `compression` patch override addresses its known advisory.
