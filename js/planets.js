/**
 * planets.js — 5 Project Planets orbiting the Projects node (Step 5)
 * Each planet = one project. They orbit the Projects node position.
 */
window.Planets = (function () {
  'use strict';

  function makeGlowTexture(r, g, b) {
    const c = document.createElement('canvas');
    c.width = c.height = 128;
    const ctx = c.getContext('2d');
    const grad = ctx.createRadialGradient(64, 64, 0, 64, 64, 64);
    grad.addColorStop(0,   `rgba(${r},${g},${b},1)`);
    grad.addColorStop(0.4, `rgba(${r},${g},${b},0.3)`);
    grad.addColorStop(1,   `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  }

  function hexRGB(hex) {
    return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
  }

  /** Draw a circular orbit path */
  function makeOrbitRing(radius, color) {
    const pts = [];
    for (let i = 0; i <= 96; i++) {
      const a = (i / 96) * Math.PI * 2;
      pts.push(new THREE.Vector3(Math.cos(a) * radius, 0, Math.sin(a) * radius));
    }
    const geo = new THREE.BufferGeometry().setFromPoints(pts);
    const mat = new THREE.LineBasicMaterial({
      color,
      transparent: true,
      opacity: 0.16,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    return new THREE.LineLoop(geo, mat);
  }

  return {
    init() {
      const scene  = Universe.scene;
      const data   = window.UNIVERSE_DATA;

      // Find the Projects node world position
      const projNode = data.nodes.find(n => n.id === 'projects');
      const pRad = (projNode.angle * Math.PI) / 180;
      const projCenter = new THREE.Vector3(
        Math.cos(pRad) * projNode.radius,
        projNode.y,
        Math.sin(pRad) * projNode.radius
      );

      // Container group so orbits are relative to Projects node
      const solarGroup = new THREE.Group();
      solarGroup.position.copy(projCenter);
      scene.add(solarGroup);

      data.projects.forEach((proj, i) => {
        const [r, g, b] = hexRGB(proj.color);

        // Orbit ring
        const orbitRing = makeOrbitRing(proj.orbitRadius, proj.color);
        solarGroup.add(orbitRing);

        // Planet group (holds sphere + glow sprite)
        const planetGroup = new THREE.Group();
        solarGroup.add(planetGroup);

        // Planet sphere
        const geo = new THREE.SphereGeometry(proj.size, 22, 22);
        const mat = new THREE.MeshStandardMaterial({
          color: proj.color,
          emissive: proj.color,
          emissiveIntensity: 0.9,
          roughness: 0.45,
          metalness: 0.15
        });
        const mesh = new THREE.Mesh(geo, mat);
        planetGroup.add(mesh);

        // Glow sprite
        const spriteMat = new THREE.SpriteMaterial({
          map: makeGlowTexture(r, g, b),
          blending: THREE.AdditiveBlending,
          transparent: true,
          opacity: 0.5,
          depthWrite: false
        });
        const sprite = new THREE.Sprite(spriteMat);
        sprite.scale.set(proj.size * 4, proj.size * 4, 1);
        planetGroup.add(sprite);

        // Saturn-ring for the featured project
        if (proj.featured) {
          const ringGeo = new THREE.TorusGeometry(proj.size * 1.7, proj.size * 0.18, 4, 48);
          const ringMat = new THREE.MeshBasicMaterial({
            color: proj.color,
            transparent: true,
            opacity: 0.35,
            side: THREE.DoubleSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
          });
          const satRing = new THREE.Mesh(ringGeo, ringMat);
          satRing.rotation.x = Math.PI / 5;
          planetGroup.add(satRing);
        }

        // Store metadata for raycaster
        planetGroup.userData = { isPlanet: true, projectData: proj };

        // Register as clickable → opens Projects panel
        Universe.addClickable(planetGroup, () => {
          if (window.UI) UI.openPanel('projects');
        }, proj.name);

        // Orbit state (staggered start angles)
        let angle = (i / data.projects.length) * Math.PI * 2;

        Universe.onFrame((delta, elapsed) => {
          angle += delta * proj.orbitSpeed;
          planetGroup.position.set(
            Math.cos(angle) * proj.orbitRadius,
            Math.sin(elapsed * 0.3 + i) * 0.08, // tiny vertical bob
            Math.sin(angle) * proj.orbitRadius
          );
          mesh.rotation.y += delta * 0.6;
          spriteMat.opacity = 0.4 + Math.sin(elapsed * 1.2 + i) * 0.15;
        });
      });
    }
  };
})();
