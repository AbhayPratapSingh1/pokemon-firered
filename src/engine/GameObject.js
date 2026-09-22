import * as THREE from "three";

/**
 * Base class for all game objects in the recursive rendering system.
 *
 * Each object has:
 * - mesh: the THREE.Object3D to render (or null for containers)
 * - children: sub-objects to render recursively
 * - visible: whether this object is currently rendered
 * - internal: if true, not rendered in world view (only when zoomed in)
 *
 * Usage:
 *   const house = new GameObject({
 *     mesh: houseGroup,
 *     children: [interior, furniture],
 *     internal: false,  // visible in world
 *   });
 */
export class GameObject {
  /**
   * @param {Object} opts
   * @param {THREE.Object3D} opts.mesh - the 3D object (or null for container)
   * @param {GameObject[]} opts.children - child objects
   * @param {boolean} opts.internal - if true, hidden in world view
   * @param {string} opts.name - debug name
   */
  constructor({ mesh = null, children = [], internal = false, name = "" } = {}) {
    this.mesh = mesh;
    this.children = children;
    this.internal = internal;
    this.name = name;
    this.visible = true;
  }

  /**
   * Add a child object.
   */
  addChild(child) {
    this.children.push(child);
    return this;
  }

  /**
   * Remove a child object.
   */
  removeChild(child) {
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    return this;
  }

  /**
   * Show this object and all children.
   */
  show() {
    this.visible = true;
    if (this.mesh) this.mesh.visible = true;
    for (const child of this.children) child.show();
    return this;
  }

  /**
   * Hide this object and all children.
   */
  hide() {
    this.visible = false;
    if (this.mesh) this.mesh.visible = false;
    for (const child of this.children) child.hide();
    return this;
  }

  /**
   * Show only external items (hide internals).
   * Used when rendering the world view.
   */
  showExternal() {
    if (this.internal) {
      this.hide();
      return;
    }
    this.visible = true;
    if (this.mesh) this.mesh.visible = true;
    for (const child of this.children) child.showExternal();
    return this;
  }

  /**
   * Show all items including internals.
   * Used when rendering a specific house interior.
   */
  showAll() {
    this.visible = true;
    if (this.mesh) this.mesh.visible = true;
    for (const child of this.children) child.showAll();
    return this;
  }

  /**
   * Recursively update all children.
   * Override in subclasses for custom behavior.
   */
  update(delta, context) {
    for (const child of this.children) {
      child.update(delta, context);
    }
  }

  /**
   * Get all meshes for raycasting/collision.
   * Traverses children recursively.
   */
  getMeshes() {
    const meshes = [];
    if (this.mesh) meshes.push(this.mesh);
    for (const child of this.children) {
      meshes.push(...child.getMeshes());
    }
    return meshes;
  }

  /**
   * Get all external-only meshes (for world view).
   */
  getExternalMeshes() {
    if (this.internal) return [];
    const meshes = [];
    if (this.mesh) meshes.push(this.mesh);
    for (const child of this.children) {
      meshes.push(...child.getExternalMeshes());
    }
    return meshes;
  }

  /**
   * Get all meshes including internals (for interior view).
   */
  getAllMeshes() {
    const meshes = [];
    if (this.mesh) meshes.push(this.mesh);
    for (const child of this.children) {
      meshes.push(...child.getAllMeshes());
    }
    return meshes;
  }
}
