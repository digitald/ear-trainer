import { NOTES, INTERVALS } from './intervals.js';
import { playInterval } from './audio.js';

document.addEventListener('DOMContentLoaded', () => {
  populateNoteSelect();
  populateIntervalSelect();

  document.getElementById('playButton').addEventListener('click', () => {
    const noteIndex = parseInt(document.getElementById('baseNoteSelect').value);
    const semitones = parseInt(document.getElementById('intervalSelect').value);
    const direction = document.getElementById('directionSelect').value;

    const baseNote = NOTES[noteIndex];
    const interval = direction === 'down' ? -semitones : semitones;

    const targetIndex = noteIndex + interval;
    if (targetIndex < 0 || targetIndex >= NOTES.length) {
      alert('Intervallo fuori scala!');
      return;
    }

    const targetNote = NOTES[targetIndex];

    playInterval(baseNote.freq, targetNote.freq);
  });
});

function populateNoteSelect() {
  const select = document.getElementById('baseNoteSelect');
  NOTES.forEach((note, index) => {
    const option = document.createElement('option');
    option.value = index;
    option.textContent = note.name;
    
    // AGGIUNTA: Se è Do3 (o Do4), selezionalo di default
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
    select.appendChild(option);
  });
}
