import { NOTES, INTERVALS } from './intervals.js';
import { playInterval } from './audio.js';

let currentInterval = null;
let currentNoteIndex = null;

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startQuizBtn');
  const quizArea = document.getElementById('quizArea');
  const answerButtons = document.getElementById('answerButtons');

  // Costruisci bottoni delle risposte
  Object.entries(INTERVALS).forEach(([semitones, name]) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = name;
    btn.dataset.value = semitones;

    btn.addEventListener('click', () => {
      const userGuess = parseInt(btn.dataset.value);
      handleAnswer(userGuess);
    });

    answerButtons.appendChild(btn);
  });

  startBtn.addEventListener('click', () => {
    startBtn.classList.add('hidden');
    quizArea.classList.remove('hidden');
    startNewRound();
  });
});

function startNewRound() {
  const availableNoteIndexes = NOTES.map((_, i) => i);

  // Genera intervallo casuale tra 1 e 12 semitoni
  const intervalKeys = Object.keys(INTERVALS);
  currentInterval = parseInt(intervalKeys[Math.floor(Math.random() * intervalKeys.length)]);

  // Scegli nota di partenza tale che target non esca fuori scala
  const maxStart = NOTES.length - currentInterval - 1;
  currentNoteIndex = Math.floor(Math.random() * (maxStart + 1));

  const baseFreq = NOTES[currentNoteIndex].freq;
  const targetFreq = NOTES[currentNoteIndex + currentInterval].freq;

  playInterval(baseFreq, targetFreq);

  clearFeedback();
}

function handleAnswer(userGuess) {
  const feedback = document.getElementById('feedback');
  if (userGuess === currentInterval) {
    feedback.textContent = '✅ Corretto!';
  } else {
    const correctName = INTERVALS[currentInterval];
    feedback.textContent = `❌ Era una ${correctName}`;
  }

  setTimeout(() => {
    startNewRound();
  }, 2000);
}

function clearFeedback() {
  const feedback = document.getElementById('feedback');
  feedback.textContent = '';
}
