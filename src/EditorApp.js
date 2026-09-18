import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { TransformControls } from "three/addons/controls/TransformControls.js";
import { initPalette } from "./EditorPalette.js";
import { initPlacement, addPartToScene } from "./EditorPlacement.js";
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
controls.maxPolarAngle = Math.PI / 2 - 0.03;
controls.minDistance = 3;
controls.maxDistance = 90;
controls.update();

// --- TransformControls for drag-to-move ------------------------------------
const transformControls = new TransformControls(camera, renderer.domElement);
transformControls.setMode("translate");
transformControls.setTranslationSnap(0.5);
transformControls.setRotationSnap(THREE.MathUtils.degToRad(15));
transformControls.setScaleSnap(0.1);
transformControls.visible = false;
transformControls.enabled = false;
scene.add(transformControls.getHelper());

// Disable orbit controls while dragging with TransformControls
transformControls.addEventListener("dragging-changed", (event) => {
  controls.enabled = !event.value;
});

// Sync part data when drag ends
let dragPart = null;
transformControls.addEventListener("objectChange", () => {
  if (!dragPart) return;
  const obj = transformControls.object;
  if (!obj) return;
  dragPart.position.x = Math.round(obj.position.x * 10) / 10;
  dragPart.position.y = Math.round(obj.position.y * 10) / 10;
  dragPart.position.z = Math.round(obj.position.z * 10) / 10;
});
transformControls.addEventListener("mouseUp", () => {
  if (dragPart) {
    state.onPartChanged?.(dragPart);
    dragPart = null;
  }
});

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

// --- Sea around the build area boundary ------------------------------------
const SEA_COLOR = 0x1976d2;
const SEA_OPACITY = 0.6;
const HALF = GROUND_SIZE / 2;        // 60
const SEA_EXTEND = 50;                // how far the sea stretches beyond the ground
const SEA_DEPTH = 0.15;
const seaMat = new THREE.MeshStandardMaterial({
  color: SEA_COLOR,
  transparent: true,
  opacity: SEA_OPACITY,
  roughness: 0.2,
  metalness: 0.3,
});

// North strip (top edge, extends in +Z)
const seaNorth = new THREE.Mesh(new THREE.BoxGeometry(GROUND_SIZE + SEA_EXTEND * 2, SEA_DEPTH, SEA_EXTEND), seaMat);
seaNorth.position.set(0, SEA_DEPTH / 2, HALF + SEA_EXTEND / 2);
scene.add(seaNorth);

// South strip (bottom edge, extends in -Z)
const seaSouth = new THREE.Mesh(new THREE.BoxGeometry(GROUND_SIZE + SEA_EXTEND * 2, SEA_DEPTH, SEA_EXTEND), seaMat);
seaSouth.position.set(0, SEA_DEPTH / 2, -(HALF + SEA_EXTEND / 2));
scene.add(seaSouth);

// East strip (right edge, extends in +X)
const seaEast = new THREE.Mesh(new THREE.BoxGeometry(SEA_EXTEND, SEA_DEPTH, GROUND_SIZE), seaMat);
seaEast.position.set(HALF + SEA_EXTEND / 2, SEA_DEPTH / 2, 0);
scene.add(seaEast);

// West strip (left edge, extends in -X)
const seaWest = new THREE.Mesh(new THREE.BoxGeometry(SEA_EXTEND, SEA_DEPTH, GROUND_SIZE), seaMat);
seaWest.position.set(-(HALF + SEA_EXTEND / 2), SEA_DEPTH / 2, 0);
scene.add(seaWest);

// Corner fills
const cornerSize = SEA_EXTEND;
const corners = [
  { x: HALF + cornerSize / 2, z: HALF + cornerSize / 2 },
  { x: -(HALF + cornerSize / 2), z: HALF + cornerSize / 2 },
  { x: HALF + cornerSize / 2, z: -(HALF + cornerSize / 2) },
  { x: -(HALF + cornerSize / 2), z: -(HALF + cornerSize / 2) },
];
for (const c of corners) {
  const corner = new THREE.Mesh(new THREE.BoxGeometry(cornerSize, SEA_DEPTH, cornerSize), seaMat);
  corner.position.set(c.x, SEA_DEPTH / 2, c.z);
  scene.add(corner);
}

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
  onDeletePart: null,
  onDuplicatePart: null,
  onPartChanged: null,
  onToolDisarmed: null,
  // TransformControls helpers
  transformControls,
  attachTransform(obj, part) {
    transformControls.attach(obj);
    transformControls.visible = true;
    transformControls.enabled = true;
    dragPart = part;
  },
  detachTransform() {
    transformControls.detach();
    transformControls.visible = false;
    transformControls.enabled = false;
    dragPart = null;
  },
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
