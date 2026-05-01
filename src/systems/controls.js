import * as THREE from "three";

function setupControls(camera, playerVelocity, throwBall, playerDirection) {
  const keyStates = {};

  // Mobile Support State
  const mobileInput = { forward: 0, right: 0, jump: false };

  document.addEventListener("keydown", (event) => (keyStates[event.code] = true));
  document.addEventListener("keyup", (event) => (keyStates[event.code] = false));

  document.body.addEventListener("click", () => {
    const docEl = document.documentElement;
    const requestFullScreen = docEl.requestFullscreen || docEl.mozRequestFullScreen || docEl.webkitRequestFullScreen || docEl.msRequestFullscreen;
    if (requestFullScreen) requestFullScreen.call(docEl).catch(() => { });

    if (window.screen && window.screen.orientation && window.screen.orientation.lock) {
      window.screen.orientation.lock("landscape").catch(() => { });
    }

    if (!window.gameIsReady) return;
    if (document.body.requestPointerLock) {
      try { document.body.requestPointerLock(); } catch (e) { }
    }
  });

  // Desktop Shooting & Mouse Control
  document.body.addEventListener("mousedown", () => {
    if (!window.gameIsReady) return;
    if (document.pointerLockElement === document.body) {
      throwBall(camera, playerDirection);
    }
  });

  document.body.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement === document.body) {
      camera.rotation.y -= event.movementX / 500;
      camera.rotation.x -= event.movementY / 500;
    }
  });

  // ========== MOBILE CONTROLS INTEGRATION ==========
  const aimZone = document.getElementById("aim-zone");
  const joystickBase = document.getElementById("joystick-base");
  const joystickNipple = document.getElementById("joystick-nipple");

  let aimTouchId = null;
  let aimLastX = 0, aimLastY = 0;

  if (aimZone) {
    aimZone.addEventListener("touchstart", (e) => {
      e.preventDefault();
      if (!window.gameIsReady) return;
      for (let touch of e.changedTouches) {
        if (aimTouchId === null) {
          aimTouchId = touch.identifier;
          aimLastX = touch.pageX;
          aimLastY = touch.pageY;
        }
      }
    });

    aimZone.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (!window.gameIsReady) return;
      for (let touch of e.changedTouches) {
        if (touch.identifier === aimTouchId) {
          const deltaX = touch.pageX - aimLastX;
          const deltaY = touch.pageY - aimLastY;
          camera.rotation.y -= deltaX / 250;
          camera.rotation.x -= deltaY / 250;
          aimLastX = touch.pageX;
          aimLastY = touch.pageY;
        }
      }
    });

    aimZone.addEventListener("touchend", (e) => {
      e.preventDefault();
      for (let touch of e.changedTouches) {
        if (touch.identifier === aimTouchId) aimTouchId = null;
      }
    });
  }

  let joyTouchId = null;
  const joyMax = 35; // Nipple boundary

  if (joystickBase) {
    const handleJoyMove = (pageX, pageY, rect) => {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      let dx = pageX - cx, dy = pageY - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > joyMax) {
        dx = (dx / dist) * joyMax;
        dy = (dy / dist) * joyMax;
      }
      joystickNipple.style.transform = `translate(${dx}px, ${dy}px)`;
      mobileInput.right = dx / joyMax;
      mobileInput.forward = -dy / joyMax; // Up is forward
    };

    joystickBase.addEventListener("touchstart", (e) => {
      e.preventDefault();
      if (!window.gameIsReady) return;
      const rect = joystickBase.getBoundingClientRect();
      for (let touch of e.changedTouches) {
        if (joyTouchId === null) {
          joyTouchId = touch.identifier;
          handleJoyMove(touch.pageX, touch.pageY, rect);
        }
      }
    });

    joystickBase.addEventListener("touchmove", (e) => {
      e.preventDefault();
      if (!window.gameIsReady) return;
      const rect = joystickBase.getBoundingClientRect();
      for (let touch of e.changedTouches) {
        if (touch.identifier === joyTouchId) handleJoyMove(touch.pageX, touch.pageY, rect);
      }
    });

    joystickBase.addEventListener("touchend", (e) => {
      e.preventDefault();
      for (let touch of e.changedTouches) {
        if (touch.identifier === joyTouchId) {
          joyTouchId = null;
          joystickNipple.style.transform = `translate(0px, 0px)`;
          mobileInput.forward = 0; mobileInput.right = 0;
        }
      }
    });
  }

  document.getElementById("jump-btn")?.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (window.gameIsReady) { mobileInput.jump = true; setTimeout(() => mobileInput.jump = false, 100); }
  });

  document.getElementById("shoot-btn")?.addEventListener("touchstart", (e) => {
    e.preventDefault();
    if (window.gameIsReady) throwBall(camera, playerDirection);
  });

  // Apply merged PC & Mobile controls loop
  function applyControls(deltaTime, playerOnFloor, camera) {
    const speedDelta = deltaTime * (playerOnFloor ? 25 : 8);
    camera.updateMatrixWorld();

    const forward = new THREE.Vector3();
    const side = new THREE.Vector3();

    if (camera.matrixWorld) {
      forward.setFromMatrixColumn(camera.matrixWorld, 0);
      forward.crossVectors(camera.up, forward).normalize();
      side.setFromMatrixColumn(camera.matrixWorld, 0).normalize();
    }

    // Merge Virtual Joystick + WASD mapping securely 
    let moveF = mobileInput.forward; let moveR = mobileInput.right;
    if (keyStates["KeyW"]) moveF = 1; if (keyStates["KeyS"]) moveF = -1;
    if (keyStates["KeyA"]) moveR = -1; if (keyStates["KeyD"]) moveR = 1;

    playerVelocity.add(forward.clone().multiplyScalar(speedDelta * moveF));
    playerVelocity.add(side.clone().multiplyScalar(speedDelta * moveR));

    if (playerOnFloor && (keyStates["Space"] || mobileInput.jump)) playerVelocity.y = 15;
  }

  return applyControls;
}

export { setupControls };
