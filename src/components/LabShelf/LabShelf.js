import * as THREE from "three";
import { addShadow } from "../shared.js";
import { LAB_SHELF_CONFIG } from "./config.js";

/**
 * Lab bookshelf — a tall shelf filled with colorful books.
 */
export function buildLabShelf(group, x, z, y = 0) {
  const { color, bookColors, width, height, depth, shelfCount, roughness } = LAB_SHELF_CONFIG;

  const shelfMat = new THREE.MeshStandardMaterial({ color, roughness });

  // Back panel
  const back = new THREE.Mesh(new THREE.BoxGeometry(width, height, 0.05), shelfMat);
  back.position.set(x, y + height / 2, z - depth / 2);
  addShadow(back);
  group.add(back);

  // Shelves
  const shelfH = 0.04;
  for (let i = 0; i <= shelfCount; i++) {
    const sy = y + (height / shelfCount) * i;
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(width, shelfH, depth), shelfMat);
    shelf.position.set(x, sy, z);
    addShadow(shelf);
    group.add(shelf);
  }

  // Books on each shelf
  const bookMat = bookColors.map(c => new THREE.MeshStandardMaterial({ color: c, roughness: 0.8 }));
  for (let i = 0; i < shelfCount; i++) {
    const shelfY = y + (height / shelfCount) * i + shelfH;
    const bookH = (height / shelfCount) * 0.85;
    const booksPerShelf = 4 + Math.floor(Math.random() * 3);
    const bookW = (width - 0.1) / booksPerShelf;

    for (let b = 0; b < booksPerShelf; b++) {
      const bx = x - width / 2 + 0.05 + bookW * b + bookW / 2;
      const bh = bookH * (0.7 + Math.random() * 0.3);
      const book = new THREE.Mesh(
        new THREE.BoxGeometry(bookW * 0.85, bh, depth * 0.7),
        bookMat[b % bookMat.length]
      );
      book.position.set(bx, shelfY + bh / 2, z);
      group.add(book);
    }
  }
}
