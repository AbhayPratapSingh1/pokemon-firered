import * as THREE from "three";
import { createWorld } from "./World.js";
import { Player } from "./Player.js";
import { InputManager } from "./Input.js";
import { CameraController } from "./CameraController.js";
import { InteractionManager } from "./InteractionManager.js";

// --- Renderer ---
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// --- Scene ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87ceeb);
scene.fog = new THREE.Fog(0x87ceeb, 60, 160);

// --- Camera ---
const camera = new THREE.PerspectiveCamera(
  70,
  window.innerWidth / window.innerHeight,
  0.1,
  500
);
camera.position.set(0, 4, 8);

// --- Lighting ---
const hemiLight = new THREE.HemisphereLight(0xbfd9ff, 0x3a7d44, 0.9);
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
const outdoorCollisionMeshes = [...new Set(world.obstacles.map((o) => o.mesh))];

// --- Player ---
const player = new Player(scene, new THREE.Vector3(0, 0, 0));

// --- Interior controllers (all use Ash's House layout) ---
const interiors = [
  world.playerHouse,
  world.garyHouseInterior,
  world.oakLabInterior,
];

// --- Input & Camera controller ---
const input = new InputManager(renderer.domElement);
const cameraController = new CameraController(camera);
const interaction = new InteractionManager();

// --- Resize handling ---
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// --- Game loop ---
const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);

  const delta = Math.min(clock.getDelta(), 0.1);

  input.update();

  // Update all interior controllers
  for (const ctrl of interiors) {
    ctrl.update(delta, player);
  }

  // Find which interior the player is in (if any)
  const activeInterior = interiors.find((c) => c.inside) || interiors[0];

  // Merge obstacles from active interior
  const allObstacles = activeInterior.getObstacles(world.obstacles);
  const allCollisionMeshes = activeInterior.getCollisionMeshes(outdoorCollisionMeshes);

  player.update(
    delta,
    input,
    cameraController.yaw,
    allObstacles,
    activeInterior.getGroundHeight
  );
  cameraController.update(delta, input, player, allCollisionMeshes);

  // Gather interactables from all interiors
  const allInteractables = interiors.flatMap((c) => c.interactables || []);
  interaction.update(delta, input, player, allInteractables);

  // Debug HUD
  const debugEl = document.getElementById("debug-stair");
  if (debugEl) debugEl.textContent = activeInterior.getDebugInfo(player);

  renderer.render(scene, camera);
}

animate();
