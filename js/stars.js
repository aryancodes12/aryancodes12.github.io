/**
 * stars.js — Starfield Particle System (Step 3)
 * Three layered point-cloud fields + procedural shooting stars.
 */
window.Stars = (function () {
  'use strict';

  /** Create one particle layer */
  function makeLayer(count, sizeVal, distMin, distMax, color, opacity) {
    const pos = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      const r     = distMin + Math.random() * (distMax - distMin);
      const theta = Math.random() * Math.PI * 2;
      const phi   = Math.acos(2 * Math.random() - 1);
      pos[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      pos[i * 3 + 2] = r * Math.cos(phi);
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({
      color,
      size: sizeVal,
      sizeAttenuation: true,
      transparent: true,
      opacity,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    return new THREE.Points(geo, mat);
  }

  /** Create a single shooting-star line and animate it */
  function spawnShootingStar(scene) {
    const start = new THREE.Vector3(
      (Math.random() - 0.5) * 120,
      (Math.random() - 0.5) * 60,
      (Math.random() - 0.5) * 120
    );
    const dir = new THREE.Vector3(
      Math.random() - 0.5,
      (Math.random() - 0.5) * 0.25,
      Math.random() - 0.5
    ).normalize().multiplyScalar(18 + Math.random() * 12);

    const end = start.clone().add(dir);
    const geo = new THREE.BufferGeometry().setFromPoints([start, end]);
    const mat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const line = new THREE.Line(geo, mat);
    scene.add(line);

    let t = 0;
    const speed  = 0.7 + Math.random() * 0.6;
    let done = false;

    Universe.onFrame((delta) => {
      if (done) return;
      t += delta * speed;
      mat.opacity = Math.max(0, 0.9 - t * 1.8);
      if (t > 0.7) {
        done = true;
        scene.remove(line);
        geo.dispose();
        mat.dispose();
      }
    });
  }

  return {
    init() {
      const scene = Universe.scene;

      // Layer 1 — distant tiny blue-white stars
      const far = makeLayer(5500, 0.55, 60, 220, 0xaabbff, 0.75);
      scene.add(far);

      // Layer 2 — mid-field white stars
      const mid = makeLayer(1400, 1.0, 30, 80, 0xffffff, 0.85);
      scene.add(mid);

      // Layer 3 — close bright warm stars
      const near = makeLayer(280, 1.8, 18, 45, 0xffeedd, 0.95);
      scene.add(near);

      // Gentle rotation for a "living galaxy" feel
      Universe.onFrame((delta) => {
        far.rotation.y  += delta * 0.008;
        far.rotation.x  += delta * 0.002;
        mid.rotation.y  -= delta * 0.004;
        near.rotation.z += delta * 0.003;
      });

      // Shooting stars — fire one every 3.5–6 s
      const fireShooter = () => {
        spawnShootingStar(scene);
        setTimeout(fireShooter, 3500 + Math.random() * 2500);
      };
      setTimeout(fireShooter, 1500);
    }
  };
})();
