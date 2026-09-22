import * as THREE from "three";

/**
 * Teleporter — handles entry/exit between Spaces.
 *
 * Shape:
 *   - circular (default): triggerPosition + radius
 *   - rectangular: triggerPosition + width/depth (axis-aligned box)
 *
 * Types:
 * - trigger: auto on collision (door)
 * - action: manual on key press (TV, computer)
 */
export class Teleporter {
  /**
   * @param {Object} opts
   * @param {string} opts.type - "trigger" | "action"
   * @param {Space} opts.target - the space to enter
   * @param {THREE.Vector3} opts.triggerPosition - where to check collision (source zone center)
   * @param {number} opts.radius - trigger radius (circular mode)
   * @param {number} opts.width - trigger width along X (rectangular mode)
   * @param {number} opts.depth - trigger depth along Z (rectangular mode)
   * @param {THREE.Vector3} opts.position - where to place player (destination)
   * @param {number} opts.orientation - player rotation on arrival (radians)
   * @param {string} opts.key - action key (for action type)
   */
  constructor({
    type = "trigger",
    target = null,
    triggerPosition = null,
    position = new THREE.Vector3(),
    orientation = 0,
    radius = 1.0,
    width = 0,
    depth = 0,
    key = "e",
  } = {}) {
    this.type = type;
    this.target = target;
    this.triggerPosition = triggerPosition || position.clone();
    this.position = position;
    this.orientation = orientation;
    this.radius = radius;
    this.width = width;
    this.depth = depth;
    this.isRectangular = width > 0 && depth > 0;
    this.key = key;

    // Visual (for trigger type)
    this.visual = null;
    if (type === "trigger" && (radius > 0 || this.isRectangular)) {
      this._createVisual();
    }

    // Cooldown
    this.cooldown = 0;
    this.cooldownDuration = 0.8;
  }

  /**
   * Check if player position is inside the trigger zone.
   */
  _isInsideTrigger(playerPos) {
    if (this.isRectangular) {
      const dx = Math.abs(playerPos.x - this.triggerPosition.x);
      const dz = Math.abs(playerPos.z - this.triggerPosition.z);
      return dx <= this.width / 2 && dz <= this.depth / 2;
    }
    const dist = playerPos.distanceTo(this.triggerPosition);
    return dist < this.radius;
  }

  /**
   * Update trigger teleporter (check collision with player).
   */
  updateTrigger(player, delta) {
    if (this.type !== "trigger") return false;
    if (this.cooldown > 0) {
      this.cooldown -= delta;
      return false;
    }

    if (this._isInsideTrigger(player.position)) {
      this.cooldown = this.cooldownDuration;
      return true;
    }
    return false;
  }

  /**
   * Check if player is in range for action teleporter.
   */
  isInRange(player) {
    if (this.type !== "action") return false;
    return this._isInsideTrigger(player.position);
  }

  /**
   * Trigger action teleporter (on key press).
   */
  triggerAction() {
    if (this.type !== "action") return false;
    if (this.cooldown > 0) return false;
    this.cooldown = this.cooldownDuration;
    return true;
  }

  /**
   * Update cooldown.
   */
  update(delta) {
    if (this.cooldown > 0) {
      this.cooldown -= delta;
    }
  }

  /**
   * Create visual indicator (ring on ground or rectangle on ground).
   */
  _createVisual() {
    let geometry;
    if (this.isRectangular) {
      geometry = new THREE.PlaneGeometry(this.width, this.depth);
    } else {
      geometry = new THREE.RingGeometry(this.radius - 0.1, this.radius, 32);
    }
    const material = new THREE.MeshBasicMaterial({
      color: this.type === "trigger" ? 0x00e5ff : 0xff9100,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.4,
    });
    this.visual = new THREE.Mesh(geometry, material);
    this.visual.rotation.x = -Math.PI / 2;
    this.visual.position.copy(this.triggerPosition);
    this.visual.position.y = 0.01;
  }

  /**
   * Get visual object (for adding to scene).
   */
  getVisual() {
    return this.visual;
  }
}
