import * as THREE from "three";

const MOUSE_SENSITIVITY = 0.0025;
const MIN_PITCH = -0.6;
const MAX_PITCH = 1.2;
const DISTANCE = 3.5;
const MIN_HEIGHT_ABOVE_GROUND = 0.2;
const CAMERA_COLLISION_MARGIN = 0.15;
const MIN_CAMERA_DISTANCE = 0.3;
const APPROACH_SMOOTHING = 14;
const RETREAT_SMOOTHING = 4;

export class CameraController {
  constructor(camera) {
    this.camera = camera;
    this.yaw = 0;
    this.pitch = 0.15;
    this.currentDistance = DISTANCE;
    this._raycaster = new THREE.Raycaster();
  }

  update(delta, input, player, cameraCollideMeshes = []) {
    const { dx, dy } = input.consumeMouseDelta();
    this.yaw -= dx * MOUSE_SENSITIVITY;
    this.pitch += dy * MOUSE_SENSITIVITY;
    this.pitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, this.pitch));

    const targetPos = player.position.clone();
    targetPos.y += player.headHeight * 0.6;

    const direction = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    );

    let desiredDistance = DISTANCE;
    if (cameraCollideMeshes.length > 0) {
      this._raycaster.set(targetPos, direction);
      this._raycaster.far = DISTANCE;
      const hits = this._raycaster.intersectObjects(cameraCollideMeshes, true);
      if (hits.length > 0) {
        desiredDistance = Math.max(MIN_CAMERA_DISTANCE, hits[0].distance - CAMERA_COLLISION_MARGIN);
      }
    }

    const speed = desiredDistance < this.currentDistance ? APPROACH_SMOOTHING : RETREAT_SMOOTHING;
    const t = 1 - Math.exp(-speed * delta);
    this.currentDistance += (desiredDistance - this.currentDistance) * t;

    const desiredPosition = targetPos.clone().add(direction.clone().multiplyScalar(this.currentDistance));
    desiredPosition.y = Math.max(desiredPosition.y, targetPos.y + MIN_HEIGHT_ABOVE_GROUND);

    this.camera.position.copy(desiredPosition);

    const lookTarget = player.position.clone();
    lookTarget.y += player.headHeight * 0.6;
    this.camera.lookAt(lookTarget);
  }
}
