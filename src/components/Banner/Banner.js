import * as THREE from "three";
import { addShadow } from "../shared.js";
import { BANNER_CONFIG } from "./config.js";

/**
 * Banner on a pole — a thin cylinder pole with a colored cloth hanging from it.
 */
export function buildBanner(group, x, z, y = 0) {
  const { poleColor, poleRadius, poleHeight, clothColor, clothWidth, clothHeight, roughness } = BANNER_CONFIG;

  // Pole
  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(poleRadius, poleRadius, poleHeight, 8),
    new THREE.MeshStandardMaterial({ color: poleColor, roughness })
  );
  pole.position.set(x, y + poleHeight / 2, z);
  pole.userData.collide = true;
  addShadow(pole);
  group.add(pole);

  // Cloth
  const cloth = new THREE.Mesh(
    new THREE.PlaneGeometry(clothWidth, clothHeight),
    new THREE.MeshStandardMaterial({ color: clothColor, roughness, side: THREE.DoubleSide })
  );
  cloth.position.set(x + clothWidth / 2 + poleRadius, y + poleHeight - clothHeight / 2 - 0.1, z);
  cloth.userData.collide = true;
  addShadow(cloth);
  group.add(cloth);
}
