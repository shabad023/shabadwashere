/* ==========================================================
   room.js — builds and animates the room.
   Called by all three pages. Looks for an element with id
   "room-root" and renders the room inside it.
   Options can be passed via the data-* attributes on that
   root, but the defaults match the study page.
   ========================================================== */
(function() {
  const root = document.getElementById('room-root');
  if (!root) return;

  const dimmed = root.classList.contains('room-dim');

  /* ---- BUILD THE DOM ----
     Same structure on every page; CSS handles the dimming. */
  root.innerHTML = `
    <div id="stage">
      <img class="room-img" id="roomImg" src="room_centerpiece.jpg" alt="">
      <div class="fx fire-glow"></div>
      <div class="fx fire-glow2"></div>
      <div class="fx lamp-glow"></div>
      <div class="fx lamp-pool"></div>
      <div class="fx globe-spin"></div>
      <div class="fx window-clean"></div>
      <div class="fx lightning" id="lightning"></div>
      <div class="fx man-under"></div>
      <div class="fx man-sprite"></div>
      <div class="fx room-glow"></div>
      <div class="fx foot-floor"></div>
      <div class="fx foot-sprite"></div>
      <div class="fx steam-patch"></div>
      <div class="fx drop-host" id="dropHost"></div>
      <div class="steam s1"></div>
      <div class="steam s2"></div>
      <div class="steam s3"></div>
    </div>
  `;

  const stage     = document.getElementById('stage');
  const img       = document.getElementById('roomImg');
  const lightning = document.getElementById('lightning');

  /* room-flash sits OUTSIDE the stage (it's a full-screen wash) */
  if (!document.getElementById('roomFlash')) {
    const rf = document.createElement('div');
    rf.className = 'room-flash';
    rf.id = 'roomFlash';
    document.body.appendChild(rf);
  }
  const roomFlash = document.getElementById('roomFlash');

  /* ----- FIT THE ROOM TO THE SCREEN (cover) ----- */
  function fitStage() {
    if (!img.naturalWidth) return;
    const ar = img.naturalWidth / img.naturalHeight;
    let w = window.innerWidth;
    let h = w / ar;
    if (h < window.innerHeight) {
      h = window.innerHeight;
      w = h * ar;
    }
    stage.style.width  = w + 'px';
    stage.style.height = h + 'px';
  }
  if (img.complete && img.naturalWidth > 0) fitStage();
  else img.addEventListener('load', fitStage);
  window.addEventListener('resize', fitStage);

  /* ----- EMBERS (skipped when dimmed since they'd be invisible) ----- */
  if (!dimmed) {
    for (let i = 0; i < 7; i++) {
      const e = document.createElement('div');
      e.className = 'ember';
      e.style.left = (67 + Math.random() * 10) + '%';
      e.style.top  = (66 + Math.random() * 8) + '%';
      e.style.animationDuration = (2.4 + Math.random() * 2.2) + 's';
      e.style.animationDelay    = (Math.random() * 3) + 's';
      stage.appendChild(e);
    }
  }

  /* ----- RAIN STREAKS — per-pane clipping -----
     Measured pane bounds from the cleaned window image, in percent
     of the .drop-host container (which spans the full window).
     Each pane gets its own .drop-box; streaks live inside their
     pane and clip exactly at the wooden muntins. */
  const dropHost = document.getElementById('dropHost');
  /* Window bounds in stage coords */
  dropHost.style.left   = '27.53%';
  dropHost.style.top    = '18.75%';
  dropHost.style.width  = '10.259%';
  dropHost.style.height = '43.527%';

  /* Pane spans within the window: 3 columns × 4 rows = 12 panes.
     Column bands are inset on the right to give wind drift room
     so streaks don't spill onto a vertical muntin. */
  const PANE_COLS = [[1.2, 25.6], [34.8, 59.8], [68.6, 93.9]];
  const PANE_ROWS = [
    { top: 0.8,  height: 22.5 },
    { top: 26.0, height: 23.5 },
    { top: 53.1, height: 22.9 },
    { top: 78.8, height: 20.5 }
  ];

  const PER_PANE = 8;     /* streaks per pane; 12 panes × 8 = 96 total */
  for (const colBand of PANE_COLS) {
    for (const rowBand of PANE_ROWS) {
      const box = document.createElement('div');
      box.className = 'drop-box';
      /* All values are % of the drop-host */
      box.style.left   = colBand[0] + '%';
      box.style.top    = rowBand.top + '%';
      box.style.width  = (colBand[1] - colBand[0]) + '%';
      box.style.height = rowBand.height + '%';
      for (let i = 0; i < PER_PANE; i++) {
        const d = document.createElement('div');
        d.className = 'droplet';
        d.style.left = (Math.random() * 100) + '%';
        d.style.top  = '0%';
        d.style.animationDuration = (0.35 + Math.random() * 0.4) + 's';
        d.style.animationDelay    = (Math.random() * 2) + 's';
        box.appendChild(d);
      }
      dropHost.appendChild(box);
    }
  }

  /* ----- LIGHTNING (visual + clap if available) ----- */
  const lightningSnd = document.getElementById('lightningSnd');
  if (lightningSnd) lightningSnd.volume = 0.12;

  function scheduleLightning() {
    const wait = 4500 + Math.random() * 2000;
    setTimeout(function() {
      lightning.classList.remove('strike');
      roomFlash.classList.remove('swell');
      void lightning.offsetWidth;
      lightning.classList.add('strike');
      roomFlash.classList.add('swell');
      if (lightningSnd && window.swMusicOn && !document.hidden) {
        try { lightningSnd.currentTime = 0; lightningSnd.play().catch(function(){}); } catch(e) {}
      }
      scheduleLightning();
    }, wait);
  }
  scheduleLightning();
})();
