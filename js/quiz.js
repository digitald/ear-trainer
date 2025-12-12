import { NOTES, INTERVALS } from './intervals.js'; 
import { playInterval } from './audio.js';

// Configurazioni partita
const TOTAL_QUESTIONS = 10;

// Stato del gioco
let currentInterval = null;
let currentBaseFreq = 0;
let currentTargetFreq = 0;
let score = 0;
let questionCount = 0;
let isWaiting = false;

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startQuizBtn');
  const restartBtn = document.getElementById('restartBtn');
  const replayArea = document.getElementById('replayArea');
  const answerButtons = document.getElementById('answerButtons');
  
  // 1. Setup Bottone Riascolta
  const replayBtn = document.createElement('button');
  replayBtn.innerHTML = '🔊'; 
  replayBtn.className = 'replay-btn';
  replayBtn.onclick = () => {
    if(!isWaiting) playInterval(currentBaseFreq, currentTargetFreq);
  };
  replayArea.appendChild(replayBtn);

  // 2. Setup Griglia Risposte
  Object.entries(INTERVALS).forEach(([semitones, name]) => {
    const btn = document.createElement('button');
    btn.className = 'answer-btn';
    btn.textContent = simplifyName(name); 
    btn.dataset.value = semitones;

    btn.addEventListener('click', (e) => {
      if (isWaiting) return; 
      handleAnswer(parseInt(btn.dataset.value), e.target);
    });
    answerButtons.appendChild(btn);
  });

  // 3. Event Listeners
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);
});

function startGame() {
    // Reset variabili
    score = 0;
    questionCount = 0;
    
    // Gestione UI (Nascondi start/risultati, mostra gioco)
    document.getElementById('startScreen').classList.add('hidden');
    document.getElementById('resultScreen').classList.add('hidden');
    document.getElementById('gameUI').classList.remove('hidden');

    updateStatsUI();
    startNewRound();
}

function startNewRound() {
  isWaiting = false;
  clearFeedback();
  resetButtonStyles();

  // Fine partita?
  if (questionCount >= TOTAL_QUESTIONS) {
      endGame();
      return;
  }

  // 1. Scegli Intervallo
  const intervalKeys = Object.keys(INTERVALS);
  currentInterval = parseInt(intervalKeys[Math.floor(Math.random() * intervalKeys.length)]);

  // 2. Scegli Direzione (0 = Ascendente, 1 = Discendente)
  const isDescending = Math.random() > 0.5;

  let noteIndex1, noteIndex2;

  if (!isDescending) {
      // ASCENDENTE (Nota bassa -> Nota alta)
      // La partenza deve essere tale che: start + interval < lunghezza array
      const maxStart = NOTES.length - currentInterval - 1;
      noteIndex1 = Math.floor(Math.random() * (maxStart + 1));
      noteIndex2 = noteIndex1 + currentInterval;
      
      // Feedback visivo opzionale in console
      console.log(`Ascendente: ${NOTES[noteIndex1].name} -> ${NOTES[noteIndex2].name}`);
  } else {
      // DISCENDENTE (Nota alta -> Nota bassa)
      // La partenza deve essere almeno grande quanto l'intervallo
      const minStart = currentInterval; 
      noteIndex1 = Math.floor(Math.random() * (NOTES.length - minStart)) + minStart;
      noteIndex2 = noteIndex1 - currentInterval;

      console.log(`Discendente: ${NOTES[noteIndex1].name} -> ${NOTES[noteIndex2].name}`);
  }

  // Imposta frequenze globali
  currentBaseFreq = NOTES[noteIndex1].freq;
  currentTargetFreq = NOTES[noteIndex2].freq;

  // Riproduci
  playInterval(currentBaseFreq, currentTargetFreq);
}

function handleAnswer(userGuess, btnElement) {
  const feedback = document.getElementById('feedback');
  isWaiting = true; 

  if (userGuess === currentInterval) {
    feedback.textContent = '✅ Corretto!';
    feedback.className = 'feedback success';
    btnElement.classList.add('correct');
    score++;
  } else {
    const correctName = INTERVALS[currentInterval];
    feedback.textContent = `❌ Era: ${correctName}`;
    feedback.className = 'feedback error';
    btnElement.classList.add('wrong');
  }

  questionCount++;
  updateStatsUI();

  // Pausa ridotta a 1.2s per ritmo più incalzante
  setTimeout(() => {
    startNewRound();
  }, 1200);
}

function endGame() {
    document.getElementById('gameUI').classList.add('hidden');
    const resultScreen = document.getElementById('resultScreen');
    resultScreen.classList.remove('hidden');

    document.getElementById('finalScoreDisplay').textContent = `${score} / ${TOTAL_QUESTIONS}`;
    
    const msgElement = document.getElementById('finalMessage');
    if (score === 10) msgElement.textContent = "🏆 Orecchio Assoluto!";
    else if (score >= 8) msgElement.textContent = "🎵 Ottimo musicista!";
    else if (score >= 5) msgElement.textContent = "👍 Buona base, continua così.";
    else msgElement.textContent = "👂 Serve più allenamento!";
}

function updateStatsUI() {
    document.getElementById('progressText').textContent = `Domanda ${Math.min(questionCount + 1, TOTAL_QUESTIONS)}/${TOTAL_QUESTIONS}`;
    document.getElementById('scoreText').textContent = `Punti: ${score}`;
}

// Helpers
function simplifyName(name) {
    return name
        .replace("minore", "min")
        .replace("maggiore", "Mag")
        .replace("giusta", "G")
        .replace("aumentata", "Aum")
        .replace("diminuita", "Dim");
}

function clearFeedback() {
  const feedback = document.getElementById('feedback');
  feedback.textContent = 'Ascolta...';
  feedback.className = 'feedback';
}

function resetButtonStyles() {
    const btns = document.querySelectorAll('.answer-btn');
    btns.forEach(btn => btn.classList.remove('correct', 'wrong'));
}