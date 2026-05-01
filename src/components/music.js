// 🎵 Background Ambient Music Module 🎵
const ambientSounds = [
  new Audio("/sounds/ambience1.mp3"),
  new Audio("/sounds/ambience2.mp3"),
  new Audio("/sounds/ambience3.mp3"),
];

ambientSounds.forEach((sound) => {
  sound.loop = true; // Infinite loop
  sound.volume = 0.7; // Default volume
});

let isPlaying = false;

export function playAmbientMusic() {
  if (!isPlaying) {
    ambientSounds.forEach((sound) => {
      sound.load();
      sound.play().catch((err) => console.warn("Audio play failed:", err));
    });
    isPlaying = true;
  }
}
