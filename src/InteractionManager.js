/**
 * Minimal proximity-based interaction system. No such system existed in the
 * project before the player house was added, so this is intentionally small:
 * each frame, find the nearest interactable within range, show a "Press E"
 * prompt, and fire its message on the E-key edge. Reused as-is for any future
 * interactable (TV/PC/bed/sink today) rather than building one system per object.
 */
const INTERACT_RANGE = 1.6;

export class InteractionManager {
  constructor() {
    this.promptEl = document.getElementById("interact-prompt");
    this.messageEl = document.getElementById("interact-message");
    this._messageTimer = 0;
  }

  update(delta, input, player, interactables) {
    let nearest = null;
    let nearestDist = INTERACT_RANGE;
    for (const item of interactables) {
      const dist = player.position.distanceTo(item.position);
      if (dist < nearestDist) {
        nearest = item;
        nearestDist = dist;
      }
    }

    if (this.promptEl) {
      if (nearest) {
        this.promptEl.textContent = nearest.prompt;
        this.promptEl.classList.remove("hidden");
      } else {
        this.promptEl.classList.add("hidden");
      }
    }

    if (nearest && input.interactPressed) {
      this._showMessage(nearest.message);
    }

    if (this._messageTimer > 0) {
      this._messageTimer -= delta;
      if (this._messageTimer <= 0 && this.messageEl) {
        this.messageEl.classList.add("hidden");
      }
    }
  }

  _showMessage(text) {
    if (!this.messageEl) return;
    this.messageEl.textContent = text;
    this.messageEl.classList.remove("hidden");
    this._messageTimer = 2.5;
  }
}
