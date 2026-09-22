import * as THREE from "three";
import { createWorld, SPACE_LOOKUP, WORLD } from "./World.js";
import { ACTIONS, COLORS } from "./config/index.js";
import { Player } from "./Player.js";
import { InputManager } from "./Input.js";
import { CameraController } from "./CameraController.js";

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// --- Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(WORLD.BACKGROUND_COLOR);
scene.fog = new THREE.Fog(WORLD.BACKGROUND_COLOR, WORLD.FOG_NEAR, WORLD.FOG_FAR);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 2, 5);

// --- Lighting ---
const hemiLight = new THREE.HemisphereLight(0xbfd9ff, COLORS.GRASS_GREEN, 0.9);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(40, 60, 20);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(2048, 2048);
sunLight.shadow.camera.left = -80;
sunLight.shadow.camera.right = 80;
sunLight.shadow.camera.top = 80;
sunLight.shadow.camera.bottom = -80;
sunLight.shadow.camera.near = 1;
sunLight.shadow.camera.far = 200;
scene.add(sunLight);

// --- World ---
const world = createWorld(scene);
const { spaceManager, allTeleporters } = world;

// Start inside the house for testing
spaceManager.clear();
spaceManager.load(SPACE_LOOKUP["ASH_HOUSE"]);

// --- Player ---
const player = new Player(scene, WORLD.SPAWN_POSITION);

// --- Input ---
const input = new InputManager(renderer.domElement);
const cameraController = new CameraController(camera);

// --- Resize ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Ground height ---
function getGroundHeight(x, z) {
  const current = spaceManager.getCurrent();
  if (current && current.data && current.data.groundHeight) {
    return current.data.groundHeight(x, z);
  }
  return 0;
}

// --- Teleport cooldown ---
let teleportCooldown = 0;
let inputLockTimer = 0;
const TELEPORT_GLOBAL_COOLDOWN = 1.0;
const INPUT_LOCK_DURATION = 0.2;

// --- Interaction ---
const INTERACT_RANGE = 2.0;
let nearestInteractable = null;
const promptEl = document.getElementById("interact-prompt");

// --- Teleport function ---
function handleTeleport(targetSpaceName, spawnPos, spawnOrientation) {
  const targetSpace = SPACE_LOOKUP[targetSpaceName];
  if (!targetSpace) {
    console.error(`[TELEPORT] Unknown space: ${targetSpaceName}`);
    return;
  }

  spaceManager.clear();
  spaceManager.load(targetSpace);

  player.position.set(spawnPos[0], spawnPos[1], spawnPos[2]);
  player.velocity.set(0, 0, 0);
  player.facingAngle = spawnOrientation;
  player.root.rotation.y = spawnOrientation;

  const groundY = getGroundHeight(player.position.x, player.position.z);
  player.position.y = groundY;

  teleportCooldown = TELEPORT_GLOBAL_COOLDOWN;
  inputLockTimer = INPUT_LOCK_DURATION;
}

// --- Action handler ---
let messageTimer = 0;
const MESSAGE_DURATION = 3.0;
const messageEl = document.getElementById("interact-message");

function handleAction(action) {
  switch (action.type) {
    case ACTIONS.MESSAGE:
      console.log(`[ACTION] ${action.message}`);
      showMessage(action.message);
      break;
    case ACTIONS.GIVE_ITEM:
      console.log(`[ACTION] ${action.message}`);
      showMessage(action.message);
      break;
    case ACTIONS.CHANGE_SPACE:
      handleTeleport(
        action.targetSpace,
        action.spawnPosition,
        action.spawnOrientation || 0
      );
      break;
    default:
      console.log(`[ACTION] Unknown action type: ${action.type}`);
  }
}

function showMessage(text) {
  if (messageEl) {
    messageEl.textContent = text;
    messageEl.classList.remove("hidden");
    messageTimer = MESSAGE_DURATION;
  }
}

// --- Get obstacles ---
function getCurrentObstacles() {
  const current = spaceManager.getCurrent();
  if (current && current.data && current.data.obstacles) {
    return current.data.obstacles;
  }
  return world.worldObstacles;
}

// --- Game loop ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.1);

  input.update();

  // Input lock after teleport prevents drift
  if (inputLockTimer > 0) {
    inputLockTimer -= delta;
    input.clear();
  }

  // Check all teleporters
  if (teleportCooldown > 0) {
    teleportCooldown -= delta;
  } else {
    for (const tp of allTeleporters) {
      const dist = player.position.distanceTo(tp.entry.triggerPosition);
      if (dist < tp.entry.radius) {
        console.log(`[TRIGGER] ${tp.config.targetSpace} dist=${dist.toFixed(2)}`);
        handleTeleport(tp.config.targetSpace, tp.config.spawnPosition, tp.config.spawnOrientation);
        break;
      }
    }
  }

  // Update teleporter cooldowns
  for (const tp of allTeleporters) {
    tp.entry.update(delta);
  }

  // Interaction: find nearest interactable and handle E press
  nearestInteractable = null;
  const currentSpace = spaceManager.getCurrent();
  if (currentSpace && currentSpace.data && currentSpace.data.interactables) {
    let closestDist = INTERACT_RANGE;
    for (const obj of currentSpace.data.interactables) {
      const dist = player.position.distanceTo(obj.position);
      if (dist < closestDist) {
        closestDist = dist;
        nearestInteractable = obj;
      }
    }
  }

  // Show/hide prompt
  if (promptEl) {
    if (nearestInteractable && inputLockTimer <= 0) {
      promptEl.textContent = nearestInteractable.userData.action.prompt;
      promptEl.classList.remove("hidden");
    } else {
      promptEl.classList.add("hidden");
    }
  }

  // E key triggers action
  if (nearestInteractable && input.interactPressed && inputLockTimer <= 0) {
    handleAction(nearestInteractable.userData.action);
  }

  // Message timer
  if (messageTimer > 0) {
    messageTimer -= delta;
    if (messageTimer <= 0 && messageEl) {
      messageEl.classList.add("hidden");
    }
  }

  // Update player
  const obstacles = getCurrentObstacles();
  player.update(delta, input, cameraController.yaw, obstacles, getGroundHeight);

  // Update camera — collect meshes that block camera ray
  const cameraCollideMeshes = [];
  if (currentSpace) {
    for (const obj of currentSpace.getInsideObjects()) {
      obj.traverse((child) => {
        if (child.isMesh && (child.userData.collide || child.userData.cameraCollide)) {
          cameraCollideMeshes.push(child);
        }
      });
    }
  }
  cameraController.update(delta, input, player, cameraCollideMeshes);

  // Debug HUD
  const debugEl = document.getElementById("debug-stair");
  if (debugEl) {
    debugEl.textContent = `space: ${currentSpace ? currentSpace.name : "none"}`;
  }

  renderer.render(scene, camera);
}

animate();
