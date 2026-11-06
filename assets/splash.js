/*!
 * Xthings splash overlay — DeepSeek Harness (DSH) Electron shell.
 *
 * Classic (non-module) script. The DSH host injects it as an INLINE <script>
 * at the end of <body>, after these two globals (in this order):
 *
 *   <script>  lottie-web 5.12.2 build (assets/lottie.min.js)  </script>
 *   <script>  globalThis.__XTHINGS_LAUNCH_DATA__ = {…launch.json…} </script>
 *
 * It reads only those globals and never fetches, so it works unchanged from
 * file:// in the packaged Electron app (no HTTP route, no CDN).
 *
 * Contract: play the 800x500 / 60 fps / 180 frame animation at 1x, once, to
 * the end; hold the finished lockup for 600 ms; stay mounted for at least
 * 3000 ms of playback, until
 * window.__DSH_BOOT_READY__.promise settles, and until the app has actually
 * rendered (its own [data-dsh-boot] splash is gone); hard cap 8000 ms; then
 * cross-fade out over 320 ms and remove the node. Never throws, never blocks.
 */
(function () {
  'use strict';

  var ROOT = (typeof globalThis !== 'undefined') ? globalThis : window;
  var DOC = ROOT && ROOT.document;

  if (!DOC) { return; }
  // Idempotent: a second execution of this file must not mount a second overlay.
  if (ROOT.__XTHINGS_SPLASH__) { return; }

  /* --------------------------------------------------------------- config */

  var MIN_PLAY_MS = 3000;       // 180 frames @ 60 fps at 1x
  var LOCKUP_HOLD_MS = 600;     // dwell on the finished lockup before fading out
  var HARD_TIMEOUT_MS = 6000;   // (a) safety net if 'complete' never arrives
  var APP_READY_MAX_MS = 8000;  // (d) hard cap on waiting for the app to render
  var APP_POLL_MS = 60;         // (d) [data-dsh-boot] poll interval
  var FADE_MS = 320;            // cross-fade out
  var FALLBACK_HOLD_MS = 3000;  // static wordmark dwell when Lottie is unavailable
  var BOOT_WAIT_MAX_MS = 3000;  // extra cap while awaiting __DSH_BOOT_READY__.promise

  // Official Xthings wordmark (assets/wordmark.svg), inlined so the fallback
  // needs no network. Replaced verbatim at build/ship time — do not reformat.
  var WORDMARK_SVG = "<svg xmlns=\"http://www.w3.org/2000/svg\" fill=\"none\" viewBox=\"0 0 124 37\" height=\"37\" width=\"124\"> <path fill=\"#111111\" d=\"M96.3279 9.31738C97.8788 9.31746 99.2824 9.70301 100.55 10.4697L100.555 10.4736L100.562 10.4766C101.052 10.7544 101.504 11.0807 101.917 11.4561V9.33301H105.602V27.9609C105.602 29.6426 105.243 31.1479 104.515 32.4668C103.787 33.8096 102.739 34.8583 101.377 35.6074C100.034 36.3579 98.4731 36.7265 96.7059 36.7266C94.3002 36.7266 92.2675 36.1584 90.6307 34.999C89.2257 34.0038 88.3094 32.6927 87.8875 31.0801L91.2322 29.8496L91.3162 30.084C91.6082 31.0573 92.2004 31.8442 93.1092 32.4492L93.199 32.5078L93.201 32.5088L93.2029 32.5107C94.1615 33.1429 95.324 33.4668 96.7059 33.4668C98.2609 33.4668 99.498 32.9821 100.449 32.0312L100.451 32.0303L100.452 32.0283C101.415 31.085 101.917 29.7454 101.917 27.9609V26.1025C101.501 26.4878 101.048 26.8267 100.555 27.1182C99.2869 27.8538 97.8815 28.2245 96.3279 28.2246C94.775 28.2246 93.3695 27.8542 92.1024 27.1191C90.8398 26.3543 89.8271 25.2671 89.0652 23.8438C88.3078 22.3959 87.9198 20.6853 87.9197 18.6973C87.9198 16.7432 88.3066 15.0672 89.0623 13.6533C89.8242 12.2281 90.8367 11.1573 92.0975 10.4248C93.3659 9.68797 94.7731 9.31744 96.3279 9.31738ZM42.5164 11.5977C43.0572 11.004 43.7111 10.5195 44.4754 10.1455H44.4774L44.4783 10.1445C45.5924 9.6107 46.8293 9.34668 48.1815 9.34668C49.6037 9.34675 50.899 9.65673 52.0594 10.2822L52.1688 10.3408C53.2891 10.9508 54.1646 11.8578 54.7947 13.0498C55.4697 14.2848 55.7986 15.7719 55.7986 17.4961V28.2217H52.119V17.9277C52.1189 16.1673 51.6784 14.882 50.8524 14.0156L50.8514 14.0146L50.8504 14.0127C50.02 13.1216 48.8782 12.6621 47.3836 12.6621C45.8683 12.6622 44.6914 13.1329 43.8152 14.0498C42.9675 14.9602 42.5165 16.3114 42.5164 18.1602V28.2217H38.8035V2.95801H42.5164V11.5977ZM63.3387 28.2197H59.6248V9.33203H63.3387V28.2197ZM116.607 9.31738C118.683 9.31739 120.395 9.8262 121.713 10.874C122.806 11.7436 123.475 12.8799 123.728 14.2617L120.14 15.5254L120.118 15.2129C120.058 14.378 119.712 13.725 119.081 13.2285L119.079 13.2266L119.077 13.2256C118.47 12.7322 117.626 12.4668 116.508 12.4668C115.468 12.4668 114.683 12.6826 114.118 13.0791C113.56 13.4706 113.298 13.9626 113.298 14.5781C113.298 15.077 113.455 15.473 113.762 15.79C114.123 16.1192 114.57 16.3957 115.106 16.6162C115.691 16.8254 116.498 17.069 117.531 17.3457C118.846 17.691 119.925 18.0389 120.765 18.3906C121.634 18.7327 122.375 19.2566 122.984 19.959L123.046 20.0293C123.667 20.7558 123.977 21.6819 124 22.7803V22.7871C124 23.8193 123.703 24.7556 123.107 25.5859C122.513 26.415 121.674 27.0624 120.607 27.5342L120.603 27.5361C119.554 27.9877 118.353 28.2089 117.007 28.209C115.572 28.209 114.273 27.9774 113.116 27.5068L113.113 27.5059L113.111 27.5039C111.958 27.0123 111.032 26.3362 110.349 25.4697L110.347 25.4678L110.346 25.4658C109.858 24.8295 109.543 24.1893 109.368 23.4268L113.002 22.1465L113.03 22.3682C113.109 23.1508 113.478 23.7863 114.157 24.29C114.857 24.7931 115.786 25.0595 116.972 25.0596C118.077 25.0596 118.903 24.8223 119.488 24.3877C120.075 23.9517 120.349 23.4245 120.349 22.7871C120.349 22.4518 120.273 22.1781 120.134 21.9541C119.994 21.73 119.778 21.5358 119.47 21.377L119.466 21.375L119.463 21.373C118.794 21.0089 117.733 20.642 116.257 20.2793H116.255L116.254 20.2783C114.894 19.9329 113.77 19.5854 112.887 19.2344L112.882 19.2324L112.876 19.2305C111.987 18.8454 111.216 18.2897 110.563 17.5674L110.559 17.5635L110.556 17.5586C109.896 16.777 109.58 15.7736 109.58 14.5781C109.58 13.6051 109.881 12.7108 110.475 11.9043C111.07 11.0975 111.909 10.4726 112.973 10.0234C114.045 9.54976 115.259 9.3174 116.607 9.31738ZM76.326 9.31738C78.6155 9.31746 80.5002 10.0189 81.9471 11.4424C83.4052 12.8547 84.1092 14.882 84.1092 17.4668V28.208H80.4295V17.8984C80.4295 16.1381 79.9898 14.8528 79.1639 13.9863L79.1609 13.9834C78.3307 13.0924 77.1896 12.6319 75.6951 12.6318C74.1796 12.6318 73.0021 13.1025 72.1258 14.0195C71.2779 14.93 70.827 16.2818 70.827 18.1309V28.208H67.1141V9.31934H70.827V11.5645C71.3615 10.9734 72.0038 10.4907 72.7508 10.1172H72.7518L72.7537 10.1162C73.8447 9.58236 75.0375 9.31739 76.326 9.31738ZM29.1346 9.35059H34.8494V13.0488H29.201L29.1346 21.5283C29.1346 22.8037 29.3827 23.6758 29.8777 24.1445C30.373 24.5871 30.9338 24.8085 31.5594 24.8086C31.8461 24.8086 32.2313 24.7913 32.492 24.7393C33.0205 24.6086 33.7877 24.2487 34.0223 24.1445L35.0174 27.209C34.0789 27.5474 33.0485 28.1679 31.0125 28.168C29.4484 28.168 28.0055 27.686 26.9627 26.7227C25.946 25.7593 25.4244 24.4185 25.3983 22.7002V2.95801H29.1346V9.35059ZM96.7303 12.5869C95.787 12.587 94.9334 12.8295 94.1639 13.3115C93.399 13.7907 92.7843 14.4905 92.3221 15.4229C91.8635 16.3478 91.6288 17.4444 91.6287 18.7227C91.6287 20.0231 91.8645 21.1427 92.324 22.0898C92.7861 23.0208 93.4001 23.7321 94.1658 24.2324C94.9347 24.7133 95.7881 24.956 96.7303 24.9561C97.6728 24.956 98.5257 24.7126 99.2947 24.2314C100.081 23.7305 100.704 23.0197 101.166 22.0898C101.626 21.1419 101.86 20.0331 101.86 18.7549C101.86 17.4765 101.625 16.3801 101.167 15.4551C100.706 14.5247 100.083 13.8244 99.2986 13.3447L99.2957 13.3428L99.2918 13.3408C98.523 12.8392 97.6712 12.587 96.7303 12.5869ZM63.3279 6.70898H59.577V2.95801H63.3279V6.70898Z\"></path> <path fill=\"#111111\" d=\"M0.28059 5.33081C0.15964 5.33081 0.0867676 5.46481 0.152507 5.56634L14.7136 28.0539C14.7604 28.1262 14.8408 28.1699 14.927 28.1699H19.5164C19.6371 28.1699 19.7101 28.0364 19.6448 27.9349L5.19632 5.44765C5.14953 5.37483 5.06892 5.33081 4.98236 5.33081H0.28059Z\" clip-rule=\"evenodd\" fill-rule=\"evenodd\"></path> <path fill=\"#0068B7\" d=\"M11.3051 11.6762C11.2998 11.668 11.2996 11.6575 11.3046 11.6492L18.2491 0.123072C18.2951 0.0466971 18.3777 0 18.4669 0H23.4708C23.5923 0 23.6651 0.135144 23.5982 0.236597L13.6827 15.2718C13.6726 15.2871 13.6501 15.287 13.6401 15.2716L11.3051 11.6762Z\" clip-rule=\"evenodd\" fill-rule=\"evenodd\"></path> <path fill=\"#0068B7\" d=\"M0.331492 28.1615C0.210142 28.1615 0.137346 28.0267 0.203893 27.9253L6.46083 18.3843C6.47083 18.369 6.49317 18.3689 6.50327 18.3841L8.90401 21.9937C8.90946 22.0019 8.90969 22.0125 8.90459 22.0209L5.2665 28.0388C5.22044 28.115 5.1379 28.1615 5.04887 28.1615H0.331492Z\" clip-rule=\"evenodd\" fill-rule=\"evenodd\"></path> </svg>";

  /* ---------------------------------------------------------------- state */

  var st = {
    mounted: false,
    dismissed: false,
    dismissedBy: '',
    el: null,
    stage: null,
    anim: null,
    prevOverflow: '',
    overflowLocked: false,
    mountTime: 0,
    playStart: 0,
    playStarted: false,
    animComplete: false,
    hardTimeout: false,
    timers: []
  };

  function now() {
    try {
      if (ROOT.performance && typeof ROOT.performance.now === 'function') {
        return ROOT.performance.now();
      }
    } catch (e) { /* ignore */ }
    return Date.now();
  }

  function later(fn, ms) {
    var id = ROOT.setTimeout(function () {
      try { fn(); } catch (e) { /* never throw into the timer queue */ }
    }, ms > 0 ? ms : 0);
    st.timers.push(id);
    return id;
  }

  function clearTimers() {
    for (var i = 0; i < st.timers.length; i += 1) {
      try { ROOT.clearTimeout(st.timers[i]); } catch (e) { /* ignore */ }
    }
    st.timers = [];
  }

  function prefersReducedMotion() {
    try {
      return !!(ROOT.matchMedia && ROOT.matchMedia('(prefers-reduced-motion: reduce)').matches);
    } catch (e) {
      return false;
    }
  }

  /* ------------------------------------------------------------- overflow */

  function lockOverflow() {
    try {
      if (st.overflowLocked) { return; }
      st.prevOverflow = DOC.documentElement.style.overflow || '';
      DOC.documentElement.style.overflow = 'hidden';
      st.overflowLocked = true;
    } catch (e) { /* ignore */ }
  }

  function restoreOverflow() {
    try {
      if (!st.overflowLocked) { return; }
      DOC.documentElement.style.overflow = st.prevOverflow;
      st.overflowLocked = false;
    } catch (e) { /* ignore */ }
  }

  /* ---------------------------------------------------------------- mount */

  function mount() {
    if (st.mounted) { return true; }
    if (st.dismissed) { return false; }
    if (!DOC.body) { return false; }

    var existing = DOC.getElementById('xthings-splash');
    if (existing) {
      // Someone else already mounted it (or we resumed after a soft reload).
      st.el = existing;
      st.stage = existing.firstChild;
      st.mounted = true;
      return true;
    }

    var el = DOC.createElement('div');
    el.id = 'xthings-splash';
    el.className = 'xthings-splash-root';
    el.setAttribute('aria-hidden', 'true');
    // Critical geometry inline: correct even before splash.css lands.
    el.style.cssText = [
      'position:fixed', 'top:0', 'right:0', 'bottom:0', 'left:0',
      'z-index:2147483000', 'display:flex', 'align-items:center',
      'justify-content:center', 'background:#ffffff', 'opacity:1',
      'transition:opacity ' + FADE_MS + 'ms ease-in-out',
      'will-change:opacity'
    ].join(';') + ';';

    var stage = DOC.createElement('div');
    stage.className = 'xthings-splash-stage';
    stage.style.cssText = [
      'position:relative', 'width:min(800px,72vw)', 'aspect-ratio:8/5',
      'display:flex', 'align-items:center', 'justify-content:center'
    ].join(';') + ';';

    el.appendChild(stage);
    lockOverflow();
    DOC.body.appendChild(el);

    st.el = el;
    st.stage = stage;
    st.mounted = true;
    st.mountTime = now();
    return true;
  }

  /* -------------------------------------------------------------- playback */

  // The host injects both inputs as globals, so there is nothing to fetch.
  function readInputs() {
    var lottie = ROOT.lottie;
    var data = ROOT.__XTHINGS_LAUNCH_DATA__;
    if (!lottie || typeof lottie.loadAnimation !== 'function') { return null; }
    if (!data || typeof data !== 'object' || !data.layers) { return null; }
    return { lottie: lottie, data: data };
  }

  function playAnimation() {
    return new Promise(function (resolve, reject) {
      var settled = false;
      var finish = function (kind) {
        if (settled) { return; }
        settled = true;
        resolve(kind);
      };
      var fail = function (err) {
        if (settled) { return; }
        settled = true;
        reject(err || new Error('xthings splash: animation failed'));
      };

      var inputs = readInputs();
      if (!inputs) {
        // No runtime or no data: go straight to the static wordmark fallback.
        fail(new Error('xthings splash: lottie runtime or launch data missing'));
        return;
      }

      // (a) hard 6 s safety net — a stuck animation must never trap the app.
      later(function () {
        st.hardTimeout = true;
        finish('timeout');
      }, HARD_TIMEOUT_MS);

      var anim;
      try {
        anim = inputs.lottie.loadAnimation({
          container: st.stage,
          renderer: 'svg',
          loop: false,
          autoplay: true,
          animationData: inputs.data,
          rendererSettings: {
            preserveAspectRatio: 'xMidYMid meet',
            progressiveLoad: false,
            hideOnTransparent: true
          }
        });
      } catch (err) {
        fail(err);
        return;
      }

      st.anim = anim;
      try {
        if (typeof anim.setSpeed === 'function') { anim.setSpeed(1); }
        // Anchor the 3000 ms floor to the first rendered frame, so bootstrap
        // latency never eats into the dwell time.
        anim.addEventListener('enterFrame', function () {
          if (!st.playStarted) {
            st.playStarted = true;
            st.playStart = now();
          }
        });
        anim.addEventListener('complete', function () {
          st.animComplete = true;
          finish('complete');
        });
      } catch (err) {
        fail(err);
      }
    });
  }

  /* ------------------------------------------------------------ gate logic */

  // (c) at least 3000 ms since playback started.
  function waitMinPlay() {
    return new Promise(function (resolve) {
      var base = st.playStarted && st.playStart ? st.playStart : st.mountTime;
      var left = (base + MIN_PLAY_MS) - now();
      // 'complete' at 1x already implies ~3.0 s, but if it fired early we still
      // wait out the remainder so the floor is literally 3000 ms of playback.
      // A hard timeout has already outlived the floor, so it dismisses at once.
      if (st.hardTimeout || left <= 0) { resolve(); return; }
      later(resolve, left);
    });
  }

  // (c2) let the finished lockup sit for a beat: the wordmark lands on the last
  // frame, so without this hold the brand is only visible during the fade.
  // Skipped when playback never completed (the 6 s net or the fallback path).
  function waitLockupHold() {
    return new Promise(function (resolve) {
      if (!st.animComplete || st.hardTimeout) { resolve(); return; }
      later(resolve, LOCKUP_HOLD_MS);
    });
  }

  // (b) __DSH_BOOT_READY__ has settled (absent => nothing to wait for).
  function waitBoot() {
    return new Promise(function (resolve) {
      var flag;
      try { flag = ROOT.__DSH_BOOT_READY__; } catch (e) { flag = undefined; }

      var promise = null;
      if (flag && (typeof flag === 'object' || typeof flag === 'function') &&
          flag.promise && typeof flag.promise.then === 'function') {
        promise = flag.promise;
      } else if (flag && typeof flag.then === 'function') {
        promise = flag; // tolerate a bare promise
      }
      if (!promise) { resolve(); return; }

      var done = false;
      var finish = function () {
        if (done) { return; }
        done = true;
        resolve();
      };
      // Never let a hung boot promise hide the app forever.
      var cap = Math.min(BOOT_WAIT_MAX_MS, (st.mountTime + APP_READY_MAX_MS) - now());
      if (cap <= 0) { finish(); return; }
      later(finish, cap);
      try {
        promise.then(finish, finish); // a rejection counts as settled
      } catch (e) {
        finish();
      }
    });
  }

  // (d) The app has actually rendered: its own splash node is gone.
  // __DSH_BOOT_READY__ only means "boot inputs installed", which happens a
  // moment before React mounts — fading out on that alone flashes the old
  // app splash, so wait for [data-dsh-boot] to disappear (60 ms poll, 8 s cap).
  function waitAppRender() {
    return new Promise(function (resolve) {
      var deadline = st.mountTime + APP_READY_MAX_MS;
      var done = function () { resolve(); };
      var check = function () {
        if (st.dismissed) { return; }
        var boot = null;
        try { boot = DOC.querySelector('[data-dsh-boot]'); } catch (e) { boot = null; }
        if (!boot) { done(); return; }
        var left = deadline - now();
        if (left <= 0) { done(); return; } // cap: dismiss anyway, at 8 s sharp
        later(check, left < APP_POLL_MS ? left : APP_POLL_MS);
      };
      check();
    });
  }

  /* --------------------------------------------------------------- dismiss */

  // Told to the client half of this bundle: the setup guide waits for it.
  function announceDone(reason) {
    try {
      ROOT.dispatchEvent(new CustomEvent('xthings:splash-done', { detail: { reason: String(reason || 'done') } }));
    } catch (e) {
      try { ROOT.dispatchEvent(new Event('xthings:splash-done')); } catch (e2) { /* ignore */ }
    }
  }

  function removeNode(el) {
    try {
      if (!el) { return; }
      if (el.parentNode) { el.parentNode.removeChild(el); }
      else if (typeof el.remove === 'function') { el.remove(); }
    } catch (e) { /* ignore */ }
  }

  function dismiss(reason) {
    if (st.dismissed) { return; }
    st.dismissed = true;
    st.dismissedBy = reason || 'manual';

    try { clearTimers(); } catch (e) { /* ignore */ }
    restoreOverflow();

    var el = st.el;
    if (!st.mounted || !el) { announceDone(st.dismissedBy); return; }

    var finish = function () {
      try {
        if (st.anim && typeof st.anim.destroy === 'function') { st.anim.destroy(); }
      } catch (e) { /* ignore */ }
      st.anim = null;
      removeNode(el);
      st.el = null;
      announceDone(st.dismissedBy);
    };

    try {
      el.style.pointerEvents = 'none';
      el.className = 'xthings-splash-root xthings-splash-out';
      el.style.opacity = '0';
      if (prefersReducedMotion()) {
        finish(); // no 320 ms fade for reduced-motion users
      } else {
        ROOT.setTimeout(finish, FADE_MS + 40);
      }
    } catch (e) {
      finish(); // last resort: never leave the app hidden
    }
  }

  // Unconditional cleanup used by the watchdog and the catch-all paths.
  function forceRemove(reason) {
    st.dismissed = true;
    st.dismissedBy = reason || 'force';
    try { clearTimers(); } catch (e) { /* ignore */ }
    try {
      if (st.anim && typeof st.anim.destroy === 'function') { st.anim.destroy(); }
    } catch (e) { /* ignore */ }
    st.anim = null;
    removeNode(st.el);
    st.el = null;
    restoreOverflow();
    announceDone(reason || 'force');
  }

  /* -------------------------------------------------------------- fallback */

  // Lottie or data unavailable, or playback threw: static wordmark for 3 s.
  function fallback() {
    if (st.dismissed) { return; }
    try { clearTimers(); } catch (e) { /* ignore */ }

    try {
      if (st.anim && typeof st.anim.destroy === 'function') { st.anim.destroy(); }
    } catch (e) { /* ignore */ }
    st.anim = null;

    try {
      if (st.stage) {
        while (st.stage.firstChild) { st.stage.removeChild(st.stage.firstChild); }
        st.stage.innerHTML = WORDMARK_SVG;
        var svg = st.stage.firstChild;
        if (svg) {
          svg.setAttribute('class', 'xthings-splash-wordmark');
          if (svg.style) {
            svg.style.width = 'min(320px, 42vw)';
            svg.style.height = 'auto';
            svg.style.display = 'block';
          }
        }
      }
    } catch (e) { /* ignore */ }

    later(function () { dismiss('fallback'); }, FALLBACK_HOLD_MS);
  }

  /* ----------------------------------------------------------------- boot */

  function start() {
    if (st.dismissed) { return; }
    if (!mount()) { return; }

    // Absolute last resort: whatever happens above, the app becomes visible
    // shortly after the 8 s budget (fade included).
    later(function () { forceRemove('watchdog'); }, APP_READY_MAX_MS + 800);

    playAnimation().then(function () {
      return waitMinPlay();
    }).then(function () {
      return waitLockupHold();
    }).then(function () {
      return waitBoot();
    }).then(function () {
      return waitAppRender();
    }).then(function () {
      dismiss('ready');
    }).catch(function () {
      fallback();
    });
  }

  // Attach only once the body exists — this script may run from <head>.
  function whenBody(fn) {
    if (DOC.body) { fn(); return; }
    var fired = false;
    var go = function () {
      if (fired) { return; }
      fired = true;
      fn();
    };
    try {
      DOC.addEventListener('DOMContentLoaded', go, { once: true });
    } catch (e) {
      DOC.addEventListener('DOMContentLoaded', go);
    }
    var tries = 0;
    (function poll() {
      if (fired) { return; }
      if (DOC.body) { go(); return; }
      if (tries >= 200) { return; } // ~10 s, then give up quietly
      tries += 1;
      ROOT.setTimeout(poll, 50);
    })();
  }

  // Desktop may prepare the workspace behind its native welcome window.
  // Do not spend the playback or watchdog budgets until the user can see it.
  function whenVisible(fn) {
    if (DOC.visibilityState !== 'hidden') { fn(); return; }
    var fired = false;
    var go = function () {
      if (fired || DOC.visibilityState === 'hidden') { return; }
      fired = true;
      DOC.removeEventListener('visibilitychange', go);
      fn();
    };
    DOC.addEventListener('visibilitychange', go);
    // Covers a visibility change between the first check and subscription.
    go();
  }

  /* ------------------------------------------------------------------ api */

  ROOT.__XTHINGS_SPLASH__ = {
    dismiss: function (reason) {
      try { dismiss(reason || 'manual'); } catch (e) { /* ignore */ }
    }
  };

  try {
    whenBody(function () {
      whenVisible(function () {
        try {
          start();
        } catch (e) {
          forceRemove('error');
        }
      });
    });
  } catch (e) {
    forceRemove('error');
  }
})();
