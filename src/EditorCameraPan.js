import * as THREE from "three";

const PAN_KEYS = new Set([
  "KeyW", "KeyA", "KeyS", "KeyD",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
]);

const PAN_SPEED = 14; // units/sec

function isTypingIntoField() {
  const el = document.activeElement;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
}

/**
 * WASD/Arrow-key panning for the editor's orbit camera, moving both the
 * camera and its OrbitControls target together across the ground plane —
 * independent of (and compatible with) the existing mouse-drag orbit/zoom.
 * Ignored while the user is typing into a sidebar/inspector input field.
 */
export function initCameraPan(state) {
  const heldKeys = new Set();

  window.addEventListener("keydown", (event) => {
    if (!PAN_KEYS.has(event.code) || isTypingIntoField()) return;
    heldKeys.add(event.code);
    event.preventDefault();
  });

  window.addEventListener("keyup", (event) => {
    heldKeys.delete(event.code);
  });

  const forward = new THREE.Vector3();
  const right = new THREE.Vector3();
  const up = new THREE.Vector3(0, 1, 0);
  const move = new THREE.Vector3();

  function update(delta) {
    let x = 0;
    let z = 0;
    if (heldKeys.has("KeyW") || heldKeys.has("ArrowUp")) z -= 1;
    if (heldKeys.has("KeyS") || heldKeys.has("ArrowDown")) z += 1;
    if (heldKeys.has("KeyA") || heldKeys.has("ArrowLeft")) x -= 1;
    if (heldKeys.has("KeyD") || heldKeys.has("ArrowRight")) x += 1;
    if (x === 0 && z === 0) return;

    const len = Math.hypot(x, z);
    x /= len;
    z /= len;

    state.camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();
    right.crossVectors(forward, up).normalize();

    move.set(0, 0, 0)
      .addScaledVector(forward, -z)
      .addScaledVector(right, x)
      .multiplyScalar(PAN_SPEED * delta);

    state.camera.position.add(move);
    state.controls.target.add(move);
  }

  return { update };
}
