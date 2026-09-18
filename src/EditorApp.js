import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { initPalette } from "./EditorPalette.js";
import { initPlacement } from "./EditorPlacement.js";
import { initInspector } from "./EditorInspector.js";
import { initCameraPan } from "./EditorCameraPan.js";

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x9fd3ea);
scene.fog = new THREE.Fog(0x9fd3ea, 60, 180);

const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 500);
camera.position.set(9, 8, 9);

const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1, 0);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.maxPolarAngle = Math.PI / 2 - 0.03; // keep the camera from going under the ground
controls.minDistance = 3;
controls.maxDistance = 90;
controls.update();

const hemiLight = new THREE.HemisphereLight(0xbfd9ff, 0x3a7d44, 0.9);
scene.add(hemiLight);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.2);
sunLight.position.set(15, 20, 10);
sunLight.castShadow = true;
sunLight.shadow.mapSize.set(1024, 1024);
sunLight.shadow.camera.left = -20;
sunLight.shadow.camera.right = 20;
sunLight.shadow.camera.top = 20;
sunLight.shadow.camera.bottom = -20;
scene.add(sunLight);

const GROUND_SIZE = 120;

const groundMesh = new THREE.Mesh(
  new THREE.PlaneGeometry(GROUND_SIZE, GROUND_SIZE),
  new THREE.MeshStandardMaterial({ color: 0x4c9a4c, roughness: 1 })
);
groundMesh.rotation.x = -Math.PI / 2;
groundMesh.receiveShadow = true;
scene.add(groundMesh);

const grid = new THREE.GridHelper(GROUND_SIZE, GROUND_SIZE * 2, 0x2e5e2e, 0x2e5e2e);
grid.position.y = 0.01;
scene.add(grid);

const partsGroup = new THREE.Group();
scene.add(partsGroup);

const state = {
  scene,
  camera,
  renderer,
  controls,
  groundMesh,
  partsGroup,
  parts: [],
  armedTool: null,
  selectedPartId: null,
  editingModelId: null,
  onSelectPart: null,
  onDeselect: null,
};

initPalette(state);
initPlacement(state);
initInspector(state);
const cameraPan = initCameraPan(state);

window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

const clock = new THREE.Clock();

function animate() {
  requestAnimationFrame(animate);
  const delta = Math.min(clock.getDelta(), 0.1);
  cameraPan.update(delta);
  controls.update();
  renderer.render(scene, camera);
}

animate();
