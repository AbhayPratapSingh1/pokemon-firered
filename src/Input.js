const MOVE_KEYS = new Set([
  "KeyW", "KeyA", "KeyS", "KeyD",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
  "ShiftLeft", "ShiftRight", "Space",
]);

export class InputManager {
  constructor(domElement) {
    this.domElement = domElement;
    this.keys = new Set();

    // Mouse-look deltas accumulated since last consume.
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;

    // Edge-detected jump: true for exactly one frame after Space is pressed.
    this.jumpPressed = false;
    this._jumpHeldLastFrame = false;

    // Edge-detected interact: true for exactly one frame after E is pressed.
    this.interactPressed = false;
    this._interactHeldLastFrame = false;

    this._onKeyDown = this._onKeyDown.bind(this);
    this._onKeyUp = this._onKeyUp.bind(this);
    this._onMouseMove = this._onMouseMove.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onPointerLockChange = this._onPointerLockChange.bind(this);

    window.addEventListener("keydown", this._onKeyDown);
    window.addEventListener("keyup", this._onKeyUp);
    document.addEventListener("mousemove", this._onMouseMove);
    document.addEventListener("pointerlockchange", this._onPointerLockChange);
    this.domElement.addEventListener("click", this._onClick);
  }

  get isPointerLocked() {
    return document.pointerLockElement === this.domElement;
  }

  _onClick() {
    if (!this.isPointerLocked) {
      this.domElement.requestPointerLock();
    }
  }

  _onPointerLockChange() {
    const prompt = document.getElementById("click-prompt");
    if (prompt) {
      prompt.classList.toggle("hidden", this.isPointerLocked);
    }
  }

  _onKeyDown(e) {
    if (MOVE_KEYS.has(e.code)) e.preventDefault();
    this.keys.add(e.code);
  }

  _onKeyUp(e) {
    this.keys.delete(e.code);
  }

  _onMouseMove(e) {
    if (!this.isPointerLocked) return;
    this.mouseDeltaX += e.movementX || 0;
    this.mouseDeltaY += e.movementY || 0;
  }

  isDown(code) {
    return this.keys.has(code);
  }

  get forward() {
    return this.isDown("KeyW") || this.isDown("ArrowUp");
  }
  get backward() {
    return this.isDown("KeyS") || this.isDown("ArrowDown");
  }
  get left() {
    return this.isDown("KeyA") || this.isDown("ArrowLeft");
  }
  get right() {
    return this.isDown("KeyD") || this.isDown("ArrowRight");
  }
  get sprint() {
    return this.isDown("ShiftLeft") || this.isDown("ShiftRight");
  }
  get jumpHeld() {
    return this.isDown("Space");
  }
  get interactHeld() {
    return this.isDown("KeyE");
  }

  /** Call once per frame after reading state. Resets per-frame accumulators. */
  update() {
    this.jumpPressed = this.jumpHeld && !this._jumpHeldLastFrame;
    this._jumpHeldLastFrame = this.jumpHeld;

    this.interactPressed = this.interactHeld && !this._interactHeldLastFrame;
    this._interactHeldLastFrame = this.interactHeld;
  }

  /** Consume and reset accumulated mouse deltas for this frame. */
  consumeMouseDelta() {
    const dx = this.mouseDeltaX;
    const dy = this.mouseDeltaY;
    this.mouseDeltaX = 0;
    this.mouseDeltaY = 0;
    return { dx, dy };
  }
}
