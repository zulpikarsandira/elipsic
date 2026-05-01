import * as THREE from "three";

function setupControls(camera, playerVelocity, throwBall, playerDirection) {
  const keyStates = {};

  document.addEventListener(
    "keydown",
    (event) => (keyStates[event.code] = true)
  );
  document.addEventListener(
    "keyup",
    (event) => (keyStates[event.code] = false)
  );

  document.body.addEventListener("click", () => {
    // 1) Allow Fullscreen expansion anytime (Mobile / Desktop)
    const docEl = document.documentElement;
    const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    if (requestFullScreen) {
      requestFullScreen.call(docEl).catch((err) => console.log(err));
    }

    // 2) Allow Auto-Landscape rotation anytime (Mobile)
    if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
      window.screen.orientation.lock("landscape").catch((err) => console.log(err));
    }

    // 3) Prevent interaction/controls until loading finishes
    if (!window.gameIsReady) return;

    // 4) Pointer lock for Desktop (Game entry)
    if (document.body.requestPointerLock) {
      try { document.body.requestPointerLock(); } catch (e) { }
    }
  });

  // ✅ Pass `playerDirection` correctly
  document.body.addEventListener("mousedown", () => {
    if (document.pointerLockElement === document.body) {
      throwBall(camera, playerDirection); // ✅ FIX: Pass playerDirection
    }
  });

  document.body.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement === document.body) {
      camera.rotation.y -= event.movementX / 500;
      camera.rotation.x -= event.movementY / 500;
    }
  });

  function applyControls(deltaTime, playerOnFloor, camera) {
    const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);

    // ✅ Manually update the camera's world matrix
    camera.updateMatrixWorld();

    const forward = new THREE.Vector3();
    const side = new THREE.Vector3();

    // ✅ Use matrixWorld here safely
    if (camera.matrixWorld) {
      forward.setFromMatrixColumn(camera.matrixWorld, 0);
      forward.crossVectors(camera.up, forward).normalize();

      side.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
    }

    if (keyStates["KeyW"])
      playerVelocity.add(forward.clone().multiplyScalar(speedDelta));
    if (keyStates["KeyS"])
      playerVelocity.add(forward.clone().multiplyScalar(-speedDelta));
    if (keyStates["KeyA"])
      playerVelocity.add(side.clone().multiplyScalar(-speedDelta));
    if (keyStates["KeyD"])
      playerVelocity.add(side.clone().multiplyScalar(speedDelta));

    if (playerOnFloor && keyStates["Space"]) playerVelocity.y = 15;
  }

  return applyControls;
}

export { setupControls };
