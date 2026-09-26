const fs = require('fs');
const path = require('path');
const vm = require('vm');
const assert = require('assert');

class Vector3 {
  constructor(x = 0, y = 0, z = 0) { this.x = x; this.y = y; this.z = z; }
  set(x, y, z) { this.x = x; this.y = y; this.z = z; return this; }
  clone() { return new Vector3(this.x, this.y, this.z); }
  copy(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; }
  subVectors(a, b) { this.x = a.x - b.x; this.y = a.y - b.y; this.z = a.z - b.z; return this; }
  multiplyScalar(n) { this.x *= n; this.y *= n; this.z *= n; return this; }
  add(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; }
}
class FakeOrbitControls {
  constructor(camera) { this.camera = camera; this.target = new Vector3(); }
  update() {}
}
const window = { THREE: {
  OrbitControls: FakeOrbitControls,
  Box3: class {},
  Raycaster: class {},
  Vector2: class {},
  Vector3
} };
vm.runInNewContext(fs.readFileSync(path.join(__dirname, '..', 'src', 'camera-controller.js'), 'utf8'), { window, Math, Number });
const CameraController = window.CameraController;
const camera = { position: new Vector3(0, 3, 5), near: 0.1, fov: 46, updateProjectionMatrix() {} };
const controller = new CameraController(camera, {});
controller.controls.target.set(0, 1, 0);
const offsetBefore = camera.position.clone().subVectors(camera.position, controller.controls.target);
assert(controller.followTarget(new Vector3(2, 0, 1), 1 / 60));
const offsetAfter = new Vector3().subVectors(camera.position, controller.controls.target);
assert(Math.abs(offsetBefore.x - offsetAfter.x) < 1e-9);
assert(Math.abs(offsetBefore.y - offsetAfter.y) < 1e-9);
assert(Math.abs(offsetBefore.z - offsetAfter.z) < 1e-9, 'following should pan without changing orbit distance');
assert(controller.controls.target.x > 0 && controller.controls.target.z > 0, 'the camera target should follow the creature');
const beforeBlocked = controller.controls.target.clone();
controller._tween = {};
assert.equal(controller.followTarget(new Vector3(-2, 0, -1), 1), false, 'follow must not interrupt a cinematic tween');
assert.deepEqual(controller.controls.target, beforeBlocked);
console.log('camera controller follow unit test: PASS');
