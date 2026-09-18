import * as THREE from "three";
import { buildTV } from "./components/TV/TV.js";
import { buildPlant } from "./components/Plant/Plant.js";
import { buildCupboard } from "./components/Cupboard/Cupboard.js";
import { buildDiningSet } from "./components/DiningSet/DiningSet.js";
import { buildSink } from "./components/Sink/Sink.js";
import { buildBed } from "./components/Bed/Bed.js";
import { buildComputerDesk } from "./components/ComputerDesk/ComputerDesk.js";

/**
 * Wraps each house component into a THREE.Group so it can be placed as a
 * single unit in the editor. Each builder is called with local origin at
 * (0, 0, 0) — the editor handles position/rotation/scale on the wrapper group.
 */

function wrapBuilder(builderFn, ...args) {
  const group = new THREE.Group();
  builderFn(group, 0, 0, 0, ...args);
  return group;
}

export function createTVPart({ facing = "south" } = {}) {
  return wrapBuilder(buildTV, facing);
}

export function createPlantPart() {
  return wrapBuilder(buildPlant);
}

export function createCupboardPart() {
  return wrapBuilder(buildCupboard);
}

export function createDiningSetPart() {
  return wrapBuilder(buildDiningSet);
}

export function createSinkPart() {
  return wrapBuilder(buildSink);
}

export function createBedPart() {
  return wrapBuilder(buildBed);
}

export function createComputerDeskPart() {
  return wrapBuilder(buildComputerDesk);
}

/**
 * Registry of house part builders, keyed by type name.
 * Each entry is a function that returns a THREE.Group.
 */
export const HOUSE_PART_BUILDERS = {
  house_tv: createTVPart,
  house_plant: createPlantPart,
  house_cupboard: createCupboardPart,
  house_dining_set: createDiningSetPart,
  house_sink: createSinkPart,
  house_bed: createBedPart,
  house_computer_desk: createComputerDeskPart,
};

/**
 * Metadata for each house part — displayed in the palette.
 */
export const HOUSE_PART_DEFS = [
  { type: "house_tv", label: "TV", category: "Furniture" },
  { type: "house_plant", label: "Plant", category: "Furniture" },
  { type: "house_cupboard", label: "Cupboard", category: "Furniture" },
  { type: "house_dining_set", label: "Dining Set", category: "Furniture" },
  { type: "house_sink", label: "Sink", category: "Furniture" },
  { type: "house_bed", label: "Bed", category: "Furniture" },
  { type: "house_computer_desk", label: "PC Desk", category: "Furniture" },
];
