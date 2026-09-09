/**
 * nodes.js — Central Sun + 6 Interactive Navigation Nodes (Step 4)
 * Each node is a glowing sphere group that responds to hover/click.
 */
window.Nodes = (function () {
  'use strict';

  /** Draw a glow radial gradient onto a canvas and return a CanvasTexture */
  function makeGlowTexture(r, g, b) {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = canvas.height = size;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0,    `rgba(${r},${g},${b},1)`);
    grad.addColorStop(0.25, `rgba(${r},${g},${b},0.5)`);
    grad.addColorStop(0.6,  `rgba(${r},${g},${b},0.12)`);
    grad.addColorStop(1,    `rgba(${r},${g},${b},0)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }

  /** Split a Three.js hex int into RGB 0-255 */
  function hexRGB(hex) {
    return [(hex >> 16) & 255, (hex >> 8) & 255, hex & 255];
  }

  /** Build one glowing node group */
  function makeNode(nodeData) {
    const group = new THREE.Group();

    const [r, g, b] = hexRGB(nodeData.color);

    // Core sphere
    const coreGeo = new THREE.SphereGeometry(0.3, 28, 28);
    const coreMat = new THREE.MeshStandardMaterial({
      color: nodeData.color,
      emissive: nodeData.color,
      emissiveIntensity: 1.6,
      roughness: 0.2,
      metalness: 0.1
    });
    const core = new THREE.Mesh(coreGeo, coreMat);
    group.add(core);

    // Outer glow shell (back-side transparent sphere)
    const glowGeo = new THREE.SphereGeometry(0.55, 20, 20);
    const glowMat = new THREE.MeshBasicMaterial({
      color: nodeData.color,
      transparent: true,
      opacity: 0.12,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    group.add(new THREE.Mesh(glowGeo, glowMat));

    // Sprite glow (soft radial halo)
    const spriteMat = new THREE.SpriteMaterial({
      map: makeGlowTexture(r, g, b),
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.55,
      depthWrite: false
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(2.2, 2.2, 1);
    group.add(sprite);

    // Thin wireframe ring
    const ringGeo = new THREE.TorusGeometry(0.52, 0.012, 8, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      color: nodeData.color,
      transparent: true,
      opacity: 0.45,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    group.add(ring);

    // Metadata
    group.userData = { isNode: true, nodeData, ring, coreMat, spriteMat, sprite };

    // Position in 3D space
    const rad = (nodeData.angle * Math.PI) / 180;
    group.position.set(
      Math.cos(rad) * nodeData.radius,
      nodeData.y,
      Math.sin(rad) * nodeData.radius
    );

    return group;
  }

  /** Build the central "sun" that represents Aryan */
  function makeSun() {
    const group = new THREE.Group();

    // Core — large glowing sphere
    const geo = new THREE.SphereGeometry(0.65, 36, 36);
    const mat = new THREE.MeshStandardMaterial({
      color: 0x4a90e2,
      emissive: 0x3366cc,
      emissiveIntensity: 2.0,
      roughness: 0.1,
      metalness: 0.3
    });
    const core = new THREE.Mesh(geo, mat);
    group.add(core);

    // Outer glow
    const glowGeo = new THREE.SphereGeometry(1.1, 20, 20);
    const glowMat = new THREE.MeshBasicMaterial({
      color: 0x4488ff,
      transparent: true,
      opacity: 0.10,
      side: THREE.BackSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    });
    group.add(new THREE.Mesh(glowGeo, glowMat));

    // Large halo sprite
    const haloBig = new THREE.SpriteMaterial({
      map: makeGlowTexture(80, 140, 255),
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.45,
      depthWrite: false
    });
    const halo = new THREE.Sprite(haloBig);
    halo.scale.set(5, 5, 1);
    group.add(halo);

    group.userData = { isSun: true, core, mat };
    return group;
  }

  return {
    nodeGroups: {},

    init() {
      const scene = Universe.scene;
      const data  = window.UNIVERSE_DATA;

      // Central sun
      const sun = makeSun();
      scene.add(sun);

      // Sun animation
      Universe.onFrame((delta, elapsed) => {
        sun.userData.core.rotation.y += delta * 0.25;
        sun.userData.mat.emissiveIntensity = 1.8 + Math.sin(elapsed * 1.4) * 0.4;
      });

      // Nav nodes
      data.nodes.forEach((nodeData) => {
        const group = makeNode(nodeData);
        scene.add(group);
        this.nodeGroups[nodeData.id] = group;

        // Per-node animation: ring rotation + pulse
        Universe.onFrame((delta, elapsed) => {
          group.userData.ring.rotation.z += delta * 0.8;
          const pulse = 1 + Math.sin(elapsed * 1.8 + nodeData.angle) * 0.07;
          group.scale.setScalar(pulse);
          group.userData.spriteMat.opacity = 0.45 + Math.sin(elapsed * 1.4 + nodeData.angle * 0.05) * 0.18;
        });

        // Register clickable (use the whole group)
        Universe.addClickable(group, () => {
          if (window.Camera) Camera.focusNode(nodeData);
          if (window.UI)     UI.openPanel(nodeData.id);
        }, nodeData.label);
      });

      // Connect the orbit arc paths between nodes (optional faint lines)
      this._drawOrbitArcs(scene, data.nodes);
    },

    /** Faint dotted lines between all nav nodes to hint at the constellation */
    _drawOrbitArcs(scene, nodes) {
      const points = nodes.map(n => {
        const rad = (n.angle * Math.PI) / 180;
        return new THREE.Vector3(
          Math.cos(rad) * n.radius, n.y, Math.sin(rad) * n.radius
        );
      });
      points.push(points[0]); // close the loop

      const geo = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: 0x334466,
        transparent: true,
        opacity: 0.18,
        blending: THREE.AdditiveBlending,
        depthWrite: false
      });
      scene.add(new THREE.Line(geo, mat));
    }
  };
})();
