/**
 * camera.js — Orbital Camera Controls + Raycaster (Step 7)
 * - Mouse drag  → orbit (spherical coords with damping)
 * - Scroll      → zoom
 * - Click       → raycaster hit test on clickables
 * - Hover       → tooltip
 * - Touch       → mobile orbit + tap-to-click
 */
window.Camera = (function () {
  'use strict';

  // Spherical camera state
  const cam = {
    theta:  0,          // horizontal angle (rad)
    phi:    1.05,       // vertical angle (rad, 0=top, PI=bottom)
    radius: 20,         // distance from origin

    tTheta:  0,
    tPhi:    1.05,
    tRadius: 20,

    isDragging:  false,
    mouseStart:  { x: 0, y: 0 },
    mouseLast:   { x: 0, y: 0 },
    hasDragged:  false,
    dragDist:    0
  };

  const PHI_MIN   = 0.25;     // max look-up (prevent zenith flip)
  const PHI_MAX   = Math.PI * 0.78; // max look-down
  const RAD_MIN   = 6;
  const RAD_MAX   = 45;
  const DAMP      = 0.09;     // interpolation factor (lower = smoother)

  const raycaster  = new THREE.Raycaster();
  raycaster.params.Points.threshold = 0.1;
  const mouse      = new THREE.Vector2();
  const tooltip    = document.getElementById('tooltip');

  let lastHovered  = null;

  // ── Helpers ───────────────────────────────────────────────
  function applyPosition() {
    const sin = Math.sin;
    const cos = Math.cos;
    const c   = Universe.camera;
    c.position.set(
      cam.radius * sin(cam.phi) * cos(cam.theta),
      cam.radius * cos(cam.phi),
      cam.radius * sin(cam.phi) * sin(cam.theta)
    );
    c.lookAt(0, 0, 0);
  }

  function getNDC(clientX, clientY) {
    return new THREE.Vector2(
      (clientX / window.innerWidth)  *  2 - 1,
      (clientY / window.innerHeight) * -2 + 1
    );
  }

  function raycast(ndcVec) {
    raycaster.setFromCamera(ndcVec, Universe.camera);
    const meshes = Universe.clickables.map(c => c.group);
    return raycaster.intersectObjects(meshes, true);
  }

  function findClickable(obj) {
    let cur = obj;
    while (cur) {
      const found = Universe.clickables.find(c => c.group === cur);
      if (found) return found;
      cur = cur.parent;
    }
    return null;
  }

  // ── Tooltip helpers ───────────────────────────────────────
  function showTooltip(label, x, y) {
    tooltip.textContent = label;
    tooltip.style.left  = `${x + 14}px`;
    tooltip.style.top   = `${y - 6}px`;
    tooltip.classList.add('visible');
  }
  function hideTooltip() {
    tooltip.classList.remove('visible');
    lastHovered = null;
  }

  // ── Hover detection (runs every frame via mousemove) ──────
  let mouseX = 0, mouseY = 0;

  function checkHover() {
    if (cam.isDragging) { hideTooltip(); return; }
    const ndc = getNDC(mouseX, mouseY);
    const hits = raycast(ndc);
    if (hits.length > 0) {
      const clickable = findClickable(hits[0].object);
      if (clickable) {
        if (lastHovered !== clickable) {
          lastHovered = clickable;
          document.getElementById('universe-canvas').style.cursor = 'pointer';
          showTooltip(clickable.label, mouseX, mouseY);
        }
        return;
      }
    }
    if (lastHovered) {
      document.getElementById('universe-canvas').style.cursor = cam.isDragging ? 'grabbing' : 'grab';
      hideTooltip();
    }
  }

  // ── Mouse events ──────────────────────────────────────────
  function onMouseDown(e) {
    if (e.target.id !== 'universe-canvas') return;
    cam.isDragging = true;
    cam.hasDragged = false;
    cam.dragDist   = 0;
    cam.mouseStart = { x: e.clientX, y: e.clientY };
    cam.mouseLast  = { x: e.clientX, y: e.clientY };
    document.getElementById('universe-canvas').classList.add('dragging');
  }

  function onMouseMove(e) {
    mouseX = e.clientX;
    mouseY = e.clientY;

    if (!cam.isDragging) { checkHover(); return; }

    const dx = e.clientX - cam.mouseLast.x;
    const dy = e.clientY - cam.mouseLast.y;
    cam.dragDist += Math.sqrt(dx * dx + dy * dy);
    if (cam.dragDist > 4) cam.hasDragged = true;

    cam.tTheta -= dx * 0.006;
    cam.tPhi    = Math.max(PHI_MIN, Math.min(PHI_MAX, cam.tPhi + dy * 0.005));
    cam.mouseLast = { x: e.clientX, y: e.clientY };
  }

  function onMouseUp(e) {
    if (!cam.isDragging) return;
    cam.isDragging = false;
    document.getElementById('universe-canvas').classList.remove('dragging');

    if (!cam.hasDragged) {
      // It's a click — raycaster
      const ndc  = getNDC(e.clientX, e.clientY);
      const hits = raycast(ndc);
      if (hits.length > 0) {
        const clickable = findClickable(hits[0].object);
        if (clickable) clickable.cb();
      }
    }
  }

  function onWheel(e) {
    e.preventDefault();
    cam.tRadius = Math.max(RAD_MIN, Math.min(RAD_MAX, cam.tRadius + e.deltaY * 0.04));
  }

  // ── Touch events ──────────────────────────────────────────
  let touchStart = null;

  function onTouchStart(e) {
    if (e.touches.length === 1) {
      touchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      cam.isDragging = true;
      cam.hasDragged = false;
      cam.dragDist   = 0;
      cam.mouseLast  = { x: touchStart.x, y: touchStart.y };
    }
  }

  function onTouchMove(e) {
    if (e.touches.length !== 1 || !cam.isDragging) return;
    e.preventDefault();
    const t  = e.touches[0];
    const dx = t.clientX - cam.mouseLast.x;
    const dy = t.clientY - cam.mouseLast.y;
    cam.dragDist += Math.sqrt(dx * dx + dy * dy);
    if (cam.dragDist > 6) cam.hasDragged = true;
    cam.tTheta -= dx * 0.006;
    cam.tPhi    = Math.max(PHI_MIN, Math.min(PHI_MAX, cam.tPhi + dy * 0.005));
    cam.mouseLast = { x: t.clientX, y: t.clientY };
  }

  function onTouchEnd(e) {
    cam.isDragging = false;
    if (!cam.hasDragged && touchStart) {
      const ndc  = getNDC(touchStart.x, touchStart.y);
      const hits = raycast(ndc);
      if (hits.length > 0) {
        const clickable = findClickable(hits[0].object);
        if (clickable) clickable.cb();
      }
    }
    touchStart = null;
  }

  // ── Public API ────────────────────────────────────────────
  return {
    init() {
      const canvas = document.getElementById('universe-canvas');

      canvas.addEventListener('mousedown',  onMouseDown);
      window.addEventListener('mousemove',  onMouseMove);
      window.addEventListener('mouseup',    onMouseUp);
      canvas.addEventListener('wheel',      onWheel,     { passive: false });
      canvas.addEventListener('touchstart', onTouchStart, { passive: true });
      canvas.addEventListener('touchmove',  onTouchMove,  { passive: false });
      canvas.addEventListener('touchend',   onTouchEnd);

      // Smooth damping update every frame
      Universe.onFrame(() => {
        cam.theta  += (cam.tTheta  - cam.theta)  * DAMP;
        cam.phi    += (cam.tPhi    - cam.phi)    * DAMP;
        cam.radius += (cam.tRadius - cam.radius) * DAMP;
        applyPosition();
      });
    },

    /** Smoothly move camera to face a given node */
    focusNode(nodeData) {
      const rad    = (nodeData.angle * Math.PI) / 180;
      cam.tTheta  = rad;
      cam.tPhi    = 1.0;
      cam.tRadius = 11;
    },

    /** Reset camera to default overview */
    resetView() {
      cam.tTheta  = 0;
      cam.tPhi    = 1.05;
      cam.tRadius = 20;
    }
  };
})();
