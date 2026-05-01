import { WebGLRenderer, PCFSoftShadowMap, VSMShadowMap, ACESFilmicToneMapping } from "three";

function createRenderer(animate) {
  const isMobile = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent);

  // Disable heavy multi-sampling anti-aliasing on mobile devices
  const renderer = new WebGLRenderer({ antialias: !isMobile });

  // Enforce a hard cap on retina display pixel resolutions (max 1.5x on mobile)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isMobile ? 1.5 : 2));

  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setAnimationLoop(animate);

  renderer.shadowMap.enabled = true;
  // VSM can be more expensive than PCFSoft on mobiles, fallback safely
  renderer.shadowMap.type = isMobile ? PCFSoftShadowMap : VSMShadowMap;
  renderer.toneMapping = ACESFilmicToneMapping;
  return renderer;
}

export { createRenderer };
