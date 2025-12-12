let audioCtx = null;
const samples = {}; // Qui verranno salvati i dati audio decodificati

// MAPPA DEI CAMPIONI
// Collega l'indice della nota (da intervals.js) al file MP3 corrispondente.
// Indici basati sul tuo array NOTES: 
// 3 = Do3, 15 = Do4, 27 = Do5, 39 = Do6
const SAMPLE_MAP = {
  3:  './sounds/C3.mp3',
  15: './sounds/C4.mp3',
  27: './sounds/C5.mp3',
  39: './sounds/C6.mp3'
};

// --- INIZIALIZZAZIONE E CARICAMENTO ---

export function initAudioEngine() {
    if (!audioCtx) {
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        loadSamples(); // Avvia il download dei file in background
    }
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }
}

async function loadSamples() {
  // Scorre la mappa e carica ogni file
  for (const [noteIndex, path] of Object.entries(SAMPLE_MAP)) {
    try {
      const response = await fetch(path);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      samples[noteIndex] = audioBuffer;
      // console.log(`Campione caricato: ${path}`);
    } catch (error) {
      console.error(`Impossibile caricare il suono ${path}. Assicurati di aver creato la cartella 'sounds' e scaricato i file mp3.`, error);
    }
  }
}

// --- FUNZIONI PUBBLICHE (Chiamate da Main e Quiz) ---

// Riproduce due note (Intervallo)
// Accetta INDICI (numeri interi), es: 15 e 22
export function playInterval(index1, index2) {
  initAudioEngine();
  const now = audioCtx.currentTime;
  
  // Nota 1
  playNote(index1, now, 1.0);
  
  // Nota 2 (dopo 0.8 secondi)
  playNote(index2, now + 0.8, 1.0); 
}

// Riproduce una sequenza (Melodia Suggerimento)
// Accetta l'indice base e un array di semitoni relativi (es. [0, 4, 7])
export function playMelody(baseIndex, sequence, speed = 0.4) {
    initAudioEngine();
    const now = audioCtx.currentTime;

    sequence.forEach((semitones, i) => {
        if (semitones === null) return; // Gestione pause

        // Calcola l'indice reale della nota target
        const targetIndex = baseIndex + semitones;
        
        // Suona la nota
        playNote(targetIndex, now + (i * speed), speed);
    });
}

// --- MOTORE SONORO INTERNO (Sampler Logic) ---

function playNote(targetIndex, startTime, duration) {
  // 1. Trova il sample base più vicino
  // (Es. se serve il Re3, usiamo il sample del Do3 e lo velocizziamo)
  const sampleIndex = getClosestSample(targetIndex);
  const buffer = samples[sampleIndex];

  if (!buffer) return; // Se il file non è ancora caricato, esce senza errori

  // 2. Crea la sorgente
  const source = audioCtx.createBufferSource();
  source.buffer = buffer;

  // 3. Pitch Shift (Intonazione)
  // Calcola la distanza in semitoni
  const semitoneDistance = targetIndex - sampleIndex;
  // Applica il detune (100 cents = 1 semitono)
  source.detune.value = semitoneDistance * 100;

  // 4. Gestione Volume (Envelope ADSR)
  const gainNode = audioCtx.createGain();
  
  // Connessioni
  source.connect(gainNode);
  gainNode.connect(audioCtx.destination);

  // Configurazione volume per evitare "click"
  gainNode.gain.setValueAtTime(0, startTime);
  gainNode.gain.linearRampToValueAtTime(1, startTime + 0.05); // Attacco veloce
  gainNode.gain.setValueAtTime(1, startTime + duration - 0.1); // Sustain
  gainNode.gain.linearRampToValueAtTime(0, startTime + duration + 0.4); // Release coda lunga

  // Start / Stop
  source.start(startTime);
  source.stop(startTime + duration + 0.5); // Stop dopo la coda
}

// Helper matematico per trovare il file mp3 migliore da usare
function getClosestSample(targetIndex) {
  const availableIndices = Object.keys(samples).map(Number);
  
  if (availableIndices.length === 0) return 0; // Fallback se nessun sample caricato

  return availableIndices.reduce((prev, curr) => {
    return (Math.abs(curr - targetIndex) < Math.abs(prev - targetIndex) ? curr : prev);
  });
}