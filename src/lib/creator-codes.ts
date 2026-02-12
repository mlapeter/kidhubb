const ADJECTIVES = [
  "ROCKET", "PIXEL", "COSMIC", "TURBO", "MEGA", "SUPER", "HYPER", "ULTRA",
  "NEON", "SOLAR", "LUNAR", "ASTRO", "CYBER", "BLAZE", "FROST", "STORM",
  "THUNDER", "SHADOW", "CRYSTAL", "GOLDEN", "SILVER", "RUBY", "JADE", "CORAL",
  "CRIMSON", "AZURE", "VIOLET", "SCARLET", "AMBER", "EMERALD", "SWIFT",
  "BRAVE", "BOLD", "WILD", "EPIC", "LUCKY", "MAGIC", "NINJA", "LASER",
  "PHANTOM", "SPARK", "FLASH", "BLAZING", "FROZEN", "ELECTRIC", "ATOMIC",
  "QUANTUM", "PLASMA", "NOVA", "COMET", "ORBIT", "PRISM", "TITAN", "DRIFT",
  "GLITCH", "CHROME", "STEALTH", "MYSTIC", "RAPID", "SONIC", "FUSION",
  "VORTEX", "ECHO", "PULSE", "ZEN", "APEX", "OMEGA", "ALPHA", "DELTA",
];

const NOUNS = [
  "WOLF", "DRAGON", "PHOENIX", "TIGER", "HAWK", "EAGLE", "FALCON", "PANTHER",
  "LION", "BEAR", "FOX", "OWL", "SHARK", "COBRA", "VIPER", "RAVEN",
  "PANDA", "KOALA", "OTTER", "BUNNY", "PENGUIN", "DOLPHIN", "TURTLE", "GECKO",
  "COMET", "STAR", "METEOR", "NEBULA", "GALAXY", "PLANET", "MOON", "ORBIT",
  "CODER", "GAMER", "BUILDER", "HACKER", "MAKER", "PILOT", "RIDER", "SCOUT",
  "KNIGHT", "WIZARD", "RANGER", "NINJA", "PIRATE", "CAPTAIN", "HERO", "LEGEND",
  "BLITZ", "SPARK", "BOLT", "FLARE", "WAVE", "STORM", "FLAME", "FROST",
  "BLADE", "ARROW", "SHIELD", "QUEST", "CIPHER", "MATRIX", "PIXEL", "GLIDER",
];

export function generateCreatorCode(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90) + 10; // 10-99
  return `${adj}-${noun}-${num}`;
}
