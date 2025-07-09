export function getRandomBaseFrequency() {
  const baseNotes = [261.63, 293.66, 329.63, 349.23, 392.00]; // C4 to G4
  return baseNotes[Math.floor(Math.random() * baseNotes.length)];
}
