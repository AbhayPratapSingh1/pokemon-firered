import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { resolveCollisions } from "./Collision.js";

const WALK_SPEED = 3.2;
const SPRINT_MULTIPLIER = 1.8;
const ACCELERATION = 12; // how quickly velocity approaches target (per second)
const GRAVITY = -20;
const JUMP_SPEED = 8;
const ROTATION_SMOOTHING = 12;
const STEP_SNAP_SMOOTHING = 18; // how quickly the feet rise onto a higher step/stair tread
const STEP_SNAP_MAX_GAP = 0.6; // above this, treat it as a normal landing (snap instantly), not a stair step
const STEP_SNAP_EPSILON = 0.01; // below this remaining gap, snap fully rather than keep asymptotically decaying
const MAX_STEP_UP = 0.5; // max height the player can step up onto a surface

// Exported so other systems (e.g. the player house's staircase) can size
// their geometry off the player's actual capsule instead of guessing.
export const COLLISION_RADIUS = 0.45;
export const COLLISION_HEIGHT = 1.8;
const HEAD_HEIGHT = 1.55; // used by the camera as a look target, independent of load state

// Adventurer character (CC0) by Quaternius, via poly.pizza — free-licensed
// low-poly humanoid with a cap/jacket/backpack "trainer" look and a full
// locomotion animation set. Swap this file to change the player's look.
const MODEL_URL = new URL("../assets/adventurer.glb", import.meta.url).href;
const TARGET_HEIGHT = 1.8; // meters, world scale the model is normalized to

// If the character appears to walk backwards or sideways relative to the
// input direction, adjust this (try Math.PI, Math.PI / 2, or -Math.PI / 2)
// to correct the model's forward axis.
const MODEL_FORWARD_OFFSET = 0;

const CLIP_NAMES = {
  idle: "CharacterArmature|Idle",
  walk: "CharacterArmature|Walk",
  run: "CharacterArmature|Run",
};

function buildPlaceholderMesh() {
  // Simple stand-in shown while the real model downloads, so the player is
  // visible from frame one instead of popping in.
  const group = new THREE.Group();
  const material = new THREE.MeshStandardMaterial({ color: 0x2a9d8f });
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.35, 0.9, 4, 8), material);
  body.position.y = 1.0;
  body.castShadow = true;
  group.add(body);
  return group;
}

export class Player {
  constructor(scene, spawnPosition = new THREE.Vector3(0, 0, 0)) {
    this.root = new THREE.Group();
    this.root.position.copy(spawnPosition);
    scene.add(this.root);

    this.placeholder = buildPlaceholderMesh();
    this.root.add(this.placeholder);

    this.mixer = null;
    this.actions = {};
    this.currentAction = null;

    this.velocity = new THREE.Vector3(0, 0, 0);
    this.isGrounded = true;
    this.facingAngle = 0; // radians, used to smoothly rotate the root

    this._loadModel(scene);
  }

  _loadModel() {
    const loader = new GLTFLoader();
    loader.load(
      MODEL_URL,
      (gltf) => {
        const model = gltf.scene;
        model.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
          }
        });

        // Normalize scale so the model is TARGET_HEIGHT tall, then align its
        // feet to y=0 regardless of how the source asset was authored.
        const box = new THREE.Box3().setFromObject(model);
        const size = new THREE.Vector3();
        box.getSize(size);
        const scale = size.y > 0 ? TARGET_HEIGHT / size.y : 1;
        model.scale.setScalar(scale);

        const scaledBox = new THREE.Box3().setFromObject(model);
        model.position.y -= scaledBox.min.y;
        model.rotation.y = MODEL_FORWARD_OFFSET;

        if (this.placeholder) {
          this.root.remove(this.placeholder);
          this.placeholder = null;
        }
        this.root.add(model);

        this.mixer = new THREE.AnimationMixer(model);
        for (const [key, clipName] of Object.entries(CLIP_NAMES)) {
          const clip = THREE.AnimationClip.findByName(gltf.animations, clipName);
          if (clip) this.actions[key] = this.mixer.clipAction(clip);
        }
        this._playAnimation("idle", 0);
      },
      undefined,
      (error) => {
        console.error("Failed to load player model, keeping placeholder:", error);
        const banner = document.getElementById("model-error");
        if (banner) {
          banner.textContent =
            `Player model failed to load from ${MODEL_URL} — showing placeholder capsule instead. ` +
            "Make sure you're serving this project over http:// (not opening index.html directly), " +
            "and do a hard refresh (Cmd/Ctrl+Shift+R) to clear any cached files.";
          banner.classList.remove("hidden");
        }
      }
    );
  }

  _playAnimation(name, fadeDuration = 0.2) {
    const next = this.actions[name];
    if (!next || this.currentAction === next) return;

    next.reset().fadeIn(fadeDuration).play();
    if (this.currentAction) this.currentAction.fadeOut(fadeDuration);
    this.currentAction = next;
  }

  get position() {
    return this.root.position;
  }

  /** Head height above feet, used by the camera controller as a look target. */
  get headHeight() {
    return HEAD_HEIGHT;
  }

  update(delta, input, cameraYaw, obstacles, getGroundHeight = () => 0) {
    // --- Determine desired horizontal movement direction relative to camera yaw ---
    let inputX = 0; // strafe
    let inputZ = 0; // forward/back
    if (input.forward) inputZ -= 1;
    if (input.backward) inputZ += 1;
    if (input.left) inputX -= 1;
    if (input.right) inputX += 1;

    const hasInput = inputX !== 0 || inputZ !== 0;
    const targetVelocity = new THREE.Vector3();

    if (hasInput) {
      const inputVector = new THREE.Vector3(inputX, 0, inputZ).normalize();
      // Rotate input by camera yaw so "forward" matches where the camera looks.
      inputVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), cameraYaw);

      const speed = WALK_SPEED * (input.sprint ? SPRINT_MULTIPLIER : 1);
      targetVelocity.set(inputVector.x * speed, 0, inputVector.z * speed);
    }

    // Smoothly accelerate/decelerate horizontal velocity toward target.
    const t = 1 - Math.exp(-ACCELERATION * delta);
    this.velocity.x += (targetVelocity.x - this.velocity.x) * t;
    this.velocity.z += (targetVelocity.z - this.velocity.z) * t;

    // Rotate root to face movement direction (smoothed).
    if (hasInput) {
      const targetAngle = Math.atan2(this.velocity.x, this.velocity.z);
      let diff = targetAngle - this.facingAngle;
      diff = Math.atan2(Math.sin(diff), Math.cos(diff)); // shortest angular distance
      this.facingAngle += diff * Math.min(1, ROTATION_SMOOTHING * delta);
      this.root.rotation.y = this.facingAngle;
    }

    // --- Gravity & jumping ---
    this.velocity.y += GRAVITY * delta;
    if (input.jumpPressed && this.isGrounded) {
      this.velocity.y = JUMP_SPEED;
      this.isGrounded = false;
    }

    // --- Integrate position ---
    this.root.position.x += this.velocity.x * delta;
    this.root.position.y += this.velocity.y * delta;
    this.root.position.z += this.velocity.z * delta;

    // --- Ground clamp ---
    // Combine terrain ground height with standable furniture surfaces
    const px = this.root.position.x, pz = this.root.position.z;
    let groundHeight = getGroundHeight(px, pz);
    for (const obs of obstacles) {
      if (!obs.canStandOn) continue;
      // Is player horizontally over this object?
      if (px + COLLISION_RADIUS > obs.box.min.x && px - COLLISION_RADIUS < obs.box.max.x &&
          pz + COLLISION_RADIUS > obs.box.min.z && pz - COLLISION_RADIUS < obs.box.max.z) {
        const surface = obs.box.max.y;
        const feetY = this.root.position.y;
        // Only snap if surface is reachable (within step-up height from current position)
        if (surface - feetY <= MAX_STEP_UP) {
          groundHeight = Math.max(groundHeight, surface);
        }
      }
    }
    if (this.root.position.y <= groundHeight) {
      const gap = groundHeight - this.root.position.y;
      if (gap > 0 && gap <= STEP_SNAP_MAX_GAP) {
        // Small step-up (a stair tread): ease toward it so a real quantized
        // staircase (each tread a discrete +stepHeight jump) reads as smooth
        // climbing rather than a series of teleports. Below STEP_SNAP_EPSILON,
        // snap fully instead of continuing to decay — an exponential ease
        // never mathematically reaches its target, and adjacent level
        // geometry (e.g. the floor-2 slab starting at exactly this tread's
        // height) sits flush against this exact Y, so leaving even a
        // fraction-of-a-millimeter gap forever means the player's feet never
        // legally clear it — resolveCollisions then rejects every horizontal
        // step across that boundary, forever. This caused a real deadlock:
        // walking off the top of the staircase would permanently stall.
        const t = 1 - Math.exp(-STEP_SNAP_SMOOTHING * delta);
        const eased = gap * t;
        this.root.position.y += eased;
        if (groundHeight - this.root.position.y < STEP_SNAP_EPSILON) {
          this.root.position.y = groundHeight;
        }
      } else {
        // A larger gap means this is a normal landing (jump/fall onto flat
        // ground), not a stair step — snap instantly so the feet never
        // visibly sink below the floor while easing catches up.
        this.root.position.y = groundHeight;
      }
      this.velocity.y = 0;
      this.isGrounded = true;
    }

    // --- Obstacle collision (horizontal push-out) ---
    resolveCollisions(this.root.position, COLLISION_RADIUS, COLLISION_HEIGHT, obstacles);

    // --- Locomotion animation state ---
    if (hasInput) {
      this._playAnimation(input.sprint ? "run" : "walk");
    } else {
      this._playAnimation("idle");
    }
    if (this.mixer) this.mixer.update(delta);
  }
}
