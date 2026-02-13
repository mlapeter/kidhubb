const ADJECTIVES = [
  // Original
  "ROCKET", "PIXEL", "COSMIC", "TURBO", "MEGA", "SUPER", "HYPER", "ULTRA",
  "NEON", "SOLAR", "LUNAR", "ASTRO", "CYBER", "BLAZE", "FROST", "STORM",
  "THUNDER", "SHADOW", "CRYSTAL", "GOLDEN", "SILVER", "RUBY", "JADE", "CORAL",
  "CRIMSON", "AZURE", "VIOLET", "SCARLET", "AMBER", "EMERALD", "SWIFT",
  "BRAVE", "BOLD", "WILD", "EPIC", "LUCKY", "MAGIC", "NINJA", "LASER",
  "PHANTOM", "SPARK", "FLASH", "BLAZING", "FROZEN", "ELECTRIC", "ATOMIC",
  "QUANTUM", "PLASMA", "NOVA", "COMET", "ORBIT", "PRISM", "TITAN", "DRIFT",
  "GLITCH", "CHROME", "STEALTH", "MYSTIC", "RAPID", "SONIC", "FUSION",
  "VORTEX", "ECHO", "PULSE", "ZEN", "APEX", "OMEGA", "ALPHA", "DELTA",
  // Colors & materials
  "COPPER", "IRON", "COBALT", "ONYX", "IVORY", "OPAL", "PEARL", "BRONZE",
  "MARBLE", "VELVET", "SATIN", "MISTY", "DUSTY", "RUSTY", "SHINY", "GLOSSY",
  // Nature & weather
  "CLOUDY", "SUNNY", "WINDY", "RAINY", "SNOWY", "FOGGY", "ROCKY", "SANDY",
  "MOSSY", "LEAFY", "THORNY", "FROSTY", "STORMY", "BREEZY", "TROPICAL", "ARCTIC",
  // Personality & vibe
  "CLEVER", "SNEAKY", "MIGHTY", "TINY", "GIANT", "FIERCE", "GENTLE", "SILENT",
  "LOUD", "DIZZY", "FUZZY", "GOOFY", "JOLLY", "GRUMPY", "SLEEPY", "ZIPPY",
  "PEPPY", "SPICY", "CRISPY", "CHILL", "FUNKY", "GROOVY", "WACKY", "ZAPPY",
  // Tech & sci-fi
  "BINARY", "MATRIX", "VECTOR", "NEURAL", "PHOTON", "PROTON", "CARBON", "SILICON",
  "DIGITAL", "ANALOG", "SIGNAL", "STATIC", "CRYPTO", "WARP", "FLUX", "ZERO",
  // Action & movement
  "DASHING", "FLYING", "RACING", "DIVING", "RISING", "ROAMING", "DRIFTING", "SPINNING",
  "BOUNCING", "ROLLING", "SLIDING", "GLIDING", "SOARING", "CHARGING", "LEAPING", "ZOOMING",
];

const NOUNS = [
  // Animals
  "WOLF", "DRAGON", "PHOENIX", "TIGER", "HAWK", "EAGLE", "FALCON", "PANTHER",
  "LION", "BEAR", "FOX", "OWL", "SHARK", "COBRA", "VIPER", "RAVEN",
  "PANDA", "KOALA", "OTTER", "BUNNY", "PENGUIN", "DOLPHIN", "TURTLE", "GECKO",
  "LYNX", "MOOSE", "BISON", "CRANE", "HERON", "PARROT", "TOUCAN", "MANTIS",
  "SQUID", "WHALE", "CRAB", "MOTH", "BEETLE", "BADGER", "FERRET", "LEMUR",
  "JAGUAR", "CONDOR", "OSPREY", "STINGRAY", "HORNET", "CHAMELEON", "YETI", "KRAKEN",
  // Space & nature
  "COMET", "STAR", "METEOR", "NEBULA", "GALAXY", "PLANET", "MOON", "ORBIT",
  "QUASAR", "PULSAR", "AURORA", "ECLIPSE", "SOLSTICE", "ZENITH", "CRATER", "ASTEROID",
  "VOLCANO", "GLACIER", "CANYON", "REEF", "SUMMIT", "RAPIDS", "TUNDRA", "JUNGLE",
  // People & roles
  "CODER", "GAMER", "BUILDER", "HACKER", "MAKER", "PILOT", "RIDER", "SCOUT",
  "KNIGHT", "WIZARD", "RANGER", "NINJA", "PIRATE", "CAPTAIN", "HERO", "LEGEND",
  "VIKING", "SAMURAI", "JESTER", "NOMAD", "BANDIT", "CYBORG", "ROBOT", "GOLEM",
  // Objects & concepts
  "BLITZ", "SPARK", "BOLT", "FLARE", "WAVE", "STORM", "FLAME", "FROST",
  "BLADE", "ARROW", "SHIELD", "QUEST", "CIPHER", "MATRIX", "PIXEL", "GLIDER",
  "PRISM", "CRYSTAL", "BEACON", "SHARD", "RELIC", "TOKEN", "COMPASS", "ANCHOR",
  "ROCKET", "HAMMER", "DYNAMO", "GADGET", "TURRET", "FORTRESS", "CITADEL", "PORTAL",
];

export function generateCreatorCode(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun1 = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const noun2 = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90) + 10; // 10-99
  return `${adj}-${noun1}-${noun2}-${num}`;
}
