/**
 * constellations.js — Skill Star Clusters (Step 6)
 * Three constellations, each cluster of stars connected by faint lines.
 * Positioned loosely near the Skills node but spread into the background.
 */
window.Constellations = (function () {
  'use strict';

  // Random positions within a sphere of given radius, offset by center
  function scatter(count, spread) {
    const pts = [];
    for (let i = 0; i < count; i++) {
      pts.push(new THREE.Vector3(
        (Math.random() - 0.5) * spread,
        (Math.random() - 0.5) * spread * 0.5,
        (Math.random() - 0.5) * spread
      ));
    }
    return pts;
  }

  function makeGlowTex(r, g, b) {
    const c = document.createElement('canvas');
    c.width = c.height = 64;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    grad.addColorStop(0,   `rgba(${r},${g},${b},1)`);
    grad.addColorStop(0.5, `rgba(${r},${g},${b},0.3)`);
    grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 64, 64);
    return new THREE.CanvasTexture(c);
  }

  function hexRGB(hex) {
    return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
  }

  const COLORS = {
    core:        { hex: 0x4a90e2, rgb: [74, 144, 226] },
    dataScience: { hex: 0xa855f7, rgb: [168, 85, 247] },
    learning:    { hex: 0x22c55e, rgb:  [34, 197, 94] }
  };

  // Cluster base positions (far background, near Skills node side)
  const CENTERS = [
    new THREE.Vector3(-12, 6,  -18), // core
    new THREE.Vector3( -8, 2,  -25), // dataScience
    new THREE.Vector3(-16, -4, -22)  // learning
  ];

  function buildCluster(skillKey, centerPos) {
    const col   = COLORS[skillKey];
    const items = window.UNIVERSE_DATA.skills[skillKey].items;
    const group = new THREE.Group();
    group.position.copy(centerPos);

    const localPts = scatter(items.length, 3.5 + items.length * 0.25);
    const [r, g, b] = col.rgb;

    // Star sprites (one per skill)
    const tex = makeGlowTex(r, g, b);
    localPts.forEach((point) => {
      const mat = new THREE.SpriteMaterial({
        map: tex,
        blending: THREE.AdditiveBlending,
        transparent: true,
        opacity: 0.7,
        depthWrite: false
      });
      const sprite = new THREE.Sprite(mat);
      sprite.position.copy(point);
      sprite.scale.set(0.65, 0.65, 1);
      group.add(sprite);
    });

    // Constellation lines (connect nearest pairs)
    const linePoints = [];
    for (let i = 0; i < localPts.length; i++) {
      const next = (i + 1) % localPts.length;
      linePoints.push(localPts[i], localPts[next]);
      if (i % 2 === 0 && i + 2 < localPts.length) {
        linePoints.push(localPts[i], localPts[i + 2]);
      }
    }
    const lineGeo = new THREE.BufferGeometry().setFromPoints(linePoints);
    const lineMat = new THREE.LineBasicMaterial({
      color: col.hex,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    group.add(new THREE.LineSegments(lineGeo, lineMat));

    return group;
  }

  return {
    init() {
      const scene = Universe.scene;
      const keys  = ['core', 'dataScience', 'learning'];

      keys.forEach((key, i) => {
        const cluster = buildCluster(key, CENTERS[i]);
        scene.add(cluster);

        // Gentle slow drift rotation
        Universe.onFrame((delta, elapsed) => {
          cluster.rotation.y += delta * (0.015 + i * 0.005);
          cluster.rotation.x += delta * 0.005;
          // Twinkle: vary opacity of star sprites
          cluster.children.forEach((child, ci) => {
            if (child instanceof THREE.Sprite && child.material) {
              child.material.opacity =
                0.5 + Math.sin(elapsed * (1.2 + ci * 0.3) + i * 2) * 0.3;
            }
          });
        });
      });
    }
  };
})();
