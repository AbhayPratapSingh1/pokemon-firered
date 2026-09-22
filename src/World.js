import * as THREE from "three";
import { Space } from "./engine/Space.js";
import { SpaceManager } from "./engine/SpaceManager.js";
import { Teleporter } from "./engine/Teleporter.js";
import { buildTree } from "./components/Tree/Tree.js";
import { DIRECTIONS, HOUSES, WORLD, SPACES, OBJ, COLLISION, COLORS } from "./constants/game.js";

export { HOUSES, DIRECTIONS, WORLD } from "./constants/game.js";

// ============================================================================
// Generic Object Builder
// ============================================================================

const BUILDERS = {};

function registerBuilders() {
  BUILDERS[OBJ.GROUND_FLOOR] = (mesh, cfg) => {
    const w = cfg.width || 12, d = cfg.depth || 10;
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshStandardMaterial({ color: COLORS.WOOD_MEDIUM, roughness: 1 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.receiveShadow = true;
    mesh.add(floor);
  };

  BUILDERS[OBJ.WALLS] = (mesh, cfg) => {
    const w = cfg.width || 12, d = cfg.depth || 10, h = cfg.height || 3.6;
    const color = cfg.color || COLORS.WALL_DEFAULT;
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const doorGapHalf = cfg.doorGapHalf || 0.9;

    function addWall(geo, x, y, z) {
      const wall = new THREE.Mesh(geo, mat);
      wall.position.set(x, y, z);
      wall.castShadow = true;
      wall.receiveShadow = true;
      wall.userData.collide = true;
      mesh.add(wall);
    }

    // West wall
    addWall(new THREE.BoxGeometry(0.2, h, d), -w / 2 + 0.1, h / 2, 0);
    // East wall
    addWall(new THREE.BoxGeometry(0.2, h, d), w / 2 - 0.1, h / 2, 0);
    // North wall
    addWall(new THREE.BoxGeometry(w, h, 0.2), 0, h / 2, -d / 2 + 0.1);
    // South wall — left of door
    const sideW = (w / 2 - doorGapHalf) / 2 + doorGapHalf / 2;
    addWall(new THREE.BoxGeometry(w / 2 - doorGapHalf, h, 0.2), -(w / 4 + doorGapHalf / 2), h / 2, d / 2 - 0.1);
    // South wall — right of door
    addWall(new THREE.BoxGeometry(w / 2 - doorGapHalf, h, 0.2), w / 4 + doorGapHalf / 2, h / 2, d / 2 - 0.1);
    // South wall — above door
    const aboveDoorH = h - 2.4;
    addWall(new THREE.BoxGeometry(doorGapHalf * 2 + 0.2, aboveDoorH, 0.2), 0, 2.4 + aboveDoorH / 2, d / 2 - 0.1);
  };

  BUILDERS[OBJ.ROOF] = (mesh, cfg) => {
    const w = cfg.width || 12, d = cfg.depth || 10, h = cfg.height || 2.2;
    const color = cfg.color || COLORS.ROOF_DEFAULT;
    const shape = new THREE.Shape();
    shape.moveTo(-w / 2 - 0.4, 0);
    shape.lineTo(0, h);
    shape.lineTo(w / 2 + 0.4, 0);
    shape.lineTo(-w / 2 - 0.4, 0);
    const geometry = new THREE.ExtrudeGeometry(shape, { depth: d + 0.8, bevelEnabled: false });
    const material = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const roofMesh = new THREE.Mesh(geometry, material);
    roofMesh.rotation.x = Math.PI / 2;
    roofMesh.position.z = -d / 2 - 0.4;
    roofMesh.castShadow = true;
    roofMesh.receiveShadow = true;
    mesh.add(roofMesh);
  };

  BUILDERS[OBJ.CEILING] = (mesh, cfg) => {
    const w = cfg.width || 12, d = cfg.depth || 10;
    const color = cfg.color || COLORS.WALL_DEFAULT;
    const ceiling = new THREE.Mesh(
      new THREE.PlaneGeometry(w, d),
      new THREE.MeshStandardMaterial({ color, roughness: 0.9 })
    );
    ceiling.rotation.x = Math.PI / 2;
    ceiling.receiveShadow = true;
    mesh.add(ceiling);
  };

  BUILDERS[OBJ.FLOOR_SLAB] = (mesh, cfg) => {
    const w = cfg.width || 12, d = cfg.depth || 10, t = cfg.thickness || 0.3;
    const slab = new THREE.Mesh(
      new THREE.BoxGeometry(w, t, d),
      new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.9 })
    );
    slab.receiveShadow = true;
    mesh.add(slab);

    // Thin collision box sitting exactly on top of the slab surface
    // Player can't walk through from the side, stepSnap holds them on top
    const collisionBox = new THREE.Mesh(
      new THREE.BoxGeometry(w, 0.1, d),
      new THREE.MeshBasicMaterial({ visible: false })
    );
    collisionBox.position.y = t / 2;
    collisionBox.userData.collide = true;
    collisionBox.userData.canStandOn = true;
    mesh.add(collisionBox);
  };

  BUILDERS[OBJ.FLOOR_WITH_HOLE] = (mesh, cfg) => {
    const t = cfg.thickness || 0.15;
    // Outer boundary
    const ox1 = cfg.outerX1 ?? -6, ox2 = cfg.outerX2 ?? 6;
    const oz1 = cfg.outerZ1 ?? -5, oz2 = cfg.outerZ2 ?? 5;
    // Rectangular hole (set holeX2=0 to disable)
    const hx1 = cfg.holeX1 ?? 0, hx2 = cfg.holeX2 ?? 0;
    const hz1 = cfg.holeZ1 ?? 0, hz2 = cfg.holeZ2 ?? 0;
    const hasHole = hx2 !== hx1 && hz2 !== hz1;

    // rotateX(-PI/2) maps shape Y → world -Z, so negate Z for shape coords
    // --- Visual: extruded shape with hole ---
    const shape = new THREE.Shape();
    shape.moveTo(ox1, -oz1);
    shape.lineTo(ox2, -oz1);
    shape.lineTo(ox2, -oz2);
    shape.lineTo(ox1, -oz2);
    shape.closePath();

    if (hasHole) {
      const hole = new THREE.Path();
      hole.moveTo(hx1, -hz1);
      hole.lineTo(hx1, -hz2);
      hole.lineTo(hx2, -hz2);
      hole.lineTo(hx2, -hz1);
      hole.closePath();
      shape.holes.push(hole);
    }

    const geo = new THREE.ExtrudeGeometry(shape, { depth: t, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2);
    const floor = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xc0c0c0, roughness: 0.9 }));
    floor.position.y = t / 2;
    floor.receiveShadow = true;
    mesh.add(floor);

    // --- Collision: thick boxes on surface, split around hole ---
    const colMat = new THREE.MeshBasicMaterial({ visible: false });
    const colH = 0.5;

    function addCol(cx, cz, sx, sz) {
      if (sx <= 0 || sz <= 0) return;
      const m = new THREE.Mesh(new THREE.BoxGeometry(sx, colH, sz), colMat);
      m.position.set(cx, 3 * t / 2 - colH / 2, cz);
      m.userData.collide = true;
      m.userData.canStandOn = true;
      mesh.add(m);
    }

    if (!hasHole) {
      addCol((ox1 + ox2) / 2, (oz1 + oz2) / 2, ox2 - ox1, oz2 - oz1);
    } else {
      // Left of hole
      addCol((ox1 + hx1) / 2, (oz1 + oz2) / 2, hx1 - ox1, oz2 - oz1);
      // Right of hole
      addCol((hx2 + ox2) / 2, (oz1 + oz2) / 2, ox2 - hx2, oz2 - oz1);
      // South of hole (front, higher z)
      const southZ1 = Math.max(hz2, oz1);
      addCol((hx1 + hx2) / 2, (southZ1 + oz2) / 2, hx2 - hx1, oz2 - southZ1);
      // North of hole (back, lower z)
      const northZ2 = Math.min(hz1, oz2);
      addCol((hx1 + hx2) / 2, (oz1 + northZ2) / 2, hx2 - hx1, northZ2 - oz1);
    }
  };

  BUILDERS[OBJ.RAILING] = (mesh, cfg) => {
    const w = cfg.width || 1, h = cfg.height || 1.0, d = cfg.depth || 0.1;
    const color = cfg.color || COLORS.WOOD_DARK;
    const mat = new THREE.MeshStandardMaterial({ color, roughness: 0.8 });
    const rail = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    rail.position.y = h / 2;
    rail.castShadow = true;
    rail.receiveShadow = true;
    rail.userData.collide = true;
    mesh.add(rail);
  };

  BUILDERS[OBJ.DOOR_FRAME] = (mesh, cfg) => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.DOOR_DEFAULT, roughness: 0.8 });
    const gapHalf = cfg.gapHalf || 0.9;

    const left = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.4, 0.15), mat);
    left.position.set(-gapHalf, 1.2, 0);
    left.castShadow = true;
    left.userData.cameraCollide = true;
    group.add(left);

    const right = new THREE.Mesh(new THREE.BoxGeometry(0.15, 2.4, 0.15), mat);
    right.position.set(gapHalf, 1.2, 0);
    right.castShadow = true;
    right.userData.cameraCollide = true;
    group.add(right);

    const top = new THREE.Mesh(new THREE.BoxGeometry(gapHalf * 2 + 0.15, 0.15, 0.15), mat);
    top.position.set(0, 2.4, 0);
    top.castShadow = true;
    top.userData.cameraCollide = true;
    group.add(top);

    // Door (slightly recessed, darker)
    const doorMat = new THREE.MeshStandardMaterial({ color: 0x3d2b1f, roughness: 0.7 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(gapHalf * 2, 2.4, 0.1), doorMat);
    door.position.set(0, 1.2, 0.02);
    door.castShadow = true;
    door.userData.cameraCollide = true;
    group.add(door);

    mesh.add(group);
  };

  BUILDERS[OBJ.WINDOW] = (mesh, cfg) => {
    const w = cfg.width || 0.8, h = cfg.height || 0.8;
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_DARK, roughness: 0.7 });
    const glassMat = new THREE.MeshStandardMaterial({ color: COLORS.WINDOW_DEFAULT, roughness: 0.2, transparent: true, opacity: 0.7 });

    // Frame
    const frame = new THREE.Mesh(new THREE.BoxGeometry(w + 0.15, h + 0.15, 0.1), frameMat);
    frame.castShadow = true;
    group.add(frame);

    // Glass
    const glass = new THREE.Mesh(new THREE.PlaneGeometry(w, h), glassMat);
    glass.position.z = 0.06;
    group.add(glass);

    // Cross bars
    const hBar = new THREE.Mesh(new THREE.BoxGeometry(w, 0.05, 0.12), frameMat);
    hBar.position.z = 0.06;
    group.add(hBar);
    const vBar = new THREE.Mesh(new THREE.BoxGeometry(0.05, h, 0.12), frameMat);
    vBar.position.z = 0.06;
    group.add(vBar);

    mesh.add(group);
  };

  BUILDERS[OBJ.TREE] = (mesh) => {
    const group = new THREE.Group();
    buildTree(group, 0, 0, 0);
    mesh.add(group);
  };

  BUILDERS[OBJ.PLANT] = (mesh, cfg) => {
    const group = new THREE.Group();
    const potMat = new THREE.MeshStandardMaterial({ color: 0x8b4513, roughness: 0.8 });
    const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.2, 0.4, 8), potMat);
    pot.position.y = 0.2;
    pot.castShadow = true;
    group.add(pot);

    const leafMat = new THREE.MeshStandardMaterial({ color: 0x228b22, roughness: 0.9 });
    const leaves = new THREE.Mesh(new THREE.SphereGeometry(0.3, 8, 6), leafMat);
    leaves.position.y = 0.7;
    leaves.castShadow = true;
    group.add(leaves);

    mesh.add(group);
  };

  BUILDERS[OBJ.CUPBOARD] = (mesh, cfg) => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_DARK, roughness: 0.7 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1, 2, 0.5), mat);
    body.position.y = 1;
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData.collide = true;
    group.add(body);

    const handleMat = new THREE.MeshStandardMaterial({ color: COLORS.METAL_GRAY, roughness: 0.4 });
    const handleL = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.15, 0.05), handleMat);
    handleL.position.set(-0.15, 1, 0.28);
    group.add(handleL);
    const handleR = handleL.clone();
    handleR.position.x = 0.15;
    group.add(handleR);

    mesh.add(group);
  };

  BUILDERS[OBJ.DINING_SET] = (mesh, cfg) => {
    const group = new THREE.Group();
    const tableMat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_LIGHT, roughness: 0.6 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(2, 0.1, 1.2), tableMat);
    table.position.y = 0.75;
    table.castShadow = true;
    table.receiveShadow = true;
    table.userData.collide = true;
    group.add(table);

    const legMat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_DARK, roughness: 0.8 });
    for (const [x, z] of [[-0.9, -0.5], [0.9, -0.5], [-0.9, 0.5], [0.9, 0.5]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.1, 0.75, 0.1), legMat);
      leg.position.set(x, 0.375, z);
      leg.castShadow = true;
      group.add(leg);
    }

    const chairMat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_DARK, roughness: 0.7 });
    for (const [x, z, ry] of [[-1.3, 0, 0], [1.3, 0, 0], [0, -0.8, Math.PI / 2], [0, 0.8, -Math.PI / 2]]) {
      const chair = new THREE.Group();
      const seat = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.5), chairMat);
      seat.position.y = 0.5;
      seat.castShadow = true;
      chair.add(seat);
      const back = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.05), chairMat);
      back.position.set(0, 0.75, -0.22);
      back.castShadow = true;
      chair.add(back);
      for (const [lx, lz] of [[-0.2, -0.2], [0.2, -0.2], [-0.2, 0.2], [0.2, 0.2]]) {
        const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.05), legMat);
        leg.position.set(lx, 0.25, lz);
        chair.add(leg);
      }
      chair.position.set(x, 0, z);
      chair.rotation.y = ry;
      group.add(chair);
    }
    mesh.add(group);
  };

  BUILDERS[OBJ.TABLE] = (mesh, cfg) => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_LIGHT, roughness: 0.6 });
    const table = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.7), mat);
    table.position.y = 0.75;
    table.castShadow = true;
    table.receiveShadow = true;
    table.userData.collide = true;
    group.add(table);

    const legMat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_DARK, roughness: 0.8 });
    for (const [x, z] of [[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.75, 0.08), legMat);
      leg.position.set(x, 0.375, z);
      leg.castShadow = true;
      group.add(leg);
    }
    mesh.add(group);
  };

  BUILDERS[OBJ.TV] = (mesh, cfg) => {
    const group = new THREE.Group();
    // Stand
    const standMat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_DARK, roughness: 0.7 });
    const stand = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.5, 0.5), standMat);
    stand.position.y = 0.25;
    stand.castShadow = true;
    stand.receiveShadow = true;
    stand.userData.collide = true;
    group.add(stand);

    // TV body
    const tvMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
    const tvBody = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.8, 0.1), tvMat);
    tvBody.position.y = 0.9;
    tvBody.castShadow = true;
    group.add(tvBody);

    // Screen
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x333366, roughness: 0.1, emissive: 0x111133, emissiveIntensity: 0.5 });
    const screen = new THREE.Mesh(new THREE.PlaneGeometry(1.1, 0.7), screenMat);
    screen.position.set(0, 0.9, 0.06);
    group.add(screen);

    mesh.add(group);
  };

  BUILDERS[OBJ.KITCHEN_COUNTER] = (mesh, cfg) => {
    const group = new THREE.Group();
    const cabMat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_LIGHT, roughness: 0.7 });
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.9, 0.6), cabMat);
    cabinet.position.y = 0.45;
    cabinet.castShadow = true;
    cabinet.receiveShadow = true;
    cabinet.userData.collide = true;
    group.add(cabinet);

    const topMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.3 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.5, 0.05, 0.6), topMat);
    top.position.y = 0.925;
    top.castShadow = true;
    group.add(top);

    mesh.add(group);
  };

  BUILDERS[OBJ.VISUAL_STAIRS] = (mesh, cfg) => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_MEDIUM, roughness: 0.8 });
    const stepW = 1.2, stepH = 0.25, stepD = 0.3;
    for (let i = 0; i < 8; i++) {
      const step = new THREE.Mesh(new THREE.BoxGeometry(stepW, stepH, stepD), mat);
      step.position.set(0, i * stepH + stepH / 2, -i * stepD);
      step.castShadow = true;
      group.add(step);
    }
    mesh.add(group);
  };

  BUILDERS[OBJ.CHAIR] = (mesh, cfg) => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_DARK, roughness: 0.7 });

    const seat = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.05, 0.45), mat);
    seat.position.y = 0.5;
    seat.castShadow = true;
    group.add(seat);

    const back = new THREE.Mesh(new THREE.BoxGeometry(0.45, 0.45, 0.05), mat);
    back.position.set(0, 0.725, -0.2);
    back.castShadow = true;
    group.add(back);

    const legMat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_DARK, roughness: 0.8 });
    for (const [x, z] of [[-0.18, -0.18], [0.18, -0.18], [-0.18, 0.18], [0.18, 0.18]]) {
      const leg = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.5, 0.05), legMat);
      leg.position.set(x, 0.25, z);
      group.add(leg);
    }
    mesh.add(group);
  };

  BUILDERS[OBJ.SINK] = (mesh, cfg) => {
    const group = new THREE.Group();
    const cabMat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_LIGHT, roughness: 0.7 });
    const cabinet = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.9, 0.6), cabMat);
    cabinet.position.y = 0.45;
    cabinet.castShadow = true;
    cabinet.receiveShadow = true;
    cabinet.userData.collide = true;
    group.add(cabinet);

    const topMat = new THREE.MeshStandardMaterial({ color: 0xdddddd, roughness: 0.3 });
    const top = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.6), topMat);
    top.position.y = 0.925;
    top.castShadow = true;
    group.add(top);

    const basinMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.2 });
    const basin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.15, 0.35), basinMat);
    basin.position.set(0, 0.85, 0);
    group.add(basin);

    const faucetMat = new THREE.MeshStandardMaterial({ color: COLORS.METAL_GRAY, roughness: 0.3 });
    const faucet = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.3), faucetMat);
    faucet.position.set(0, 1.1, -0.25);
    faucet.castShadow = true;
    group.add(faucet);

    mesh.add(group);
  };

  BUILDERS[OBJ.BED] = (mesh, cfg) => {
    const group = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_DARK, roughness: 0.7 });
    const frame = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.3, 2.5), frameMat);
    frame.position.y = 0.15;
    frame.castShadow = true;
    frame.receiveShadow = true;
    frame.userData.collide = true;
    group.add(frame);

    const mattressMat = new THREE.MeshStandardMaterial({ color: COLORS.FABRIC_WHITE, roughness: 0.9 });
    const mattress = new THREE.Mesh(new THREE.BoxGeometry(1.7, 0.2, 2.4), mattressMat);
    mattress.position.y = 0.45;
    mattress.castShadow = true;
    group.add(mattress);

    const pillowMat = new THREE.MeshStandardMaterial({ color: COLORS.FABRIC_BLUE, roughness: 0.9 });
    const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.1, 0.4), pillowMat);
    pillow.position.set(0, 0.6, -0.9);
    pillow.castShadow = true;
    group.add(pillow);

    // Headboard
    const headboard = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.8, 0.1), frameMat);
    headboard.position.set(0, 0.7, -1.25);
    headboard.castShadow = true;
    group.add(headboard);

    mesh.add(group);
  };

  BUILDERS[OBJ.COMPUTER_DESK] = (mesh, cfg) => {
    const group = new THREE.Group();
    const deskMat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_DARK, roughness: 0.6 });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.05, 0.7), deskMat);
    desk.position.y = 0.75;
    desk.castShadow = true;
    desk.receiveShadow = true;
    desk.userData.collide = true;
    group.add(desk);

    const legMat = new THREE.MeshStandardMaterial({ color: COLORS.METAL_DARK, roughness: 0.5 });
    for (const [x, z] of [[-0.55, -0.3], [0.55, -0.3], [-0.55, 0.3], [0.55, 0.3]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 0.75), legMat);
      leg.position.set(x, 0.375, z);
      group.add(leg);
    }

    const monitorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
    const screenMat = new THREE.MeshStandardMaterial({ color: 0x333366, roughness: 0.1, emissive: 0x111133, emissiveIntensity: 0.5 });
    const monitor = new THREE.Group();
    const mBody = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.35, 0.05), monitorMat);
    mBody.position.y = 0.2;
    mBody.castShadow = true;
    monitor.add(mBody);
    const mScreen = new THREE.Mesh(new THREE.PlaneGeometry(0.45, 0.3), screenMat);
    mScreen.position.set(0, 0.2, 0.03);
    monitor.add(mScreen);
    const mStand = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.1, 0.1), monitorMat);
    mStand.position.y = 0.05;
    monitor.add(mStand);
    monitor.position.set(0, 0.8, -0.2);
    group.add(monitor);

    mesh.add(group);
  };

  // Single stair step with optional side walls — used by STAIRS builder
  BUILDERS[OBJ.STAIR_STEP] = (mesh, cfg) => {
    const w = cfg.width || 1.5, d = cfg.depth || 0.3, h = cfg.height || 0.15;
    const wallH = cfg.wallHeight || 1.0;
    const wallThick = 0.1;
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_MEDIUM, roughness: 0.8 });
    const wallMat = new THREE.MeshStandardMaterial({ color: COLORS.WALL_DEFAULT, roughness: 0.9 });

    // Step surface
    const step = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat);
    step.position.y = h / 2;
    step.castShadow = true;
    step.receiveShadow = true;
    step.userData.collide = true;
    step.userData.canStandOn = true;
    mesh.add(step);

    // Left wall (-X side)
    if (cfg.wallLeft) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, d), wallMat);
      wall.position.set(-w / 2 - wallThick / 2, wallH / 2, 0);
      wall.castShadow = true;
      wall.receiveShadow = true;
      wall.userData.collide = true;
      mesh.add(wall);
    }

    // Right wall (+X side)
    if (cfg.wallRight) {
      const wall = new THREE.Mesh(new THREE.BoxGeometry(wallThick, wallH, d), wallMat);
      wall.position.set(w / 2 + wallThick / 2, wallH / 2, 0);
      wall.castShadow = true;
      wall.receiveShadow = true;
      wall.userData.collide = true;
      mesh.add(wall);
    }
  };

  // Staircase built from STAIR_STEP components
  // straight: true = single flight, false = L-shaped (two flights)
  BUILDERS[OBJ.STAIRS] = (mesh, cfg) => {
    const stepsPerFlight = cfg.stepsPerFlight || 12;
    const stepW = cfg.stepWidth || 1.5;
    const stepD = cfg.stepDepth || 0.3;
    const stepH = cfg.stepHeight || 0.15;
    const wallH = cfg.wallHeight || 1.0;
    const straight = cfg.straight !== false;
    const sideWalls = cfg.sideWalls !== false;
    const wallThick = 0.1;

    const stepCfg = { width: stepW, depth: stepD, height: stepH, wallHeight: wallH };

    function placeStep(x, y, z, wallLeft, wallRight, rotY = 0) {
      const group = new THREE.Group();
      BUILDERS[OBJ.STAIR_STEP](group, { ...stepCfg, wallLeft, wallRight });
      group.position.set(x, y, z);
      group.rotation.y = rotY;
      mesh.add(group);
    }

    if (straight) {
      // direction: 1 = north (z decreases), -1 = south (z increases)
      const dir = cfg.direction || 1;
      for (let i = 0; i < stepsPerFlight; i++) {
        placeStep(0, i * stepH, -i * stepD * dir, true, true);
      }

      // Outer walls on both sides (optional)
      if (sideWalls) {
        const totalLength = stepsPerFlight * stepD;
        for (const side of [-1, 1]) {
          const wall = new THREE.Mesh(
            new THREE.BoxGeometry(wallThick, wallH * 1.5, totalLength + stepD),
            new THREE.MeshStandardMaterial({ color: COLORS.WALL_DEFAULT, roughness: 0.9 })
          );
          wall.position.set(side * (stepW / 2 + wallThick / 2 + 0.01), wallH, -totalLength / 2 + stepD / 2);
          wall.castShadow = true;
          wall.receiveShadow = true;
          wall.userData.collide = true;
          mesh.add(wall);
        }
      }
    } else {
      // L-shape: flight A goes north, flight B goes west
      for (let i = 0; i < stepsPerFlight; i++) {
        placeStep(0, i * stepH, -i * stepD, i === 0, true);
      }

      const landingY = stepsPerFlight * stepH;
      const landingZ = -(stepsPerFlight - 1) * stepD;

      for (let i = 0; i < stepsPerFlight; i++) {
        placeStep(-(i + 1) * stepD, landingY + (i + 1) * stepH, landingZ, true, i === stepsPerFlight - 1, Math.PI / 2);
      }

      // Outer wall along right side of flight A
      const flightALength = stepsPerFlight * stepD;
      const outerWall = new THREE.Mesh(
        new THREE.BoxGeometry(wallThick, wallH * 2, flightALength + stepD * 2),
        new THREE.MeshStandardMaterial({ color: COLORS.WALL_DEFAULT, roughness: 0.9 })
      );
      outerWall.position.set(stepW / 2 + wallThick / 2 + 0.01, wallH, -flightALength / 2 + stepD / 2);
      outerWall.castShadow = true;
      outerWall.receiveShadow = true;
      outerWall.userData.collide = true;
      mesh.add(outerWall);

      // Outer wall along back of flight B
      const flightBLength = stepsPerFlight * stepD;
      const backWall = new THREE.Mesh(
        new THREE.BoxGeometry(flightBLength + stepD * 2, wallH * 2, wallThick),
        new THREE.MeshStandardMaterial({ color: COLORS.WALL_DEFAULT, roughness: 0.9 })
      );
      backWall.position.set(-flightBLength / 2 - stepD / 2, landingY + (stepsPerFlight / 2) * stepH, landingZ - stepW / 2 - wallThick / 2 - 0.01);
      backWall.castShadow = true;
      backWall.receiveShadow = true;
      backWall.userData.collide = true;
      mesh.add(backWall);
    }
  };

  BUILDERS[OBJ.LAB_SHELF] = (mesh, cfg) => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_DARK, roughness: 0.7 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.5, 2.2, 0.5), mat);
    body.position.y = 1.1;
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData.collide = true;
    group.add(body);

    const bookMat = new THREE.MeshStandardMaterial({ color: 0x8b0000, roughness: 0.9 });
    for (let shelf = 0; shelf < 3; shelf++) {
      for (let b = 0; b < 5; b++) {
        const book = new THREE.Mesh(new THREE.BoxGeometry(0.15, 0.6, 0.3), bookMat);
        book.position.set(-0.5 + b * 0.25, 0.5 + shelf * 0.7, 0);
        book.castShadow = true;
        group.add(book);
      }
    }
    mesh.add(group);
  };

  BUILDERS[OBJ.LAB_MACHINE] = (mesh, cfg) => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0x444444, roughness: 0.5 });
    const body = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.8, 0.8), mat);
    body.position.y = 0.9;
    body.castShadow = true;
    body.receiveShadow = true;
    body.userData.collide = true;
    group.add(body);

    const lightMat = new THREE.MeshStandardMaterial({ color: 0x00ff00, emissive: 0x00ff00, emissiveIntensity: 0.8 });
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.08), lightMat);
    light.position.set(0.4, 1.6, 0.42);
    group.add(light);

    mesh.add(group);
  };

  BUILDERS[OBJ.LAB_DESK] = (mesh, cfg) => {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: COLORS.WOOD_LIGHT, roughness: 0.6 });
    const desk = new THREE.Mesh(new THREE.BoxGeometry(2, 0.08, 1), mat);
    desk.position.y = 0.75;
    desk.castShadow = true;
    desk.receiveShadow = true;
    desk.userData.collide = true;
    group.add(desk);

    const legMat = new THREE.MeshStandardMaterial({ color: COLORS.METAL_DARK, roughness: 0.5 });
    for (const [x, z] of [[-0.9, -0.4], [0.9, -0.4], [-0.9, 0.4], [0.9, 0.4]]) {
      const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.75), legMat);
      leg.position.set(x, 0.375, z);
      group.add(leg);
    }

    const monitorMat = new THREE.MeshStandardMaterial({ color: 0x111111, roughness: 0.3 });
    const monitor = new THREE.Mesh(new THREE.BoxGeometry(0.6, 0.4, 0.05), monitorMat);
    monitor.position.set(0, 1, -0.2);
    monitor.castShadow = true;
    group.add(monitor);

    mesh.add(group);
  };

  BUILDERS[OBJ.LAB_PLANT] = (mesh, cfg) => {
    BUILDERS[OBJ.PLANT](mesh, cfg);
  };

  BUILDERS[OBJ.POKEBALL] = (mesh, cfg) => {
    const group = new THREE.Group();
    const redMat = new THREE.MeshStandardMaterial({ color: 0xff0000, roughness: 0.4, metalness: 0.2 });
    const whiteMat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0.2 });
    const bandMat = new THREE.MeshStandardMaterial({ color: 0x222222, roughness: 0.3 });

    const top = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2), redMat);
    top.position.y = 0.5;
    top.castShadow = true;
    group.add(top);

    const bottom = new THREE.Mesh(new THREE.SphereGeometry(0.25, 16, 16, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), whiteMat);
    bottom.position.y = 0.5;
    bottom.castShadow = true;
    group.add(bottom);

    const band = new THREE.Mesh(new THREE.TorusGeometry(0.25, 0.02, 8, 32), bandMat);
    band.position.y = 0.5;
    band.rotation.x = Math.PI / 2;
    group.add(band);

    const buttonMat = new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0xff4444, emissiveIntensity: 0.5 });
    const button = new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), buttonMat);
    button.position.set(0, 0.5, 0.26);
    group.add(button);

    group.userData.pokeball = true;
    mesh.add(group);
  };

  // HOUSE: full exterior shell (walls + roof + door + windows)
  // Used as exterior object — positioned at house world position
  BUILDERS[OBJ.HOUSE] = (mesh, cfg) => {
    const w = cfg.width || 6;
    const d = cfg.depth || 6;
    const wallH = cfg.wallHeight || 3;
    const roofH = cfg.roofHeight || 2.2;
    const wallColor = cfg.wallColor || COLORS.WALL_DEFAULT;
    const roofColor = cfg.roofColor || COLORS.ROOF_DEFAULT;
    const doorColor = cfg.doorColor || COLORS.DOOR_DEFAULT;
    const windows = cfg.windows || [];

    // Walls
    const wallMat = new THREE.MeshStandardMaterial({ color: wallColor, roughness: 0.9 });
    const walls = new THREE.Mesh(new THREE.BoxGeometry(w, wallH, d), wallMat);
    walls.position.y = wallH / 2;
    walls.castShadow = true;
    walls.receiveShadow = true;
    walls.userData.cameraCollide = true;
    mesh.add(walls);

    // Roof (4-sided pyramid)
    const roofMat = new THREE.MeshStandardMaterial({ color: roofColor, roughness: 0.7 });
    const roofRadius = (Math.hypot(w, d) / 2) * 1.05;
    const roof = new THREE.Mesh(new THREE.ConeGeometry(roofRadius, roofH, 4), roofMat);
    roof.rotation.y = Math.PI / 4;
    roof.position.y = wallH + roofH / 2;
    roof.castShadow = true;
    mesh.add(roof);

    // Door (front face = +Z)
    const doorMat = new THREE.MeshStandardMaterial({ color: doorColor, roughness: 0.8 });
    const door = new THREE.Mesh(new THREE.BoxGeometry(1.1, 1.8, 0.15), doorMat);
    door.position.set(0, 0.9, d / 2 + 0.08);
    door.castShadow = true;
    door.userData.cameraCollide = true;
    mesh.add(door);

    // Windows (configurable positions)
    const winMat = new THREE.MeshStandardMaterial({ color: COLORS.WINDOW_DEFAULT, roughness: 0.4 });
    for (const win of windows) {
      const mesh_win = new THREE.Mesh(new THREE.BoxGeometry(win.width || 0.8, win.height || 0.8, 0.1), winMat);
      mesh_win.position.set(win.x || 0, win.y || 1.7, win.z || d / 2 + 0.06);
      mesh_win.castShadow = true;
      mesh.add(mesh_win);
    }
  };
}

registerBuilders();

// ============================================================================
// SPACE BUILDER — builds Space from config
// ============================================================================

function buildExteriorObjects(objects) {
  if (!objects) return [];
  return objects.map((obj) => {
    const group = new THREE.Group();
    if (BUILDERS[obj.type]) {
      BUILDERS[obj.type](group, obj.config || {});
    }
    if (obj.position) group.position.set(...obj.position);
    if (obj.rotation) group.rotation.y = obj.rotation;
    if (obj.scale) group.scale.set(...obj.scale);
    return group;
  });
}

function buildInteriorObjects(objects, origin) {
  if (!objects) return [];
  return objects.map((obj) => {
    const group = new THREE.Group();
    if (BUILDERS[obj.type]) {
      BUILDERS[obj.type](group, obj.config || {});
    }
    if (obj.position) {
      group.position.set(
        origin[0] + obj.position[0],
        origin[1] + obj.position[1],
        origin[2] + obj.position[2]
      );
    }
    if (obj.rotation) group.rotation.y = obj.rotation;
    if (obj.scale) group.scale.set(...obj.scale);
    if (obj.collide) {
      group.traverse((child) => {
        if (child.isMesh) child.userData.collide = true;
      });
    }
    if (obj.canStandOn) {
      group.traverse((child) => {
        if (child.isMesh) child.userData.canStandOn = true;
      });
    }
    return group;
  });
}

function buildTeleporters(configs) {
  return configs.map((cfg) => {
    const entry = new Teleporter({
      type: "trigger",
      target: null, // resolved lazily after SPACE_LOOKUP is fully built
      triggerPosition: new THREE.Vector3(...cfg.triggerPosition),
      position: new THREE.Vector3(...cfg.spawnPosition),
      orientation: cfg.spawnOrientation || 0,
      radius: cfg.triggerRadius || 1.0,
    });
    return { entry, exit: null, config: cfg };
  });
}

// ============================================================================
// SPACE LOOKUP — built after all spaces are created
// ============================================================================

export const SPACE_LOOKUP = {};

function resolveTeleportTargets(teleporters) {
  for (const tp of teleporters) {
    tp.entry.target = SPACE_LOOKUP[tp.config.targetSpace];
  }
}

function buildWorldSpace() {
  const world = new Space({ name: SPACES.WORLD });
  SPACE_LOOKUP[SPACES.WORLD] = world;

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(WORLD.GROUND_SIZE, WORLD.GROUND_SIZE),
    new THREE.MeshStandardMaterial({ color: COLORS.GRASS_GREEN, roughness: 1 })
  );
  ground.rotation.x = -Math.PI / 2;
  ground.receiveShadow = true;
  world.interior.push(ground);

  // Trees
  const exclusionZones = [
    { x: 0, z: 0, halfW: 8, halfD: 8 },
  ];
  for (const spaceName of WORLD.objects) {
    const house = HOUSES[spaceName];
    if (house) {
      const ext = house.exterior;
      exclusionZones.push({
        x: ext.position[0],
        z: ext.position[2],
        halfW: 6,
        halfD: 6,
      });
    }
  }

  const trees = [];
  for (let i = 0; i < WORLD.TREE_COUNT; i++) {
    let x = 0, z = 0, attempts = 0;
    do {
      const angle = Math.random() * Math.PI * 2;
      const radius = WORLD.TREE_RING_MIN + Math.random() * (WORLD.TREE_RING_MAX - WORLD.TREE_RING_MIN);
      x = Math.cos(angle) * radius;
      z = Math.sin(angle) * radius;
      attempts++;
    } while (
      exclusionZones.some((zone) => Math.abs(x - zone.x) < zone.halfW && Math.abs(z - zone.z) < zone.halfD) &&
      attempts < 20
    );
    const tree = new THREE.Group();
    tree.position.set(x, 0, z);
    buildTree(tree, 0, 0, 0);
    trees.push(tree);
  }
  world.interior.push(...trees);

  // Build spaces from WORLD.objects config
  const allTeleporters = [];
  for (const spaceName of WORLD.objects) {
    const house = HOUSES[spaceName];
    if (!house) {
      console.warn(`[WORLD] Unknown house config: ${spaceName}`);
      continue;
    }

    const houseSpace = new Space({ name: spaceName });
    houseSpace.exterior = buildExteriorObjects(house.exterior.objects);

    // Position exterior at house world position
    const pos = house.exterior.position;
    for (const obj of houseSpace.exterior) {
      obj.position.x += pos[0];
      obj.position.y += pos[1];
      obj.position.z += pos[2];
    }

    world.addChild(houseSpace);
    SPACE_LOOKUP[spaceName] = houseSpace;

    // Build interior
    const intCfg = house.interior;
    houseSpace.interior = buildInteriorObjects(intCfg.objects, intCfg.origin);

    // Collect interior obstacles (walls, furniture with collide)
    const interiorObstacles = [];
    for (const obj of houseSpace.interior) {
      obj.traverse((child) => {
        if (child.isMesh && child.userData.collide) {
          child.updateWorldMatrix(true, false);
          const box = new THREE.Box3().setFromObject(child);
          interiorObstacles.push({ mesh: child, box, canStandOn: !!child.userData.canStandOn });
        }
      });
    }

    // Add ground height function
    houseSpace.data = {
      groundHeight: () => 0,
      obstacles: interiorObstacles,
    };

    // Build teleporters
    const teleporters = buildTeleporters(house.teleporters);
    allTeleporters.push(...teleporters);
  }

  // Resolve teleporter target spaces
  resolveTeleportTargets(allTeleporters);

  return { world, allTeleporters };
}

// ============================================================================
// OBSTACLES
// ============================================================================

function buildWorldObstacles(world) {
  const obstacles = [];

  // Tree trunks
  for (const obj of world.getInsideObjects()) {
    obj.traverse((child) => {
      if (child.isMesh && child.userData.collide) {
        obstacles.push({ mesh: child, box: new THREE.Box3().setFromObject(child) });
      }
    });
  }

  // House wall collision boxes
  for (const spaceName of WORLD.objects) {
    const house = HOUSES[spaceName];
    if (!house) continue;
    const ext = house.exterior;
    const [px, , pz] = ext.position;

    // Extract dimensions from HOUSE object config
    const houseObj = ext.objects.find((o) => o.type === OBJ.HOUSE);
    if (!houseObj || !houseObj.config) continue;
    const { width: w = 6, depth: d = 6, wallHeight: wh = 3, roofHeight: rh = 2.2 } = houseObj.config;
    const halfW = w / 2;
    const halfD = d / 2;
    const totalHeight = wh + rh;
    const gapHalf = 0.9;
    const wallThick = 0.3;

    // West wall
    obstacles.push({ mesh: null, box: new THREE.Box3(
      new THREE.Vector3(px - halfW, 0, pz - halfD),
      new THREE.Vector3(px - halfW + wallThick, totalHeight, pz + halfD)
    )});
    // East wall
    obstacles.push({ mesh: null, box: new THREE.Box3(
      new THREE.Vector3(px + halfW - wallThick, 0, pz - halfD),
      new THREE.Vector3(px + halfW, totalHeight, pz + halfD)
    )});
    // North wall
    obstacles.push({ mesh: null, box: new THREE.Box3(
      new THREE.Vector3(px - halfW, 0, pz - halfD),
      new THREE.Vector3(px + halfW, totalHeight, pz - halfD + wallThick)
    )});
    // South wall left
    obstacles.push({ mesh: null, box: new THREE.Box3(
      new THREE.Vector3(px - halfW, 0, pz + halfD - wallThick),
      new THREE.Vector3(px - gapHalf, totalHeight, pz + halfD)
    )});
    // South wall right
    obstacles.push({ mesh: null, box: new THREE.Box3(
      new THREE.Vector3(px + gapHalf, 0, pz + halfD - wallThick),
      new THREE.Vector3(px + halfW, totalHeight, pz + halfD)
    )});
    // South wall above door
    obstacles.push({ mesh: null, box: new THREE.Box3(
      new THREE.Vector3(px - gapHalf, 1.8, pz + halfD - wallThick),
      new THREE.Vector3(px + gapHalf, totalHeight, pz + halfD)
    )});
  }

  return obstacles;
}

// ============================================================================
// CREATE WORLD — main entry
// ============================================================================

export function createWorld(scene) {
  const { world, allTeleporters } = buildWorldSpace();

  const spaceManager = new SpaceManager(scene);
  spaceManager.load(world);

  const worldObstacles = buildWorldObstacles(world);

  return { world, spaceManager, allTeleporters, worldObstacles };
}
