import * as THREE from "three";

const PAN_KEYS = new Set([
  "KeyW", "KeyA", "KeyS", "KeyD",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
]);

const PAN_SPEED = 14; // units/sec
const VERTICAL_PAN_SPEED = 10; // units/sec for Q/E

const MOVE_STEP = 0.5;   // arrow key move increment
const ROTATE_STEP = Math.PI / 12; // 15 degrees
const SCALE_STEP = 0.1;

function isTypingIntoField() {
  const el = document.activeElement;
  return !!el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA");
}

/**
 * WASD/Arrow-key panning for the editor's orbit camera, plus keyboard
 * shortcuts for the selected object (arrow keys to move, R to rotate,
 * Delete to remove, Escape to deselect, Ctrl+D to duplicate).
 * Q/E moves the camera vertically.
 */
export function initCameraPan(state) {
  const heldKeys = new Set();

  window.addEventListener("keydown", (event) => {
    if (isTypingIntoField()) return;

    const code = event.code;

    // Camera pan keys
    if (PAN_KEYS.has(code)) {
      heldKeys.add(code);
      event.preventDefault();
      return;
    }

    // Q/E vertical camera pan
    if (code === "KeyQ" || code === "KeyE") {
      heldKeys.add(code);
      event.preventDefault();
      return;
    }

    // --- Object manipulation shortcuts (require selected part, no tool armed) ---
    if (state.selectedPartId && !state.armedTool) {
      const part = state.parts.find((p) => p.id === state.selectedPartId);
      if (!part) return;

      switch (code) {
        case "Delete":
        case "Backspace":
          event.preventDefault();
          state.onDeletePart?.();
          break;

        case "Escape":
          event.preventDefault();
          state.onDeselect?.();
          break;

        case "ArrowUp":
          event.preventDefault();
          if (event.shiftKey) {
            part.position.y = Math.max(0, part.position.y + MOVE_STEP);
          } else {
            part.position.z -= MOVE_STEP;
          }
          state.onPartChanged?.(part);
          break;

        case "ArrowDown":
          event.preventDefault();
          if (event.shiftKey) {
            part.position.y = Math.max(0, part.position.y - MOVE_STEP);
          } else {
            part.position.z += MOVE_STEP;
          }
          state.onPartChanged?.(part);
          break;

        case "ArrowLeft":
          event.preventDefault();
          part.position.x -= MOVE_STEP;
          state.onPartChanged?.(part);
          break;

        case "ArrowRight":
          event.preventDefault();
          part.position.x += MOVE_STEP;
          state.onPartChanged?.(part);
          break;

        case "KeyR":
          event.preventDefault();
          part.rotationY += ROTATE_STEP;
          state.onPartChanged?.(part);
          break;

        case "KeyF":
          event.preventDefault();
          part.rotationY -= ROTATE_STEP;
          state.onPartChanged?.(part);
          break;

        case "Equal": // + key
        case "NumpadAdd":
          event.preventDefault();
          part.scale = (part.scale ?? 1) + SCALE_STEP;
          state.onPartChanged?.(part);
          break;

        case "Minus":
        case "NumpadSubtract":
          event.preventDefault();
          part.scale = Math.max(0.05, (part.scale ?? 1) - SCALE_STEP);
          state.onPartChanged?.(part);
          break;

        case "KeyD":
          if (event.ctrlKey || event.metaKey) {
            event.preventDefault();
            state.onDuplicatePart?.();
          }
          break;
      }
    }

    // Escape also disarms tool
    if (code === "Escape" && state.armedTool) {
      event.preventDefault();
      state.armedTool = null;
      state.onToolDisarmed?.();
    }
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
    let y = 0;

    if (heldKeys.has("KeyW") || heldKeys.has("ArrowUp")) z -= 1;
    if (heldKeys.has("KeyS") || heldKeys.has("ArrowDown")) z += 1;
    if (heldKeys.has("KeyA") || heldKeys.has("ArrowLeft")) x -= 1;
    if (heldKeys.has("KeyD") || heldKeys.has("ArrowRight")) x += 1;
    if (heldKeys.has("KeyQ")) y -= 1;
    if (heldKeys.has("KeyE")) y += 1;

    if (x === 0 && z === 0 && y === 0) return;

    // Horizontal pan
    if (x !== 0 || z !== 0) {
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

    // Vertical pan
    if (y !== 0) {
      state.camera.position.y += VERTICAL_PAN_SPEED * delta * y;
      state.controls.target.y += VERTICAL_PAN_SPEED * delta * y;
    }
  }

  return { update };
}
