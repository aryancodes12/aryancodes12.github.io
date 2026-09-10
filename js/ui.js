/**
 * ui.js — Loading Screen + Panel System + HUD (Step 8)
 * This is the entry point that boots everything and manages all UI state.
 */
window.UI = (function () {
  'use strict';

  const LOAD_MESSAGES = [
    'Initializing universe…',
    'Scattering stars…',
    'Placing celestial bodies…',
    'Mapping skill constellations…',
    'Calibrating orbital mechanics…',
    'Engaging warp drive…',
    'Ready for exploration!'
  ];

  let currentPanel = null;
  let audioContext = null;
  let musicNodes = null;

  // ── Loading screen ────────────────────────────────────────
  function generateLoaderStars() {
    const container = document.getElementById('loader-bg-stars');
    const frag = document.createDocumentFragment();
    for (let i = 0; i < 120; i++) {
      const s = document.createElement('div');
      const sz = 0.8 + Math.random() * 2;
      s.className = 'l-star';
      s.style.cssText = [
        `left:${Math.random() * 100}%`,
        `top:${Math.random() * 100}%`,
        `width:${sz}px`,
        `height:${sz}px`,
        `--dur:${1.5 + Math.random() * 2.5}s`,
        `--dly:${Math.random() * 3}s`
      ].join(';');
      frag.appendChild(s);
    }
    container.appendChild(frag);
  }

  function animateLoad(callback) {
    const fill   = document.getElementById('loader-fill');
    const status = document.getElementById('loader-status');
    let   step   = 0;
    const steps  = LOAD_MESSAGES.length;
    const dt     = 600; // ms per step

    const tick = () => {
      if (step >= steps) { callback(); return; }
      fill.style.width   = `${((step + 1) / steps) * 100}%`;
      status.textContent = LOAD_MESSAGES[step];
      step++;
      setTimeout(tick, dt);
    };
    tick();
  }

  function hideLoader() {
    const screen = document.getElementById('loading-screen');
    screen.classList.add('fade-out');
    // Reveal explore hint
    setTimeout(() => {
      document.getElementById('explore-hint').style.opacity = '1';
    }, 400);
  }

  // ── Panel management ─────────────────────────────────────
  function openPanel(id) {
    const overlay = document.getElementById('panel-overlay');

    // Close previous if different
    if (currentPanel && currentPanel !== id) {
      document.getElementById(`panel-${currentPanel}`).classList.remove('active');
      document.querySelector(`.hud-nav-btn[data-panel="${currentPanel}"]`)?.classList.remove('active');
    }

    const panel = document.getElementById(`panel-${id}`);
    if (!panel) return;

    currentPanel = id;
    panel.classList.add('active');
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.querySelector(`.hud-nav-btn[data-panel="${id}"]`)?.classList.add('active');

    // Hide explore hint once user starts exploring
    document.getElementById('explore-hint').classList.add('hidden');
  }

  function closePanel() {
    if (!currentPanel) return;
    const overlay = document.getElementById('panel-overlay');
    const panel   = document.getElementById(`panel-${currentPanel}`);

    panel?.classList.remove('active');
    document.querySelector(`.hud-nav-btn[data-panel="${currentPanel}"]`)?.classList.remove('active');
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    currentPanel = null;
  }

  // ── HUD wiring ────────────────────────────────────────────
  function wireHUD() {
    document.getElementById('music-toggle').addEventListener('click', toggleMusic);

    // Nav buttons → open panel + (optionally) focus camera
    document.querySelectorAll('.hud-nav-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.panel;
        openPanel(id);
        // Focus camera on the matching node if Nodes are ready
        if (window.Camera && window.Nodes && Nodes.nodeGroups[id]) {
          const nodeData = window.UNIVERSE_DATA.nodes.find(n => n.id === id);
          if (nodeData) Camera.focusNode(nodeData);
        }
      });
    });

    // Logo button → reset camera + close panel
    document.getElementById('hud-logo').addEventListener('click', () => {
      closePanel();
      if (window.Camera) Camera.resetView();
    });

    // Close button on panel
    document.getElementById('panel-close-btn').addEventListener('click', closePanel);

    // Backdrop click → close
    document.getElementById('panel-backdrop').addEventListener('click', closePanel);

    // Keyboard: Escape closes, G resets
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (currentPanel) closePanel();
        else if (window.Camera) Camera.resetView();
      }
      if (e.key === 'g' || e.key === 'G') {
        closePanel();
        if (window.Camera) Camera.resetView();
      }
    });
  }

  // ── Auto-hide explore hint ────────────────────────────────
  function setupHint() {
    const hint = document.getElementById('explore-hint');
    hint.style.opacity = '0'; // hidden until loader done
    setTimeout(() => hint.classList.add('hidden'), 8000);
  }

  // Create a small ambient loop locally so playback needs no external audio asset.
  function toggleMusic() {
    const button = document.getElementById('music-toggle');
    const label = button.querySelector('.music-label');

    if (!audioContext) {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const master = audioContext.createGain();
      master.gain.value = 0.035;
      master.connect(audioContext.destination);

      const oscillators = [
        { frequency: 110, type: 'sine', detune: 0 },
        { frequency: 164.81, type: 'sine', detune: -4 },
        { frequency: 220, type: 'triangle', detune: 5 }
      ].map(({ frequency, type, detune }) => {
        const oscillator = audioContext.createOscillator();
        oscillator.type = type;
        oscillator.frequency.value = frequency;
        oscillator.detune.value = detune;
        oscillator.connect(master);
        oscillator.start();
        return oscillator;
      });
      musicNodes = { master, oscillators };
    }

    if (audioContext.state === 'suspended') audioContext.resume();
    const isPlaying = button.getAttribute('aria-pressed') === 'true';
    musicNodes.master.gain.cancelScheduledValues(audioContext.currentTime);
    musicNodes.master.gain.linearRampToValueAtTime(isPlaying ? 0 : 0.035, audioContext.currentTime + 0.35);
    button.setAttribute('aria-pressed', String(!isPlaying));
    button.setAttribute('aria-label', isPlaying ? 'Enable ambient music' : 'Disable ambient music');
    label.textContent = isPlaying ? 'Music off' : 'Music on';
  }

  // ── Tooltip helpers (public, used by camera.js) ───────────
  // (camera.js handles its own tooltip directly; this is kept for other uses)

  // ── Bootstrap ─────────────────────────────────────────────
  function boot() {
    generateLoaderStars();
    setupHint();

    animateLoad(() => {
      // Init Three.js pipeline
      Universe.init();
      Stars.init();
      Nodes.init();
      Planets.init();
      Constellations.init();
      Camera.init();

      // Wire UI after scene is ready
      wireHUD();

      // Hide loader after a short grace period
      setTimeout(hideLoader, 300);
    });
  }

  // Start on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  return { openPanel, closePanel };
})();
