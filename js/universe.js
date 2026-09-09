/**
 * universe.js — Three.js Scene Foundation (Step 2)
 * Sets up renderer, scene, camera, fog, lights, and the animation loop.
 * All other modules attach to this global object.
 */
window.Universe = (function () {
  'use strict';

  let _scene, _camera, _renderer, _clock;
  const _callbacks = [];

  const pub = {
    clickables: [], // { mesh: Group, cb: fn, label: string }
    hoverables: [], // same structure

    init() {
      const canvas = document.getElementById('universe-canvas');

      // ── Renderer ──────────────────────────────────────
      _renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
      _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      _renderer.setSize(window.innerWidth, window.innerHeight);
      _renderer.setClearColor(0x050510, 1);

      // ── Scene ─────────────────────────────────────────
      _scene = new THREE.Scene();
      _scene.fog = new THREE.FogExp2(0x050510, 0.005);

      // ── Camera ────────────────────────────────────────
      _camera = new THREE.PerspectiveCamera(
        60, window.innerWidth / window.innerHeight, 0.1, 500
      );
      _camera.position.set(0, 3, 20);
      _camera.lookAt(0, 0, 0);

      // ── Clock ─────────────────────────────────────────
      _clock = new THREE.Clock();

      // ── Lights ────────────────────────────────────────
      // Deep ambient (gives base visibility)
      _scene.add(new THREE.AmbientLight(0x090920, 4));

      // Central blue-ish point light (the "sun")
      const sunLight = new THREE.PointLight(0x4488ff, 5, 120);
      sunLight.position.set(0, 0, 0);
      _scene.add(sunLight);

      // Secondary purple accent
      const accentLight = new THREE.PointLight(0x9933ff, 2.5, 80);
      accentLight.position.set(-18, 8, -18);
      _scene.add(accentLight);

      // ── Resize ────────────────────────────────────────
      window.addEventListener('resize', () => {
        _camera.aspect = window.innerWidth / window.innerHeight;
        _camera.updateProjectionMatrix();
        _renderer.setSize(window.innerWidth, window.innerHeight);
        _renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      });

      // ── Animation loop ────────────────────────────────
      const loop = () => {
        requestAnimationFrame(loop);
        const delta   = _clock.getDelta();
        const elapsed = _clock.getElapsedTime();
        for (let i = 0; i < _callbacks.length; i++) _callbacks[i](delta, elapsed);
        _renderer.render(_scene, _camera);
      };
      loop();
    },

    get scene()    { return _scene;    },
    get camera()   { return _camera;   },
    get renderer() { return _renderer; },
    get clock()    { return _clock;    },

    /** Register a per-frame callback: fn(delta, elapsed) */
    onFrame(fn) { _callbacks.push(fn); },

    /** Add object to the raycaster clickable list */
    addClickable(group, cb, label) {
      this.clickables.push({ group, cb, label });
    }
  };

  return pub;
})();
