import { NOTES, INTERVALS, MELODIES } from './intervals.js';
import { playInterval, playMelody } from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
  populateNoteSelect();
  populateIntervalSelect();

  // Tasto Riproduci
  document.getElementById('playButton').addEventListener('click', () => {
    const { baseNote, targetNote } = getSelectionData();
    if (!baseNote || !targetNote) return; // Errore già gestito in getSelectionData
    
    // Pulisci il testo della melodia per non confondere
    document.getElementById('melodyName').textContent = "";
    
    playInterval(baseNote.freq, targetNote.freq);
  });

  // Tasto Suggerimento (Nuovo)
  document.getElementById('hintButton').addEventListener('click', () => {
    const semitones = parseInt(document.getElementById('intervalSelect').value);
    const noteIndex = parseInt(document.getElementById('baseNoteSelect').value);
    const baseNote = NOTES[noteIndex];

    const melody = MELODIES[semitones];

    if (melody) {
      document.getElementById('melodyName').textContent = `🎵 ${melody.name}`;
      // Suoniamo la melodia usando la nota di partenza selezionata
      playMelody(baseNote.freq, melody.sequence, melody.rhythm);
    } else {
      document.getElementById('melodyName').textContent = "Nessuna melodia per questo intervallo";
    }
  });
});

// Funzione helper per calcolare note e validare
function getSelectionData() {
    const noteIndex = parseInt(document.getElementById('baseNoteSelect').value);
    const semitones = parseInt(document.getElementById('intervalSelect').value);
    const direction = document.getElementById('directionSelect').value;

    const baseNote = NOTES[noteIndex];
    const interval = direction === 'down' ? -semitones : semitones;

    const targetIndex = noteIndex + interval;
    if (targetIndex < 0 || targetIndex >= NOTES.length) {
      alert('Intervallo fuori scala!');
      return { baseNote: null, targetNote: null };
    }

    const targetNote = NOTES[targetIndex];
    return { baseNote, targetNote };
}

function populateNoteSelect() {
  const select = document.getElementById('baseNoteSelect');
  NOTES.forEach((note, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = note.name;
    if (note.name === 'Do3') option.selected = true;
    select.appendChild(option);
  });
}

function populateIntervalSelect() {
  const select = document.getElementById('intervalSelect');
  Object.entries(INTERVALS).forEach(([semitone, name]) => {
    const option = document.createElement('option');
    option.value = semitone;
    option.textContent = name;
    if (semitone === "7") option.selected = true;
    select.appendChild(option);
  });
}