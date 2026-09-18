import * as THREE from "three";
import { addShadow } from "../shared.js";
import { POKEBALL_CONFIG } from "./config.js";

/**
 * Pokeball — a sphere split into red top / white bottom with a center button.
 */
export function buildPokeball(group, x, z, y = 0) {
  const { radius, topColor, bottomColor, bandColor, buttonColor, roughness, metalness } = POKEBALL_CONFIG;

  const halfSphereGeo = new THREE.SphereGeometry(radius, 12, 8, 0, Math.PI * 2, 0, Math.PI / 2);

  // Top half (red)
  const topMat = new THREE.MeshStandardMaterial({ color: topColor, roughness, metalness });
  const topHalf = new THREE.Mesh(halfSphereGeo, topMat);
  topHalf.position.set(x, y + radius, z);
  addShadow(topHalf);
  group.add(topHalf);

  // Bottom half (white)
  const botMat = new THREE.MeshStandardMaterial({ color: bottomColor, roughness, metalness });
  const botHalf = new THREE.Mesh(halfSphereGeo, botMat);
  botHalf.rotation.x = Math.PI;
  botHalf.position.set(x, y + radius, z);
  addShadow(botHalf);
  group.add(botHalf);

  // Center band (thin ring)
  const bandMat = new THREE.MeshStandardMaterial({ color: bandColor, roughness: 0.5 });
  const band = new THREE.Mesh(
    new THREE.TorusGeometry(radius * 0.98, radius * 0.04, 8, 16),
    bandMat
  );
  band.rotation.x = Math.PI / 2;
  band.position.set(x, y + radius, z);
  group.add(band);

  // Center button
  const btn = new THREE.Mesh(
    new THREE.SphereGeometry(radius * 0.2, 8, 6),
    new THREE.MeshStandardMaterial({ color: buttonColor, roughness: 0.3, metalness: 0.5 })
  );
  btn.position.set(x, y + radius, z + radius);
  group.add(btn);
}
