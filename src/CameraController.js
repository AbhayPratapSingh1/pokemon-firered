import * as THREE from "three";

const MOUSE_SENSITIVITY = 0.0025;
const MIN_PITCH = -0.6; // radians, looking down limit
const MAX_PITCH = 1.2; // radians, looking up limit
const DISTANCE = 3.5;
const FOLLOW_SMOOTHING = 10;
const MIN_HEIGHT_ABOVE_GROUND = 0.5;
const CAMERA_COLLISION_MARGIN = 0.25; // keep the near clip plane from poking through a wall
const MIN_CAMERA_DISTANCE = 0.6; // how close the camera is allowed to sit behind the player

export class CameraController {
  constructor(camera) {
    this.camera = camera;
    this.yaw = 0;
    this.pitch = 0.35;
    this._raycaster = new THREE.Raycaster();
  }

  /**
   * GTA-style camera collision: raycast from the look target back toward the
   * desired camera position and pull the camera in front of anything it hits
   * (walls, furniture) instead of letting it clip through. `collisionMeshes`
   * is a flat array of THREE.Object3D — pass the currently-active obstacle
   * meshes (interior walls when indoors, outdoor buildings otherwise).
   */
  update(delta, input, player, collisionMeshes = []) {
    const { dx, dy } = input.consumeMouseDelta();
    this.yaw -= dx * MOUSE_SENSITIVITY;
    this.pitch += dy * MOUSE_SENSITIVITY;
    this.pitch = Math.max(MIN_PITCH, Math.min(MAX_PITCH, this.pitch));

    const targetPos = player.position.clone();
    targetPos.y += player.headHeight * 0.6;

    // Spherical direction behind/above the player based on yaw/pitch.
    const direction = new THREE.Vector3(
      Math.sin(this.yaw) * Math.cos(this.pitch),
      Math.sin(this.pitch),
      Math.cos(this.yaw) * Math.cos(this.pitch)
    );

    let distance = DISTANCE;
    if (collisionMeshes.length > 0) {
      this._raycaster.set(targetPos, direction);
      this._raycaster.far = DISTANCE;
      const hits = this._raycaster.intersectObjects(collisionMeshes, false);
      if (hits.length > 0) {
        distance = Math.max(hits[0].distance - CAMERA_COLLISION_MARGIN, MIN_CAMERA_DISTANCE);
      }
    }

    const desiredPosition = targetPos.clone().add(direction.multiplyScalar(distance));
    desiredPosition.y = Math.max(desiredPosition.y, MIN_HEIGHT_ABOVE_GROUND);

    // Snap in (no lerp) when a wall pushes the camera closer, so it never
    // visibly clips through on a fast approach; still lerp when pulling back
    // out so the follow cam stays smooth.
    if (distance < this.camera.position.distanceTo(targetPos)) {
      this.camera.position.copy(desiredPosition);
    } else {
      const t = 1 - Math.exp(-FOLLOW_SMOOTHING * delta);
      this.camera.position.lerp(desiredPosition, t);
    }

    const lookTarget = player.position.clone();
    lookTarget.y += player.headHeight * 0.6;
    this.camera.lookAt(lookTarget);
  }
}
