/* ==========================================================
   sound.js — the soundscape, used by all three pages.
   Restores the visitor's choice across navigation via
   sessionStorage. Sets window.swMusicOn so room.js can sync
   lightning claps with the music state.
   ========================================================== */
(function() {
  const bgm        = document.getElementById('bgm');
  const fireSnd    = document.getElementById('fireSnd');
  const thunderSnd = document.getElementById('thunderSnd');
  const navSound   = document.getElementById('navSound');
  if (!bgm || !navSound) return;

  bgm.volume        = 0.55;
  if (fireSnd)    fireSnd.volume    = 0.12;
  if (thunderSnd) thunderSnd.volume = 0.09;

  /* Foot-tap BPM = Moonlight Sonata adagio ≈ 54 BPM */
  const SONG_BPM = 54;
  const beatSeconds = (60 / SONG_BPM) * 2;
  document.documentElement.style.setProperty('--beat', beatSeconds + 's');

  window.swMusicOn = false;
  function setMusic(on) {
    window.swMusicOn = on;
    try { sessionStorage.setItem('sw_sound', on ? 'on' : 'off'); } catch(e) {}
    if (on) {
      /* Resume the music from where it left off on the previous page.
         The position is saved every second while playing (see below).
         If nothing was saved yet — first ever play, or browser without
         sessionStorage — we just start from the beginning. */
      try {
        const savedAt = sessionStorage.getItem('sw_bgm_t');
        if (savedAt && bgm.duration && parseFloat(savedAt) < bgm.duration) {
          bgm.currentTime = parseFloat(savedAt);
        }
      } catch(e) {}

      bgm.play().then(function() {
        document.body.classList.add('music-on');
        navSound.textContent = 'SOUND: ON';
      }).catch(function() {
        window.swMusicOn = false;
        navSound.textContent = 'SOUND: OFF';
      });
      if (fireSnd)    fireSnd.play().catch(function(){});
      if (thunderSnd) thunderSnd.play().catch(function(){});
    } else {
      bgm.pause();
      if (fireSnd)    fireSnd.pause();
      if (thunderSnd) thunderSnd.pause();
      document.body.classList.remove('music-on');
      navSound.textContent = 'SOUND: OFF';
    }
  }

  /* Save the music's playback position every second while it's
     playing. When the visitor navigates to another page, that page
     reads this value and resumes from there — so the song never
     restarts from zero, only briefly pauses during the page load. */
  setInterval(function() {
    if (window.swMusicOn && !bgm.paused) {
      try { sessionStorage.setItem('sw_bgm_t', String(bgm.currentTime)); } catch(e) {}
    }
  }, 1000);

  /* Also save the position immediately before the page unloads
     (i.e. when the visitor clicks a nav link). This catches the
     last 0–1 seconds the interval would have missed. */
  window.addEventListener('beforeunload', function() {
    if (window.swMusicOn) {
      try { sessionStorage.setItem('sw_bgm_t', String(bgm.currentTime)); } catch(e) {}
    }
  });

  navSound.addEventListener('click', function() { setMusic(!window.swMusicOn); });

  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      if (window.swMusicOn) {
        bgm.pause();
        if (fireSnd)    fireSnd.pause();
        if (thunderSnd) thunderSnd.pause();
      }
    } else {
      if (window.swMusicOn) {
        bgm.play().catch(function(){});
        if (fireSnd)    fireSnd.play().catch(function(){});
        if (thunderSnd) thunderSnd.play().catch(function(){});
      }
    }
  });

  /* Restore sound state across pages — but wait until the audio
     metadata (duration, etc.) is ready, so seeking to the saved
     position actually works. */
  function tryAutoResume() {
    try {
      if (sessionStorage.getItem('sw_sound') === 'on') {
        setMusic(true);
      }
    } catch(e) {}
  }
  if (bgm.readyState >= 1) {
    /* Metadata already loaded (rare on first load but possible on
       browser back/forward navigation that hits the cache). */
    tryAutoResume();
  } else {
    bgm.addEventListener('loadedmetadata', tryAutoResume, { once: true });
    /* Kick the audio element into loading metadata now, since our
       audio tag has preload="none". */
    bgm.load();
  }
})();
