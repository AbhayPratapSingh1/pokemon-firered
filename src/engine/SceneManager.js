import * as THREE from "three";

/**
 * Scene Manager — manages full context swaps.
 *
 * Only ONE context exists in the scene at a time:
 * - WORLD: ground, trees, house exteriors
 * - INTERIOR: house interior only
 *
 * On enter house:
 *   1. Remove all world objects from scene
 *   2. Build/add interior objects
 *
 * On exit house:
 *   1. Remove all interior objects from scene
 *   2. Re-add world objects
 *
 * Usage:
 *   const sm = new SceneManager(scene);
 *   sm.setWorld(worldObjects);
 *   sm.registerInterior("garyHouse", buildGaryInterior);
 *
 *   // On teleport:
 *   sm.enterInterior("garyHouse");
 *   sm.exitInterior();
 */
export class SceneManager {
  /**
   * @param {THREE.Scene} scene - the Three.js scene to manage
   */
  constructor(scene) {
    this.scene = scene;

    // World objects (array of THREE.Object3D)
    this.worldObjects = [];
    this.worldBuilt = false;

    // Interior builders (name -> function that returns array of Object3D)
    this.interiorBuilders = new Map();

    // Currently active interior objects
    this.activeInterior = null;
    this.activeInteriorName = null;

    // State
    this.currentContext = "world"; // "world" or interior name
  }

  /**
   * Set the world objects that make up the outdoor scene.
   * @param {THREE.Object3D[]} objects
   */
  setWorld(objects) {
    this.worldObjects = objects;
    return this;
  }

  /**
   * Register an interior builder function.
   * The builder is called once and cached.
   *
   * @param {string} name - interior name
   * @param {function} builder - function that returns { objects: Object3D[], obstacles: [], ... }
   */
  registerInterior(name, builder) {
    this.interiorBuilders.set(name, builder);
    return this;
  }

  /**
   * Enter an interior context.
   * Removes world from scene, builds/adds interior.
   *
   * @param {string} name - interior name
   * @returns {object} interior data (obstacles, etc.)
   */
  enterInterior(name) {
    if (this.currentContext === name) return this._activeData;

    const builder = this.interiorBuilders.get(name);
    if (!builder) {
      console.error(`No interior registered for "${name}"`);
      return null;
    }

    // 1. Remove world from scene
    this._removeWorld();

    // 2. Build interior (if not cached)
    if (!this._interiorCache) this._interiorCache = {};
    if (!this._interiorCache[name]) {
      this._interiorCache[name] = builder();
    }

    // 3. Add interior to scene
    const interiorData = this._interiorCache[name];
    this._addInterior(interiorData);

    this.activeInterior = interiorData;
    this.activeInteriorName = name;
    this.currentContext = name;

    return interiorData;
  }

  /**
   * Exit interior and return to world.
   * Removes interior from scene, re-adds world.
   */
  exitInterior() {
    if (this.currentContext === "world") return;

    // 1. Remove interior from scene
    this._removeInterior();

    // 2. Re-add world to scene
    this._addWorld();

    this.activeInterior = null;
    this.activeInteriorName = null;
    this.currentContext = "world";
  }

  /**
   * Check if we're in world context.
   */
  isWorld() {
    return this.currentContext === "world";
  }

  /**
   * Check if we're in an interior context.
   */
  isInterior() {
    return this.currentContext !== "world";
  }

  /**
   * Get the current interior name.
   */
  getCurrentInterior() {
    return this.activeInteriorName;
  }

  // --- Private methods ---

  _removeWorld() {
    for (const obj of this.worldObjects) {
      this.scene.remove(obj);
    }
    this.worldBuilt = false;
  }

  _addWorld() {
    for (const obj of this.worldObjects) {
      this.scene.add(obj);
    }
    this.worldBuilt = true;
  }

  _addInterior(interiorData) {
    if (interiorData.objects) {
      for (const obj of interiorData.objects) {
        this.scene.add(obj);
      }
    }
  }

  _removeInterior() {
    if (this.activeInterior && this.activeInterior.objects) {
      for (const obj of this.activeInterior.objects) {
        this.scene.remove(obj);
      }
    }
  }
}
