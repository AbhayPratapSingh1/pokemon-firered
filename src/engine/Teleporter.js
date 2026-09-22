import * as THREE from "three";

/**
 * Teleporter — handles entry/exit between Spaces.
 *
 * Types:
 * - trigger: auto on collision (door)
 * - action: manual on key press (TV, computer)
 *
 * On enter:
 *   1. Clear scene
 *   2. Load target space's interior + child exteriors
 *   3. Place player at position with orientation
 *
 * On exit:
 *   1. Clear scene
 *   2. Load parent space's context
 *   3. Place player at exit position with orientation
 */
export class Teleporter {
  /**
   * @param {Object} opts
   * @param {string} opts.type - "trigger" | "action"
   * @param {Space} opts.target - the space to enter
   * @param {THREE.Vector3} opts.triggerPosition - where to check collision (source zone)
   * @param {number} opts.radius - trigger radius
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
    key = "e",
  } = {}) {
    this.type = type;
    this.target = target;
    this.triggerPosition = triggerPosition || position.clone();
    this.position = position;
    this.orientation = orientation;
    this.radius = radius;
    this.key = key;

    // Visual (for trigger type)
    this.visual = null;
    if (type === "trigger" && radius > 0) {
      this._createVisual();
    }

    // Cooldown
    this.cooldown = 0;
    this.cooldownDuration = 0.8;
  }

  /**
   * Update trigger teleporter (check collision with player).
   * Checks against triggerPosition, not destination position.
   */
  updateTrigger(player, delta) {
    if (this.type !== "trigger") return false;
    if (this.cooldown > 0) {
      this.cooldown -= delta;
      return false;
    }

    const dist = player.position.distanceTo(this.triggerPosition);
    if (dist < this.radius) {
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
    const dist = player.position.distanceTo(this.triggerPosition);
    return dist < this.radius;
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
   * Create visual indicator (ring on ground).
   */
  _createVisual() {
    const geometry = new THREE.RingGeometry(this.radius - 0.1, this.radius, 32);
    const material = new THREE.MeshBasicMaterial({
      color: this.type === "trigger" ? 0x00e5ff : 0xff9100,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.5,
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
