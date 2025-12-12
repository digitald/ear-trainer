import { NOTES, INTERVALS, MELODIES } from './intervals.js'; 
import { playInterval, playMelody } from './audio.js';

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
  
  // --- CONTROLLI UTENTE ---
  const controlsDiv = document.createElement('div');
  controlsDiv.style.display = 'flex';
  controlsDiv.style.justifyContent = 'center';
  controlsDiv.style.gap = '15px';

  // 1. Bottone Riascolta (Intervallo)
  const replayBtn = document.createElement('button');
  replayBtn.innerHTML = '🔊'; // Icona speaker
  replayBtn.className = 'replay-btn';
  replayBtn.onclick = () => {
    if(!isWaiting) playInterval(currentBaseFreq, currentTargetFreq);
  };
  
  // 2. Bottone Suggerimento (Melodia)
  const hintBtn = document.createElement('button');
  hintBtn.innerHTML = '💡'; // Lampadina
  hintBtn.className = 'replay-btn';
  hintBtn.style.backgroundColor = '#8b5cf6'; // Viola
  hintBtn.onclick = () => {
    if(!isWaiting) playHintMelody();
  };

  controlsDiv.appendChild(replayBtn);
  controlsDiv.appendChild(hintBtn);
  replayArea.appendChild(controlsDiv);

  // --- BOTTONI RISPOSTA ---
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

  // --- START ---
  startBtn.addEventListener('click', startGame);
  restartBtn.addEventListener('click', startGame);
});

function startGame() {
    score = 0;
    questionCount = 0;
    
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

  if (questionCount >= TOTAL_QUESTIONS) {
      endGame();
      return;
  }

  // Scegli Intervallo
  const intervalKeys = Object.keys(INTERVALS);
  currentInterval = parseInt(intervalKeys[Math.floor(Math.random() * intervalKeys.length)]);

  // Scegli Direzione
  const isDescending = Math.random() > 0.5;

  let noteIndex1, noteIndex2;

  if (!isDescending) {
      // ASCENDENTE
      const maxStart = NOTES.length - currentInterval - 1;
      noteIndex1 = Math.floor(Math.random() * (maxStart + 1));
      noteIndex2 = noteIndex1 + currentInterval;
  } else {
      // DISCENDENTE
      const minStart = currentInterval; 
      noteIndex1 = Math.floor(Math.random() * (NOTES.length - minStart)) + minStart;
      noteIndex2 = noteIndex1 - currentInterval;
  }

  currentBaseFreq = NOTES[noteIndex1].freq;
  currentTargetFreq = NOTES[noteIndex2].freq;

  playInterval(currentBaseFreq, currentTargetFreq);
}

function playHintMelody() {
    const melodyData = MELODIES[currentInterval];
    if (melodyData) {
        const feedback = document.getElementById('feedback');
        const oldText = feedback.textContent;
        
        // Feedback visuale temporaneo
        feedback.textContent = `🎵 ${melodyData.name}`;
        feedback.style.color = '#8b5cf6';
        
        // Suona la melodia (sempre ascendente per mnemonica, partendo dalla nota più bassa dell'intervallo corrente)
        // Se l'intervallo è discendente, usiamo la nota di arrivo come base della melodia, oppure quella di partenza.
        // Per semplicità didattica, usiamo la currentBaseFreq (la prima nota sentita).
        playMelody(currentBaseFreq, melodyData.sequence, melodyData.rhythm);

        setTimeout(() => {
            if(!isWaiting) {
                feedback.textContent = oldText;
                feedback.style.color = 'inherit';
            }
        }, 2000);
    }
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
    else if (score >= 5) msgElement.textContent = "👍 Buona base.";
    else msgElement.textContent = "👂 Serve più allenamento!";
}

function updateStatsUI() {
    document.getElementById('progressText').textContent = `Domanda ${Math.min(questionCount + 1, TOTAL_QUESTIONS)}/${TOTAL_QUESTIONS}`;
    document.getElementById('scoreText').textContent = `Punti: ${score}`;
}

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