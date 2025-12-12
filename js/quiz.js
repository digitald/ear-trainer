// Controlla il nome del file: interval.js o intervals.js?
import { NOTES, INTERVALS } from './interval.js'; 
import { playInterval } from './audio.js';

let currentInterval = null;
// Salviamo le frequenze correnti per poterle riascoltare
let currentBaseFreq = 0;
let currentTargetFreq = 0;
// Un flag per evitare che l'utente clicchi mentre aspetta il prossimo round
let isWaiting = false;

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startQuizBtn');
  const quizArea = document.getElementById('quizArea');
  const answerButtons = document.getElementById('answerButtons');
  
  // Creiamo un pulsante "Riascolta" dinamicamente
  const replayBtn = document.createElement('button');
  replayBtn.textContent = '🔄 Riascolta';
  replayBtn.className = 'replay-btn'; // Aggiungi stile in CSS se vuoi
  replayBtn.style.marginTop = "20px";
  replayBtn.onclick = () => {
    if(!isWaiting) playInterval(currentBaseFreq, currentTargetFreq);
  };
  // Lo inseriamo prima dei bottoni di risposta
  quizArea.insertBefore(replayBtn, answerButtons);

  // Costruisci bottoni delle risposte
  Object.entries(INTERVALS).forEach(([semitones, name]) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = name;
    btn.dataset.value = semitones;

    btn.addEventListener('click', () => {
      if (isWaiting) return; // Blocca click multipli
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
  isWaiting = false;
  clearFeedback();

  // Genera intervallo casuale (escludendo l'Unisono se vuoi renderlo più difficile, altrimenti va bene così)
  const intervalKeys = Object.keys(INTERVALS);
  // Nota: intervalKeys sono stringhe "0", "1", ecc.
  currentInterval = parseInt(intervalKeys[Math.floor(Math.random() * intervalKeys.length)]);

  // Scegli nota di partenza
  // maxStart assicura che (start + interval) non superi l'ultima nota
  const maxStart = NOTES.length - currentInterval - 1;
  const currentNoteIndex = Math.floor(Math.random() * (maxStart + 1));

  // Salviamo le frequenze nelle variabili globali
  currentBaseFreq = NOTES[currentNoteIndex].freq;
  currentTargetFreq = NOTES[currentNoteIndex + currentInterval].freq;

  // Riproduci
  playInterval(currentBaseFreq, currentTargetFreq);
}

function handleAnswer(userGuess) {
  const feedback = document.getElementById('feedback');
  isWaiting = true; // Blocca l'input dell'utente

  if (userGuess === currentInterval) {
    feedback.textContent = '✅ Corretto!';
    feedback.style.color = 'green';
  } else {
    const correctName = INTERVALS[currentInterval];
    feedback.textContent = `❌ Sbagliato! Era una ${correctName}`;
    feedback.style.color = 'red';
  }

  // Aspetta 2 secondi e poi ricomincia
  setTimeout(() => {
    startNewRound();
  }, 2500);
}

function clearFeedback() {
  const feedback = document.getElementById('feedback');
  feedback.textContent = '';
}