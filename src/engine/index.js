/**
 * Engine barrel export.
 *
 * Core concepts:
 * - Space: recursive scene node with exterior/interior
 * - SpaceManager: handles context swaps (clear + load)
 * - Teleporter: handles entry/exit (trigger or action)
 */
export { Space } from "./Space.js";
export { SpaceManager } from "./SpaceManager.js";
export { Teleporter } from "./Teleporter.js";

// Legacy (can be removed later)
export { GameObject } from "./GameObject.js";
export { SceneManager } from "./SceneManager.js";
export { GameRenderer } from "./GameRenderer.js";
