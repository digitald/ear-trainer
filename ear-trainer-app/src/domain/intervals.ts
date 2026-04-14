export type Note = {
  name: string
  freq: number
}

export const NOTES: Note[] = [
  { name: 'La2', freq: 110.0 },
  { name: 'La#2', freq: 116.54 },
  { name: 'Si2', freq: 123.47 },
  { name: 'Do3', freq: 130.81 },
  { name: 'Do#3', freq: 138.59 },
  { name: 'Re3', freq: 146.83 },
  { name: 'Re#3', freq: 155.56 },
  { name: 'Mi3', freq: 164.81 },
  { name: 'Fa3', freq: 174.61 },
  { name: 'Fa#3', freq: 185.0 },
  { name: 'Sol3', freq: 196.0 },
  { name: 'Sol#3', freq: 207.65 },
  { name: 'La3', freq: 220.0 },
  { name: 'La#3', freq: 233.08 },
  { name: 'Si3', freq: 246.94 },
  { name: 'Do4', freq: 261.63 },
  { name: 'Do#4', freq: 277.18 },
  { name: 'Re4', freq: 293.66 },
  { name: 'Re#4', freq: 311.13 },
  { name: 'Mi4', freq: 329.63 },
  { name: 'Fa4', freq: 349.23 },
  { name: 'Fa#4', freq: 369.99 },
  { name: 'Sol4', freq: 392.0 },
  { name: 'Sol#4', freq: 415.3 },
  { name: 'La4', freq: 440.0 },
  { name: 'La#4', freq: 466.16 },
  { name: 'Si4', freq: 493.88 },
  { name: 'Do5', freq: 523.25 },
  { name: 'Do#5', freq: 554.37 },
  { name: 'Re5', freq: 587.33 },
  { name: 'Re#5', freq: 622.25 },
  { name: 'Mi5', freq: 659.25 },
  { name: 'Fa5', freq: 698.46 },
  { name: 'Fa#5', freq: 739.99 },
  { name: 'Sol5', freq: 783.99 },
  { name: 'Sol#5', freq: 830.61 },
  { name: 'La5', freq: 880.0 },
  { name: 'La#5', freq: 932.33 },
  { name: 'Si5', freq: 987.77 },
  { name: 'Do6', freq: 1046.5 },
]

export const INTERVALS: Record<number, string> = {
  0: 'unison',
  1: 'minorSecond',
  2: 'majorSecond',
  3: 'minorThird',
  4: 'majorThird',
  5: 'perfectFourth',
  6: 'tritone',
  7: 'perfectFifth',
  8: 'minorSixth',
  9: 'majorSixth',
  10: 'minorSeventh',
  11: 'majorSeventh',
  12: 'octave',
}

export type Melody = {
  key: string
  sequence: number[]
  rhythm: number
}

export const MELODIES: Record<number, Melody> = {
  1: { key: 'jaws', sequence: [0, 1, 0], rhythm: 0.35 },
  2: { key: 'happyBirthday', sequence: [0, 0, 2, 0, 5, 4], rhythm: 0.3 },
  3: { key: 'brahmsLullaby', sequence: [0, 0, 3], rhythm: 0.5 },
  4: { key: 'saints', sequence: [0, 4, 5, 7], rhythm: 0.3 },
  5: { key: 'mameliHarryPotter', sequence: [0, 5, 0, 5], rhythm: 0.3 },
  6: { key: 'simpsons', sequence: [0, 6, 7], rhythm: 0.35 },
  7: { key: 'twinkleTwinkle', sequence: [0, 0, 7, 7, 9, 9, 7], rhythm: 0.3 },
  8: { key: 'entertainerLoveStory', sequence: [0, 8, 3, 4, 5], rhythm: 0.25 },
  9: { key: 'traviata', sequence: [0, 9, 5, 9, 12], rhythm: 0.3 },
  10: { key: 'winnerTakesItAll', sequence: [0, 10, 0, 10], rhythm: 0.4 },
  11: { key: 'takeOnMe', sequence: [0, 0, 7, 4, 11, 11], rhythm: 0.2 },
  12: { key: 'somewhereOverRainbow', sequence: [0, 12, 11, 7], rhythm: 0.5 },
}
