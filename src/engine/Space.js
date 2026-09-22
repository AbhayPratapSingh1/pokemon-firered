/**
 * Space — recursive scene node.
 *
 * Every Space has:
 * - exterior: objects visible from OUTSIDE (parent context)
 * - interior: objects visible from INSIDE
 * - children: sub-spaces (can be entered)
 * - data: obstacles, interactables, groundHeight function
 *
 * getInsideObjects() = interior + all children[*].exterior
 */
export class Space {
  constructor({ name = "", exterior = [], interior = [], children = [], data = {} } = {}) {
    this.name = name;
    this.exterior = exterior;
    this.interior = interior;
    this.children = children;
    this.data = data;
    this.parent = null;
  }

  addChild(child) {
    child.parent = this;
    this.children.push(child);
    return this;
  }

  removeChild(child) {
    child.parent = null;
    const idx = this.children.indexOf(child);
    if (idx !== -1) this.children.splice(idx, 1);
    return this;
  }

  find(name) {
    if (this.name === name) return this;
    for (const child of this.children) {
      const found = child.find(name);
      if (found) return found;
    }
    return null;
  }

  getInsideObjects() {
    const objects = [...this.interior];
    for (const child of this.children) {
      objects.push(...child.exterior);
    }
    return objects;
  }

  getOutsideObjects() {
    return [...this.exterior];
  }
}
