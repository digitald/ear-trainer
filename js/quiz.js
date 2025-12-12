import { NOTES, INTERVALS, MELODIES } from './intervals.js'; 
import { playInterval, playMelody } from './audio.js';

// --- CONFIGURAZIONE ---
const TOTAL_QUESTIONS = 10;

// --- STATO DEL GIOCO ---
let currentInterval = null; // Il numero di semitoni (la risposta giusta)
let currentBaseIndex = 0;   // Indice della prima nota nell'array NOTES
let currentTargetIndex = 0; // Indice della seconda nota
let score = 0;
let questionCount = 0;
let isWaiting = false;      // Per bloccare i click mentre suona/attende

document.addEventListener('DOMContentLoaded', () => {
  const startBtn = document.getElementById('startQuizBtn');
  const restartBtn = document.getElementById('restartBtn');
  const replayArea = document.getElementById('replayArea');
  const answerButtons = document.getElementById('answerButtons');
  
  // --- CREAZIONE CONTROLLI (Riascolta + Aiuto) ---
  const controlsDiv = document.createElement('div');
  controlsDiv.style.display = 'flex';
  controlsDiv.style.justifyContent = 'center';
  controlsDiv.style.gap = '15px';
  controlsDiv.style.marginBottom = '15px';

  // 1. Bottone Riascolta (Speaker)
  const replayBtn = document.createElement('button');
  replayBtn.innerHTML = '🔊'; 
  replayBtn.className = 'replay-btn';
  replayBtn.onclick = () => {
    // Risuona l'intervallo corrente usando gli indici salvati
    if(!isWaiting) playInterval(currentBaseIndex, currentTargetIndex);
  };
  
  // 2. Bottone Suggerimento (Lampadina)
  const hintBtn = document.createElement('button');
  hintBtn.innerHTML = '💡'; 
  hintBtn.className = 'replay-btn';
  hintBtn.style.backgroundColor = '#8b5cf6'; // Viola
  hintBtn.onclick = () => {
    if(!isWaiting) playHintMelody();
  };

  controlsDiv.appendChild(replayBtn);
  controlsDiv.appendChild(hintBtn);
  replayArea.appendChild(controlsDiv);

  // --- CREAZIONE BOTTONI RISPOSTA ---
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

  // --- EVENT LISTENERS START/RESTART ---
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);
});

// --- LOGICA DI GIOCO ---

function startGame() {
    score = 0;
    questionCount = 0;
    
    // Gestione visualizzazione schermate
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

  // Controllo fine partita
  if (questionCount >= TOTAL_QUESTIONS) {
      endGame();
      return;
  }

  // 1. Scegli Intervallo casuale
  const intervalKeys = Object.keys(INTERVALS);
  currentInterval = parseInt(intervalKeys[Math.floor(Math.random() * intervalKeys.length)]);

  // 2. Scegli Direzione (Ascendente o Discendente)
  const isDescending = Math.random() > 0.5;

  // 3. Calcola gli indici delle note (Math)
  if (!isDescending) {
      // ASCENDENTE: Start basso -> Target alto
      const maxStart = NOTES.length - currentInterval - 1;
      currentBaseIndex = Math.floor(Math.random() * (maxStart + 1));
      currentTargetIndex = currentBaseIndex + currentInterval;
  } else {
      // DISCENDENTE: Start alto -> Target basso
      const minStart = currentInterval; 
      currentBaseIndex = Math.floor(Math.random() * (NOTES.length - minStart)) + minStart;
      currentTargetIndex = currentBaseIndex - currentInterval;
  }

  // 4. Riproduci (Passando gli INDICI, non le frequenze)
  playInterval(currentBaseIndex, currentTargetIndex);
}

function playHintMelody() {
    const melodyData = MELODIES[currentInterval];
    if (melodyData) {
        const feedback = document.getElementById('feedback');
        const oldText = feedback.textContent;
        
        // Feedback visuale temporaneo
        feedback.textContent = `🎵 ${melodyData.name}`;
        feedback.style.color = '#8b5cf6';
        
        // Suona la melodia usando la nota base corrente come riferimento
        playMelody(currentBaseIndex, melodyData.sequence, melodyData.rhythm);

        // Ripristina il testo dopo 2.5 secondi
        setTimeout(() => {
            if(!isWaiting) {
                feedback.textContent = oldText;
                feedback.style.color = 'inherit';
            }
        }, 2500);
    } else {
        // Fallback per l'unisono o se manca la melodia
        const feedback = document.getElementById('feedback');
        feedback.textContent = "Nessun suggerimento disponibile";
        setTimeout(() => feedback.textContent = "Ascolta...", 1000);
    }
}

function handleAnswer(userGuess, btnElement) {
  const feedback = document.getElementById('feedback');
  isWaiting = true; // Blocca input

  if (userGuess === currentInterval) {
    // Risposta Corretta
    feedback.textContent = '✅ Corretto!';
    feedback.className = 'feedback success';
    btnElement.classList.add('correct');
    score++;
  } else {
    // Risposta Sbagliata
    const correctName = INTERVALS[currentInterval];
    feedback.textContent = `❌ Era: ${correctName}`;
    feedback.className = 'feedback error';
    btnElement.classList.add('wrong');
  }

  questionCount++;
  updateStatsUI();

  // Pausa prima del prossimo round
  setTimeout(() => {
    startNewRound();
  }, 1500);
}

function endGame() {
    document.getElementById('gameUI').classList.add('hidden');
    const resultScreen = document.getElementById('resultScreen');
    resultScreen.classList.remove('hidden');

    document.getElementById('finalScoreDisplay').textContent = `${score} / ${TOTAL_QUESTIONS}`;
    
    const msgElement = document.getElementById('finalMessage');
    if (score === 10) msgElement.textContent = "🏆 Orecchio Assoluto!";
    else if (score >= 8) msgElement.textContent = "🎵 Ottimo musicista!";
    else if (score >= 5) msgElement.textContent = "👍 Buona base.";
    else msgElement.textContent = "👂 Serve più allenamento!";
}

function updateStatsUI() {
    document.getElementById('progressText').textContent = `Domanda ${Math.min(questionCount + 1, TOTAL_QUESTIONS)}/${TOTAL_QUESTIONS}`;
    document.getElementById('scoreText').textContent = `Punti: ${score}`;
}

// --- HELPERS ---

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