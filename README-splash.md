# Xthings splash overlay

Startup overlay for the DSH Electron shell. The host inlines both files (one `<style>` row plus three
`<script>` rows), so nothing is fetched and it works unchanged from `file://`:

- `assets/splash.js` — IIFE, idempotent, never throws. Mounts `#xthings-splash`, plays all 180 Lottie
  frames at 1x from `window.lottie` + `__XTHINGS_LAUNCH_DATA__`, then cross-fades out. A missing
  global or a thrown animation falls back to the inlined wordmark. API: `__XTHINGS_SPLASH__.dismiss()`.
- `assets/splash.css` — `xthings-splash-` classes, 320 ms fade, honours `prefers-reduced-motion`.

Dismiss needs all four: (a) `complete`, or the 6 s animation timeout, (b) ≥3000 ms since the first
frame, (c) `__DSH_BOOT_READY__.promise` settled, (d) `[data-dsh-boot]` gone because the app rendered.
Absolute ceiling 8 s, then dismiss anyway; fade 320 ms, then `remove()`.

Try it: `./dev/serve.sh` → http://127.0.0.1:8138/dev/harness.html
`dev/harness.html` is generated — edit `dev/harness.template.html` and run `node dev/build-harness.mjs`.
`?appReady=4200` renders the fake app late, so the overlay visibly waits on gate (d) instead of
fading at 3.0 s.

The wordmark in `assets/wordmark.svg` is also inlined in the JS, so the fallback needs no network.
