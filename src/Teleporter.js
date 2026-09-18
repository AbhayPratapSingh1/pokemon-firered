import * as THREE from "three";

/**
 * A zone defined by min/max X and Z coordinates (axis-aligned, full Y range).
 */
export class Zone {
  constructor(xMin, xMax, zMin, zMax) {
    this.xMin = xMin;
    this.xMax = xMax;
    this.zMin = zMin;
    this.zMax = zMax;
  }

  contains(x, z) {
    return x >= this.xMin && x <= this.xMax && z >= this.zMin && z <= this.zMax;
  }
}

/**
 * Teleporter — a trigger zone that teleports the player to a destination
 * when they step into it. Supports optional visual indicator (glowing ring).
 *
 * Usage:
 *   const tp = new Teleporter({
 *     from: { x: -14, z: -8, radius: 1.0 },
 *     to:   { x: -14, z: -12 },
 *     cooldown: 0.8,
 *   });
 *   scene.add(tp.mesh);
 *   // In game loop: tp.update(player);
 */
export class Teleporter {
  /**
   * @param {Object} opts
   * @param {Object} opts.from   - { x, z, radius } trigger position + radius
   * @param {Object} opts.to     - { x, z, y? } destination
   * @param {number} opts.cooldown - seconds before re-trigger (default 0.8)
   * @param {number} opts.color  - ring color (default 0x00e5ff cyan)
   * @param {boolean} opts.showVisual - show glowing ring (default true)
   */
  constructor({ from, to, cooldown = 0.8, color = 0x00e5ff, showVisual = true }) {
    this.from = from;
    this.to = to;
    this.cooldownDuration = cooldown;
    this.cooldown = 0;
    this.triggered = false;

    // Trigger zone (circular, approximated as square for simplicity)
    const r = from.radius || 1.0;
    this.zone = new Zone(from.x - r, from.x + r, from.z - r, from.z + r);

    // Visual indicator (glowing ring on ground)
    this.mesh = null;
    if (showVisual) {
      this._buildVisual(color);
    }
  }

  _buildVisual(color) {
    const group = new THREE.Group();

    // Outer ring
    const ringGeo = new THREE.RingGeometry(0.6, 0.8, 24);
    const ringMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.5,
      transparent: true,
      opacity: 0.6,
      side: THREE.DoubleSide,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = -Math.PI / 2;
    ring.position.set(this.from.x, 0.05, this.from.z);
    group.add(ring);

    // Inner glow circle
    const glowGeo = new THREE.CircleGeometry(0.55, 24);
    const glowMat = new THREE.MeshStandardMaterial({
      color,
      emissive: color,
      emissiveIntensity: 0.3,
      transparent: true,
      opacity: 0.25,
      side: THREE.DoubleSide,
    });
    const glow = new THREE.Mesh(glowGeo, glowMat);
    glow.rotation.x = -Math.PI / 2;
    glow.position.set(this.from.x, 0.04, this.from.z);
    group.add(glow);

    this.mesh = group;
    this._ring = ring;
  }

  /**
   * Call every frame. Returns true if the player was teleported.
   * @param {{ position: THREE.Vector3 }} player
   * @param {number} delta - time since last frame in seconds
   */
  update(player, delta) {
    // Tick cooldown
    if (this.cooldown > 0) {
      this.cooldown -= delta;
      return false;
    }

    const { x, z } = player.position;

    if (this.zone.contains(x, z)) {
      // Teleport player
      player.position.set(
        this.to.x,
        this.to.y ?? 0,
        this.to.z
      );
      this.cooldown = this.cooldownDuration;
      this.triggered = true;
      return true;
    }

    return false;
  }

  /** Pulse animation for the ring (call in render loop). */
  animate(time) {
    if (this._ring) {
      this._ring.material.opacity = 0.4 + Math.sin(time * 3) * 0.2;
    }
  }
}
