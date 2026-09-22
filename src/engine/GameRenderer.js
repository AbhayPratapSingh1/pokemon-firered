import * as THREE from "three";
import { SceneManager } from "./SceneManager.js";

/**
 * Game Renderer — wraps Three.js renderer with recursive scene management.
 *
 * Architecture:
 *   render(sceneManager) → iterates active scene → renders each GameObject
 *                          → if has children → render(child)
 *                          → if no children → render mesh
 *
 * Usage:
 *   const renderer = new GameRenderer(canvas);
 *   renderer.setScene(sceneManager);
 *
 *   // Game loop:
 *   renderer.beginFrame();
 *   renderer.renderScene(delta);
 *   renderer.endFrame();
 */
export class GameRenderer {
  /**
   * @param {HTMLCanvasElement} canvas
   */
  constructor(canvas) {
    this.renderer = new THREE.WebGLRenderer({ antialias: true, canvas });
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.sceneManager = null;
    this.camera = null;

    // Handle resize
    window.addEventListener("resize", () => this.onResize());
  }

  /**
   * Set the scene manager to render from.
   * @param {SceneManager} sceneManager
   */
  setScene(sceneManager) {
    this.sceneManager = sceneManager;
  }

  /**
   * Set the camera to render with.
   * @param {THREE.Camera} camera
   */
  setCamera(camera) {
    this.camera = camera;
  }

  /**
   * Handle window resize.
   */
  onResize() {
    if (!this.camera) return;
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  /**
   * Begin a new frame.
   */
  beginFrame() {
    // Nothing to do here for now
  }

  /**
   * Render the active scene recursively.
   * This is the core of the recursive rendering system.
   *
   * @param {THREE.Scene} scene - the Three.js scene to render into
   */
  renderScene(scene) {
    if (!this.camera) return;

    // The SceneManager handles visibility (show/hide)
    // Three.js renders whatever is visible in the scene
    this.renderer.render(scene, this.camera);
  }

  /**
   * End the current frame.
   */
  endFrame() {
    // Nothing to do here for now
  }

  /**
   * Get the underlying Three.js renderer (for direct access if needed).
   */
  getDomElement() {
    return this.renderer.domElement;
  }
}
