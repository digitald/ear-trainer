export const NOTES = [
  { name: "La2", freq: 110.00 },
  { name: "La#2", freq: 116.54 },
  { name: "Si2", freq: 123.47 },

  { name: "Do3", freq: 130.81 },
  { name: "Do#3", freq: 138.59 },
  { name: "Re3", freq: 146.83 },
  { name: "Re#3", freq: 155.56 },
  { name: "Mi3", freq: 164.81 },
  { name: "Fa3", freq: 174.61 },
  { name: "Fa#3", freq: 185.00 },
  { name: "Sol3", freq: 196.00 },
  { name: "Sol#3", freq: 207.65 },
  { name: "La3", freq: 220.00 },
  { name: "La#3", freq: 233.08 },
  { name: "Si3", freq: 246.94 },

  { name: "Do4", freq: 261.63 },
  { name: "Do#4", freq: 277.18 },
  { name: "Re4", freq: 293.66 },
  { name: "Re#4", freq: 311.13 },
  { name: "Mi4", freq: 329.63 },
  { name: "Fa4", freq: 349.23 },
  { name: "Fa#4", freq: 369.99 },
  { name: "Sol4", freq: 392.00 },
  { name: "Sol#4", freq: 415.30 },
  { name: "La4", freq: 440.00 },
  { name: "La#4", freq: 466.16 },
  { name: "Si4", freq: 493.88 },

  { name: "Do5", freq: 523.25 },
  { name: "Do#5", freq: 554.37 },
  { name: "Re5", freq: 587.33 },
  { name: "Re#5", freq: 622.25 },
  { name: "Mi5", freq: 659.25 },
  { name: "Fa5", freq: 698.46 },
  { name: "Fa#5", freq: 739.99 },
  { name: "Sol5", freq: 783.99 },
  { name: "Sol#5", freq: 830.61 },
  { name: "La5", freq: 880.00 },
  { name: "La#5", freq: 932.33 },
  { name: "Si5", freq: 987.77 },

  { name: "Do6", freq: 1046.50 },
];

export const INTERVALS = {
  0: "Unisono",
  1: "Seconda minore",
  2: "Seconda maggiore",
  3: "Terza minore",
  4: "Terza maggiore",
  5: "Quarta giusta",
  6: "Tritono",
  7: "Quinta giusta",
  8: "Sesta minore",
  9: "Sesta maggiore",
  10: "Settima minore",
  11: "Settima maggiore",
  12: "Ottava"
};




// NUOVO: Le melodie di riferimento
// I numeri sono i semitoni rispetto alla nota base (0).
// null indica una pausa.
export const MELODIES = {
  1: { // Seconda Minore
    name: "Lo Squalo (Jaws)",
    sequence: [0, 1, 0, 1, 0, 1], 
    rhythm: 0.3 // Velocità
  },
  2: { // Seconda Maggiore
    name: "Tanti Auguri",
    sequence: [0, 0, 2, 0, 5, 4], // Tan-ti Au-gu-ri a...
    rhythm: 0.4
  },
  3: { // Terza Minore
    name: "Ninna Nanna (Brahms)",
    sequence: [0, 0, 3, 0, 0, 3], // Nin-na nan-na...
    rhythm: 0.5
  },
  4: { // Terza Maggiore
    name: "Oh When The Saints",
    sequence: [0, 4, 5, 7], // Oh when the saints...
    rhythm: 0.4
  },
  5: { // Quarta Giusta
    name: "Inno di Mameli / Harry Potter",
    sequence: [0, 5, 0, 5, 0, 5], // Fratelli d'Italia... (pom-pom)
    rhythm: 0.3
  },
  6: { // Tritono
    name: "I Simpson",
    sequence: [0, 6, 7], // The Simp-sons...
    rhythm: 0.4
  },
  7: { // Quinta Giusta
    name: "Star Wars / Twinkle Twinkle",
    sequence: [0, 0, 7, 7, 9, 9, 7], // Twin-kle twin-kle lit-tle star
    rhythm: 0.4
  },
  8: { // Sesta Minore
    name: "The Entertainer / Love Story",
    sequence: [0, 8, 3, 4, 5], 
    rhythm: 0.25
  },
  9: { // Sesta Maggiore
    name: "La Traviata (Libiamo)",
    sequence: [0, 9, 5, 9, 12], // Li-bia-mo, ne'...
    rhythm: 0.4
  },
  10: { // Settima Minore
    name: "The Winner Takes It All (ABBA)",
    sequence: [0, 10, 0, 10], 
    rhythm: 0.5
  },
  11: { // Settima Maggiore
    name: "Take On Me (A-ha)",
    sequence: [0, 0, 7, 4, 11, 11], 
    rhythm: 0.25
  },
  12: { // Ottava
    name: "Somewhere Over The Rainbow",
    sequence: [0, 12, 11, 7], // Some-where o-ver...
    rhythm: 0.6
  }
};