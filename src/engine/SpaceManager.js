import * as THREE from "three";

/**
 * Space Manager — handles context swaps in the recursive Space system.
 *
 * Flow:
 * 1. Teleporter detects entry (trigger collision or action key press)
 * 2. SpaceManager.clear() removes all objects from scene
 * 3. SpaceManager.load(space) adds space's interior + child exteriors
 * 4. Player position/orientation set by teleporter
 *
 * Usage:
 *   const sm = new SpaceManager(scene);
 *   sm.load(worldSpace);
 *
 *   // On teleport trigger:
 *   sm.clear();
 *   sm.load(targetSpace);
 *   player.position.copy(teleporter.position);
 *   player.rotation.y = teleporter.orientation;
 */
export class SpaceManager {
  /**
   * @param {THREE.Scene} scene
   */
  constructor(scene) {
    this.scene = scene;
    this.currentSpace = null;
    this.currentObjects = [];
  }

  /**
   * Load a space's objects into the scene.
   *
   * @param {Space} space - the space to load
   */
  load(space) {
    this.currentSpace = space;
    this.currentObjects = space.getInsideObjects();

    for (const obj of this.currentObjects) {
      this.scene.add(obj);
    }
  }

  /**
   * Clear all current objects from the scene.
   */
  clear() {
    for (const obj of this.currentObjects) {
      this.scene.remove(obj);
    }
    this.currentObjects = [];
    this.currentSpace = null;
  }

  /**
   * Teleport to a new space.
   * Clears current, loads new, returns new space for player placement.
   *
   * @param {Space} targetSpace
   * @param {Teleporter} teleporter - for position/orientation
   * @returns {Space} the loaded space
   */
  teleport(targetSpace, teleporter) {
    this.clear();
    this.load(targetSpace);
    return targetSpace;
  }

  /**
   * Get current space.
   */
  getCurrent() {
    return this.currentSpace;
  }

  /**
   * Get all meshes currently in the scene.
   */
  getCurrentMeshes() {
    return this.currentObjects;
  }

  /**
   * Get debug info.
   */
  getDebugInfo() {
    return this.currentSpace ? this.currentSpace.name : "none";
  }
}
