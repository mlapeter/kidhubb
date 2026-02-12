const ADJECTIVES = [
  "Cosmic", "Turbo", "Mega", "Super", "Hyper", "Ultra",
  "Neon", "Solar", "Lunar", "Astro", "Cyber", "Blaze",
  "Frost", "Storm", "Thunder", "Crystal", "Golden", "Silver",
  "Swift", "Brave", "Bold", "Wild", "Epic", "Lucky",
  "Magic", "Laser", "Spark", "Flash", "Blazing", "Frozen",
  "Electric", "Atomic", "Quantum", "Plasma", "Nova", "Rapid",
  "Sonic", "Mystic", "Drift", "Pixel", "Glitch", "Chrome",
  "Stealth", "Rocket", "Shadow", "Phantom", "Prism", "Apex",
];

const NOUNS = [
  "Wolf", "Dragon", "Phoenix", "Tiger", "Hawk", "Eagle",
  "Falcon", "Panther", "Lion", "Bear", "Fox", "Owl",
  "Shark", "Cobra", "Viper", "Raven", "Panda", "Koala",
  "Otter", "Bunny", "Penguin", "Dolphin", "Turtle", "Gecko",
  "Comet", "Star", "Meteor", "Galaxy", "Coder", "Gamer",
  "Builder", "Maker", "Pilot", "Rider", "Scout", "Knight",
  "Wizard", "Ranger", "Ninja", "Pirate", "Captain", "Hero",
  "Legend", "Bolt", "Flare", "Wave", "Flame", "Glider",
];

export function generateDisplayName(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(Math.random() * 90) + 10; // 10-99
  return `${adj}${noun}${num}`;
}
