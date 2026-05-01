function Resizer(camera, renderer) {
  window.addEventListener("resize", onWindowResize);

  // Safe-area and Notch reflow detection
  window.addEventListener("orientationchange", () => {
    setTimeout(onWindowResize, 100);
    setTimeout(onWindowResize, 500); // Failsafe fallback
  });

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
  }
}

export { Resizer };
