# Mobile optimization notes

Reported by Jacob, 2026-10-29: on iPhone the app appears almost static, with little or no animation. Device/iOS version, browser and motion preference are not yet known. This is a reported symptom, not a confirmed diagnosis.

## First priority: explain missing animation

- Inspect `hooks/use-reduced-motion.ts`: it reads `prefers-reduced-motion: reduce`, with a true server fallback. Earth rotation/water, Moon orbit, text orbit and UFO effects intentionally reduce or stop when active. This is the strongest code-supported explanation for a fully rendered but static scene; confirm the actual phone preference before changing behavior.
- Compare a real iPhone with motion preference enabled and disabled. Preserve the accessibility preference; consider an explicit, quiet motion control if visitors need to choose animation within the app.
- If reduced motion is false, inspect Safari frame scheduling and demand-render invalidation. Verify movement continues after loading, touch release, returning from background, and screen unlock. Check console errors and WebGL context loss.
- Separate low frame rate from intentionally paused motion. Measure representative animation intervals, not only screenshots. Browser emulation does not validate iPhone GPU/Safari behavior.

## Touch interactions

- Object dragging takes one finger and sets canvas touch-action:none. The tour currently requires a two-finger vertical gesture; the desktop wording says scroll and does not teach that gesture. A one-finger swipe over empty space currently has no tour action.
- Define a simple gesture map before implementation: single-finger object drag, an explicit way to move through tour stops, and separate pinch behavior where useful.
- Test adding/removing the second finger, pointer cancellation, lost capture, touches leaving the canvas, browser edge gestures and return from background. Tour/zoom have independent touch maps; review ownership and cleanup together with object dragging.
- Flight remains keyboard-driven; a full mobile flight experience needs intentional touch controls. Removing the flight-deck overlay does not add mobile flight controls.

## Layout and performance

- Test narrow portrait and landscape, rotating the phone and Safari toolbar expansion/collapse. The scene uses 100dvh, so viewport changes can reframe the scene and resize model layouts.
- Check safe-area spacing for all bottom controls and hints. The hint uses fixed bottom:72px while the buttons use a safe-area calculation; they can overlap. Test Netlify badge placement as well.
- Keep text readable and buttons at least44px. Preserve a clean opening view without the flight-deck panel.
- Profile real-device frame time and memory for terrain, water, text instance updates, reflections, shader compilation and projectiles. Current adaptive DPR is already capped; measure before reducing geometry or effects.
- Verify slow loading, load failure/retry, reduced motion, background/resume and thermal slowdown. Check at least one older iPhone alongside a current device.

## Current scope

Removed the old flight-deck panel; the newly approved arcade HUD is now implemented with responsive stacking and safe-area spacing. The original reusable panel remains on the UFO preview. Real-device layout, motion and touch interaction review is still pending. Mobile diagnosis/optimization items above are notes, not implemented changes. No real-iPhone performance or motion reproduction has been completed.
