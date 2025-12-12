import { NOTES, INTERVALS } from './intervals.js'; 
import { playInterval } from './audio.js';

let currentInterval = null;
let currentBaseFreq = 0;
let currentTargetFreq = 0;
let isWaiting = false; // Blocca click durante l'attesa

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startQuizBtn');
  const quizArea = document.getElementById('quizArea');
  const replayArea = document.getElementById('replayArea');
  const answerButtons = document.getElementById('answerButtons');
  
  // 1. Creiamo il pulsante Riascolta (icona grossa)
  const replayBtn = document.createElement('button');
  replayBtn.innerHTML = '🔊'; // Icona speaker
  replayBtn.className = 'replay-btn hidden'; // Nascosto all'inizio
  replayBtn.onclick = () => {
    if(!isWaiting) playInterval(currentBaseFreq, currentTargetFreq);
  };
  replayArea.appendChild(replayBtn);

  // 2. Creiamo la griglia dei bottoni risposta
  Object.entries(INTERVALS).forEach(([semitones, name]) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    // Abbrevi nomi lunghi per farli stare nella griglia (opzionale)
    // Es: "Seconda maggiore" -> "2ª Magg"
    btn.textContent = simplifyName(name); 
    btn.dataset.value = semitones;

    btn.addEventListener('click', (e) => {
      if (isWaiting) return; 
      handleAnswer(parseInt(btn.dataset.value), e.target);
    });

    answerButtons.appendChild(btn);
  });

  // 3. Start
  startBtn.addEventListener('click', () => {
    startBtn.classList.add('hidden');
    quizArea.classList.remove('hidden');
    replayBtn.classList.remove('hidden');
    startNewRound();
  });
});

// Funzione per accorciare i nomi nella griglia (più pulito su mobile)
function simplifyName(name) {
    return name
        .replace("minore", "min")
        .replace("maggiore", "Mag")
        .replace("giusta", "G")
        .replace("aumentata", "Aum")
        .replace("diminuita", "Dim");
}

function startNewRound() {
  isWaiting = false;
  clearFeedback();
  resetButtonStyles();

  // Genera intervallo e note (Logica esistente)
  const intervalKeys = Object.keys(INTERVALS);
  currentInterval = parseInt(intervalKeys[Math.floor(Math.random() * intervalKeys.length)]);
  const maxStart = NOTES.length - currentInterval - 1;
  const currentNoteIndex = Math.floor(Math.random() * (maxStart + 1));

  currentBaseFreq = NOTES[currentNoteIndex].freq;
  currentTargetFreq = NOTES[currentNoteIndex + currentInterval].freq;

  playInterval(currentBaseFreq, currentTargetFreq);
}

function handleAnswer(userGuess, btnElement) {
  const feedback = document.getElementById('feedback');
  isWaiting = true; // Blocca input

  if (userGuess === currentInterval) {
    // Risposta Esatta
    feedback.textContent = '✅ Corretto!';
    feedback.className = 'feedback success';
    btnElement.classList.add('correct'); // Colora bottone di verde
  } else {
    // Risposta Sbagliata
    const correctName = INTERVALS[currentInterval];
    feedback.textContent = `❌ Era: ${correctName}`;
    feedback.className = 'feedback error';
    btnElement.classList.add('wrong'); // Colora bottone di rosso
  }

  // Aspetta 1.5 secondi e poi prossimo round
  setTimeout(() => {
    startNewRound();
  }, 1500);
}

function clearFeedback() {
  const feedback = document.getElementById('feedback');
  feedback.textContent = 'Ascolta...'; // Testo neutro
  feedback.className = 'feedback';
}

function resetButtonStyles() {
    const btns = document.querySelectorAll('.answer-btn');
    btns.forEach(btn => {
        btn.classList.remove('correct', 'wrong');
    });
}