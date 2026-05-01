import * as THREE from "three";

// Components
import { createScene } from "./components/scene";
import { createCamera, gunMixer } from "./components/camera";
import { createLights } from "./components/lights";
import { loadWorld } from "./components/world";
import { playAmbientMusic } from "./components/music";

// Systems
import { createRenderer } from "./systems/renderer";
import { Resizer } from "./systems/resizer";

// Physics & Controls
import { createPhysics, STEPS_PER_FRAME } from "./systems/physics";
import { setupControls } from "./systems/controls";

const clock = new THREE.Clock();
const scene = createScene();
const { camera, animations } = createCamera(scene); // Destructure to get the camera instance and animations
const { fillLight1, directionalLight } = createLights();
scene.add(fillLight1, directionalLight);

const container = document.getElementById("container");
const renderer = createRenderer(animate);
container.appendChild(renderer.domElement);

// Initialize Physics & Controls
const {
  playerCollider,
  playerVelocity,
  playerDirection,
  updatePlayer,
  updateSpheres,
  throwBall,
  worldOctree,
} = createPhysics(scene, animations); // Pass animations to createPhysics

const applyControls = setupControls(
  camera, // Pass the correct camera instance
  playerVelocity,
  throwBall,
  playerDirection
);

// Load World
loadWorld(scene, worldOctree);



// Splash screen logic
const preStartScreen = document.getElementById("pre-start-screen");
const startBtn = document.getElementById("start-btn");
const splashScreen = document.getElementById("splash-screen");
const loadingScreen = document.getElementById("loading-screen");
const bgVideo = document.getElementById("bg-video");
window.gameIsReady = false;

// Handle the very first explicit start click
if (startBtn) {
  startBtn.addEventListener("click", () => {
    // Hide the initial menu
    if (preStartScreen) preStartScreen.style.display = "none";

    // Play the splash video explicitly
    if (bgVideo) bgVideo.play().catch(e => console.log("Auto-play blocked", e));
  });
}

document.addEventListener("pointerlockchange", () => {
  if (document.pointerLockElement === document.body) {
    if (preStartScreen) preStartScreen.style.display = "none";
    if (splashScreen) splashScreen.style.display = "none";
    if (loadingScreen) loadingScreen.style.display = "none";
  } else {
    // Optional: show a pause menu here if needed
  }
});

if (bgVideo) {
  bgVideo.addEventListener("ended", () => {
    // Hide splash screen video
    if (splashScreen) splashScreen.style.display = "none";
    // Show loading screen
    if (loadingScreen) {
      loadingScreen.style.display = "flex";

      // Delay explicitly for 8 seconds
      setTimeout(() => {
        window.gameIsReady = true;
        loadingScreen.style.display = "none"; // Automatically show in-game view
        playAmbientMusic(); // Play music only at in-game entry
      }, 8000);
    } else {
      window.gameIsReady = true;
      playAmbientMusic();
    }
  });
}

// Animation Loop

function animate() {
  const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;

  for (let i = 0; i < STEPS_PER_FRAME; i++) {
    applyControls(deltaTime, playerCollider.onFloor, camera);
    updatePlayer(deltaTime, worldOctree, camera);
    updateSpheres(deltaTime, worldOctree);
  }

  // ✅ Update gun animations
  if (gunMixer) gunMixer.update(deltaTime);

  renderer.render(scene, camera);
}

// Resizer
Resizer(camera, renderer);
