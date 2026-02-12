export const LIBRARY_MAP: Record<string, { label: string; urls: string[] }> = {
  react: {
    label: "React",
    urls: [
      "https://cdnjs.cloudflare.com/ajax/libs/react/18.2.0/umd/react.production.min.js",
      "https://cdnjs.cloudflare.com/ajax/libs/react-dom/18.2.0/umd/react-dom.production.min.js",
    ],
  },
  three: {
    label: "Three.js (3D graphics)",
    urls: [
      "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
    ],
  },
  d3: {
    label: "D3.js (data visualization)",
    urls: ["https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js"],
  },
  gsap: {
    label: "GSAP (animations)",
    urls: [
      "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.2/gsap.min.js",
    ],
  },
  tone: {
    label: "Tone.js (audio/music)",
    urls: [
      "https://cdnjs.cloudflare.com/ajax/libs/tone/14.8.49/Tone.min.js",
    ],
  },
  p5: {
    label: "p5.js (creative coding)",
    urls: [
      "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js",
    ],
  },
  phaser: {
    label: "Phaser (2D game framework)",
    urls: [
      "https://cdnjs.cloudflare.com/ajax/libs/phaser/3.70.0/phaser.min.js",
    ],
  },
  matter: {
    label: "matter.js (physics engine)",
    urls: [
      "https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js",
    ],
  },
  pixi: {
    label: "Pixi.js (2D rendering)",
    urls: [
      "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.3.2/pixi.min.js",
    ],
  },
};

export const VALID_LIBRARY_KEYS = Object.keys(LIBRARY_MAP);

export function buildLibraryScriptTags(libraries: string[]): string {
  return libraries
    .filter((lib) => lib in LIBRARY_MAP)
    .flatMap((lib) => LIBRARY_MAP[lib].urls)
    .map((url) => `<script src="${url}"></script>`)
    .join("\n  ");
}
